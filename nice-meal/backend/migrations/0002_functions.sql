-- ============================================================================
-- Nice Meal — 0002 functions
--
-- place_order is the only way an order enters the system from the website, and
-- it is the reason the browser is never allowed to write to `orders` directly.
-- The client sends what was chosen — item ids, quantities, option ids — and
-- nothing about money. Every price is read from the database inside this
-- function. A client that could post its own total could buy a ₦2,500 egusi
-- for ₦1, and no amount of front-end validation prevents that.
-- ============================================================================

-- ── Who is asking ───────────────────────────────────────────────────────────
-- security definer so that reading `staff` does not itself go through the
-- policies on `staff`, which would recurse.
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from public.staff s where s.user_id = auth.uid() and s.is_active);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.staff s
    where s.user_id = auth.uid() and s.is_active and s.role = 'admin'
  );
$$;

-- Who the caller is, as far as this shop is concerned. Returns null for
-- somebody who is signed in but is not staff.
--
-- This exists because reading `staff` through the API does not answer the
-- question. The policy on that table is "your own row, or everything if you
-- are an admin" — so selecting a single row from it hands an administrator an
-- arbitrary colleague's row and, if the screen then reads a role off it, the
-- wrong one. Asking for auth.uid()'s row specifically is the only version that
-- is right for both kinds of caller.
create or replace function public.me()
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select to_jsonb(s) from public.staff s where s.user_id = auth.uid();
$$;
revoke all on function public.me() from public;
grant execute on function public.me() to authenticated;

-- ── Placing an order ────────────────────────────────────────────────────────
-- p_channel is last and defaults to 'web' so the website calls this exactly as
-- it always did. Only staff may pass anything else: an order typed in over the
-- phone or at the counter is recorded as such, because "how did this reach us"
-- is the one thing the reports cannot reconstruct afterwards.
create or replace function public.place_order(
  p_customer_name    text,
  p_customer_phone   text,
  p_fulfilment       fulfilment_type,
  p_items            jsonb,
  p_delivery_area_id uuid default null,
  p_address          text default null,
  p_notes            text default null,
  p_channel          order_channel default 'web'
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_settings        public.settings%rowtype;
  v_line            jsonb;
  v_item            public.menu_items%rowtype;
  v_qty             int;
  v_option_ids      uuid[];
  v_option_delta    int;
  v_option_labels   jsonb;
  v_unit_kobo       int;
  v_line_total      int;
  v_subtotal        int := 0;
  v_fee             int := 0;
  v_area            public.delivery_areas%rowtype;
  v_day             date := public.lagos_day();
  v_seq             int;
  v_code            text;
  v_order           public.orders%rowtype;
  v_lines           jsonb := '[]'::jsonb;
  v_group           record;
  v_chosen          int;
  v_staff           boolean := public.is_staff();
begin
  if p_channel <> 'web' and not v_staff then
    raise exception 'Not authorised.' using errcode = '42501';
  end if;

  select * into v_settings from public.settings where id;
  if not found then
    raise exception 'Ordering is not configured yet.' using errcode = 'P0002';
  end if;
  -- The pause switch stops the website, not the shop. Staff can still take a
  -- call and type the order in, which is exactly what happens when a kitchen
  -- pauses online ordering to catch up.
  if not v_settings.accepting_orders and not v_staff then
    raise exception 'The kitchen is not taking orders right now%',
      coalesce(': ' || v_settings.pause_reason, '.') using errcode = 'P0001';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'An order needs at least one item.' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) > 40 then
    raise exception 'That is more lines than one order can hold.' using errcode = '22023';
  end if;

  -- No payment stands between a stranger and the kitchen printer, so throttle
  -- by phone number. Three orders in two minutes is far past normal use.
  -- Staff are exempt: they are signed in, and a busy counter legitimately puts
  -- several orders through the shop's own callback number in a minute.
  if not v_staff and (select count(*) from public.orders o
      where o.customer_phone = p_customer_phone
        and o.placed_at > now() - interval '2 minutes') >= 3 then
    raise exception 'Too many orders from this number just now. Please call us instead.'
      using errcode = 'P0001';
  end if;

  -- ── Price every line from the database ────────────────────────────────────
  for v_line in select * from jsonb_array_elements(p_items) loop
    v_qty := coalesce((v_line->>'quantity')::int, 0);
    if v_qty < 1 or v_qty > 50 then
      raise exception 'Quantity must be between 1 and 50.' using errcode = '22023';
    end if;

    select * into v_item from public.menu_items
      where id = (v_line->>'item_id')::uuid and is_active;
    if not found then
      raise exception 'That dish is no longer on the menu.' using errcode = '22023';
    end if;
    if not v_item.is_available then
      raise exception '% is sold out.', v_item.name using errcode = 'P0001';
    end if;

    v_option_ids := coalesce(
      (select array_agg((value #>> '{}')::uuid)
         from jsonb_array_elements(coalesce(v_line->'option_ids', '[]'::jsonb))),
      '{}'::uuid[]);

    -- Every chosen option must belong to this dish and be available today.
    if exists (
      select 1 from unnest(v_option_ids) oid
      where not exists (
        select 1 from public.menu_options mo
        join public.menu_option_groups g on g.id = mo.group_id
        where mo.id = oid and g.menu_item_id = v_item.id and mo.is_available)
    ) then
      raise exception 'One of the choices for % is not available.', v_item.name
        using errcode = '22023';
    end if;

    -- ...and each group must have as many choices as it asks for.
    for v_group in
      select g.id, g.name, g.min_select, g.max_select
      from public.menu_option_groups g where g.menu_item_id = v_item.id
    loop
      select count(*) into v_chosen
      from public.menu_options mo
      where mo.group_id = v_group.id and mo.id = any(v_option_ids);
      if v_chosen < v_group.min_select or v_chosen > v_group.max_select then
        raise exception 'Choose between % and % for "%" on %.',
          v_group.min_select, v_group.max_select, v_group.name, v_item.name
          using errcode = '22023';
      end if;
    end loop;

    select coalesce(sum(mo.price_delta_kobo), 0),
           coalesce(jsonb_agg(jsonb_build_object('name', mo.name, 'delta_kobo', mo.price_delta_kobo)
                              order by mo.sort_order, mo.name), '[]'::jsonb)
      into v_option_delta, v_option_labels
      from public.menu_options mo where mo.id = any(v_option_ids);

    v_unit_kobo  := v_item.price_kobo + v_option_delta;
    v_line_total := v_unit_kobo * v_qty;
    v_subtotal   := v_subtotal + v_line_total;

    v_lines := v_lines || jsonb_build_object(
      'menu_item_id',     v_item.id,
      'name_at_order',    v_item.name,
      'unit_price_kobo',  v_unit_kobo,
      'quantity',         v_qty,
      'options_at_order', v_option_labels,
      'line_total_kobo',  v_line_total,
      'note',             nullif(btrim(coalesce(v_line->>'note', '')), '')
    );
  end loop;

  if v_subtotal < v_settings.min_order_kobo then
    raise exception 'Minimum order is ₦%.', (v_settings.min_order_kobo / 100)::text
      using errcode = 'P0001';
  end if;

  -- ── Delivery ──────────────────────────────────────────────────────────────
  if p_fulfilment = 'delivery' then
    select * into v_area from public.delivery_areas
      where id = p_delivery_area_id and is_active;
    if not found then
      raise exception 'We are not delivering to that area.' using errcode = '22023';
    end if;
    -- Null when no fee has been set for that area: the order then carries no
    -- delivery fee rather than a zero, because a zero here would be read by
    -- everyone downstream — the customer, the kitchen, the day's takings — as
    -- a decision to deliver for free. See 0008_delivery_fee.sql.
    v_fee := v_area.fee_kobo;
    if v_settings.free_delivery_threshold_kobo is not null
       and v_subtotal >= v_settings.free_delivery_threshold_kobo then
      -- This one is a real zero: the shop said free above the threshold.
      v_fee := 0;
    end if;
  end if;

  -- ── Today's ticket number ─────────────────────────────────────────────────
  -- Held for the rest of the transaction so two customers checking out in the
  -- same instant cannot both read the same max and collide on the unique index.
  perform pg_advisory_xact_lock(hashtext('nm_order_seq_' || v_day::text));
  select coalesce(max(daily_seq), 0) + 1 into v_seq from public.orders where day = v_day;
  v_code := 'NM-' || to_char(v_day, 'MMDD') || '-' || lpad(v_seq::text, 2, '0');

  insert into public.orders (
    code, day, daily_seq, channel, fulfilment,
    customer_name, customer_phone, delivery_area_id, address, notes,
    subtotal_kobo, delivery_fee_kobo, total_kobo
  ) values (
    v_code, v_day, v_seq, p_channel, p_fulfilment,
    btrim(p_customer_name), btrim(p_customer_phone),
    case when p_fulfilment = 'delivery' then p_delivery_area_id end,
    case when p_fulfilment = 'delivery' then btrim(p_address) end,
    nullif(btrim(coalesce(p_notes, '')), ''),
    -- An unquoted fee cannot be added to anything, so the total is the food on
    -- its own and the delivery fee stays absent to say why.
    v_subtotal, v_fee, v_subtotal + coalesce(v_fee, 0)
  ) returning * into v_order;

  insert into public.order_items (
    order_id, menu_item_id, name_at_order, unit_price_kobo,
    quantity, options_at_order, line_total_kobo, note)
  select v_order.id,
         (l->>'menu_item_id')::uuid, l->>'name_at_order', (l->>'unit_price_kobo')::int,
         (l->>'quantity')::int, l->'options_at_order', (l->>'line_total_kobo')::int, l->>'note'
  from jsonb_array_elements(v_lines) l;

  -- Only what the customer needs to see their own order back.
  return jsonb_build_object(
    'code',              v_order.code,
    'track_token',       v_order.track_token,
    'subtotal_kobo',     v_order.subtotal_kobo,
    'delivery_fee_kobo', v_order.delivery_fee_kobo,
    'total_kobo',        v_order.total_kobo,
    'placed_at',         v_order.placed_at,
    'prep_time_minutes', v_settings.prep_time_minutes
  );
end;
$$;

revoke all on function public.place_order(text, text, fulfilment_type, jsonb, uuid, text, text, order_channel) from public;
grant execute on function public.place_order(text, text, fulfilment_type, jsonb, uuid, text, text, order_channel) to anon, authenticated;

-- ── A customer checking their own order ─────────────────────────────────────
-- Code plus token, so the sequential codes cannot be walked.
create or replace function public.get_order_status(p_code text, p_token uuid)
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'code', o.code, 'status', o.status, 'placed_at', o.placed_at,
    'total_kobo', o.total_kobo, 'fulfilment', o.fulfilment)
  from public.orders o
  where o.code = p_code and o.track_token = p_token;
$$;
revoke all on function public.get_order_status(text, uuid) from public;
grant execute on function public.get_order_status(text, uuid) to anon, authenticated;

-- ── Moving an order along ───────────────────────────────────────────────────
-- The timestamps are what the reports are built from, so they are stamped here
-- rather than trusted from a client clock.
create or replace function public.set_order_status(
  p_order_id uuid, p_status order_status, p_cancel_reason text default null
) returns public.orders
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_order public.orders%rowtype;
begin
  if not public.is_staff() then
    raise exception 'Not authorised.' using errcode = '42501';
  end if;
  if p_status = 'cancelled' and nullif(btrim(coalesce(p_cancel_reason,'')),'') is null then
    raise exception 'Say why the order was cancelled.' using errcode = '22023';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'No such order.' using errcode = 'P0002';
  end if;
  if v_order.status in ('completed', 'cancelled') then
    raise exception 'Order % is already %.', v_order.code, v_order.status using errcode = 'P0001';
  end if;

  update public.orders set
    status          = p_status,
    acknowledged_at = coalesce(acknowledged_at, now()),
    acknowledged_by = coalesce(acknowledged_by, auth.uid()),
    preparing_at    = case when p_status = 'preparing' then coalesce(preparing_at, now()) else preparing_at end,
    ready_at        = case when p_status = 'ready'     then coalesce(ready_at, now())     else ready_at end,
    completed_at    = case when p_status = 'completed' then now() else completed_at end,
    cancelled_at    = case when p_status = 'cancelled' then now() else cancelled_at end,
    cancel_reason   = case when p_status = 'cancelled' then btrim(p_cancel_reason) else cancel_reason end
  where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$$;
revoke all on function public.set_order_status(uuid, order_status, text) from public;
grant execute on function public.set_order_status(uuid, order_status, text) to authenticated;

-- Silence the alarm without yet committing to cooking it.
create or replace function public.acknowledge_order(p_order_id uuid)
returns public.orders
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_order public.orders%rowtype;
begin
  if not public.is_staff() then
    raise exception 'Not authorised.' using errcode = '42501';
  end if;
  update public.orders set
    acknowledged_at = coalesce(acknowledged_at, now()),
    acknowledged_by = coalesce(acknowledged_by, auth.uid())
  where id = p_order_id
  returning * into v_order;
  if not found then
    raise exception 'No such order.' using errcode = 'P0002';
  end if;
  return v_order;
end;
$$;
revoke all on function public.acknowledge_order(uuid) from public;
grant execute on function public.acknowledge_order(uuid) to authenticated;
