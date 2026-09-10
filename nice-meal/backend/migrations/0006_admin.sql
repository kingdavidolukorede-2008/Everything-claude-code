-- ============================================================================
-- Nice Meal — 0006 the admin screens
--
-- Everything here is `security definer` with an explicit is_admin() check on
-- the first line, for the same reason kitchen_board() is: the check travels
-- with the function and cannot be lost by someone re-granting a view or
-- loosening a policy later.
--
-- The admin screen reads through these rather than through PostgREST filters
-- on the tables. That is deliberate. An admin can see every phone number and
-- every naira the restaurant has taken, so the queries that expose them are
-- written once, here, next to the check that guards them — instead of being
-- assembled from a query string in a browser where a missing filter silently
-- widens what comes back.
-- ============================================================================

create or replace function public.assert_admin() returns void
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorised.' using errcode = '42501';
  end if;
end;
$$;

-- ── Orders, with the money and the customer ─────────────────────────────────
-- One row per order with its lines attached, plus the count before paging, so
-- the screen can say "showing 50 of 318" rather than guessing.
create or replace function public.admin_orders(
  p_from    date default null,
  p_to      date default null,
  p_status  order_status[] default null,
  p_search  text default null,
  p_limit   int default 50,
  p_offset  int default 0
) returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  v_rows  jsonb;
  v_total bigint;
  v_lim   int := greatest(1, least(coalesce(p_limit, 50), 200));
  v_off   int := greatest(0, coalesce(p_offset, 0));
  v_find  text := nullif(btrim(coalesce(p_search, '')), '');
begin
  perform public.assert_admin();

  with matched as (
    select o.*
    from public.orders o
    where (p_from is null or o.day >= p_from)
      and (p_to   is null or o.day <= p_to)
      and (p_status is null or o.status = any(p_status))
      and (v_find is null
           or o.code           ilike '%' || v_find || '%'
           or o.customer_phone ilike '%' || v_find || '%'
           or o.customer_name  ilike '%' || v_find || '%')
  )
  select count(*) into v_total from matched;

  with matched as (
    select o.*
    from public.orders o
    where (p_from is null or o.day >= p_from)
      and (p_to   is null or o.day <= p_to)
      and (p_status is null or o.status = any(p_status))
      and (v_find is null
           or o.code           ilike '%' || v_find || '%'
           or o.customer_phone ilike '%' || v_find || '%'
           or o.customer_name  ilike '%' || v_find || '%')
    order by o.placed_at desc
    limit v_lim offset v_off
  )
  select coalesce(jsonb_agg(to_jsonb(r) order by r.placed_at desc), '[]'::jsonb)
    into v_rows
  from (
    select m.id, m.code, m.day, m.channel, m.status, m.fulfilment,
           m.customer_name, m.customer_phone, m.address, m.notes,
           a.name as area,
           m.subtotal_kobo, m.delivery_fee_kobo, m.total_kobo,
           m.placed_at, m.acknowledged_at, m.preparing_at, m.ready_at,
           m.completed_at, m.cancelled_at, m.cancel_reason,
           s.display_name as acknowledged_by,
           coalesce((
             select jsonb_agg(jsonb_build_object(
                      'name',       oi.name_at_order,
                      'quantity',   oi.quantity,
                      'options',    oi.options_at_order,
                      'note',       oi.note,
                      'unit_kobo',  oi.unit_price_kobo,
                      'line_kobo',  oi.line_total_kobo)
                    order by oi.name_at_order)
             from public.order_items oi where oi.order_id = m.id
           ), '[]'::jsonb) as items
    from matched m
    left join public.delivery_areas a on a.id = m.delivery_area_id
    left join public.staff s          on s.user_id = m.acknowledged_by
  ) r;

  return jsonb_build_object('total', v_total, 'rows', v_rows,
                            'limit', v_lim, 'offset', v_off);
end;
$$;
revoke all on function public.admin_orders(date, date, order_status[], text, int, int) from public;
grant execute on function public.admin_orders(date, date, order_status[], text, int, int) to authenticated;

-- ── The whole shop, in one round trip ───────────────────────────────────────
-- Includes what is switched off, which is the point: the management screen is
-- where you turn things back on.
create or replace function public.admin_menu()
returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare v_out jsonb;
begin
  perform public.assert_admin();

  select jsonb_build_object(
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', c.id, 'name', c.name, 'sort_order', c.sort_order,
               'is_active', c.is_active,
               'items', coalesce((
                 select jsonb_agg(jsonb_build_object(
                          'id', i.id, 'name', i.name, 'description', i.description,
                          'price_kobo', i.price_kobo,
                          'is_available', i.is_available, 'is_active', i.is_active,
                          'sort_order', i.sort_order,
                          'groups', coalesce((
                            select jsonb_agg(jsonb_build_object(
                                     'id', g.id, 'name', g.name,
                                     'min_select', g.min_select, 'max_select', g.max_select,
                                     'options', coalesce((
                                       select jsonb_agg(jsonb_build_object(
                                                'id', mo.id, 'name', mo.name,
                                                'price_delta_kobo', mo.price_delta_kobo,
                                                'is_available', mo.is_available)
                                              order by mo.sort_order, mo.name)
                                       from public.menu_options mo where mo.group_id = g.id
                                     ), '[]'::jsonb))
                                   order by g.sort_order, g.name)
                            from public.menu_option_groups g where g.menu_item_id = i.id
                          ), '[]'::jsonb))
                        order by i.sort_order, i.name)
                 from public.menu_items i where i.category_id = c.id
               ), '[]'::jsonb))
             order by c.sort_order, c.name)
      from public.menu_categories c), '[]'::jsonb),
    'areas', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', a.id, 'name', a.name, 'fee_kobo', a.fee_kobo,
               'is_active', a.is_active)
             order by a.sort_order, a.name)
      from public.delivery_areas a), '[]'::jsonb),
    'settings', (select to_jsonb(s) from public.settings s limit 1)
  ) into v_out;

  return v_out;
end;
$$;
revoke all on function public.admin_menu() from public;
grant execute on function public.admin_menu() to authenticated;

-- ── Editing the menu ────────────────────────────────────────────────────────
-- Null means "leave this alone", so the screen can send one field without
-- having to round-trip the rest and risk writing back a stale copy of it.
create or replace function public.admin_set_item(
  p_item_id      uuid,
  p_price_kobo   int     default null,
  p_is_available boolean default null,
  p_is_active    boolean default null,
  p_name         text    default null,
  p_description  text    default null
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_item public.menu_items%rowtype;
begin
  perform public.assert_admin();
  if p_price_kobo is not null and p_price_kobo <= 0 then
    raise exception 'A price has to be more than zero.' using errcode = '22023';
  end if;

  update public.menu_items set
    price_kobo   = coalesce(p_price_kobo, price_kobo),
    is_available = coalesce(p_is_available, is_available),
    is_active    = coalesce(p_is_active, is_active),
    name         = coalesce(nullif(btrim(coalesce(p_name, '')), ''), name),
    description  = coalesce(p_description, description),
    updated_at   = now()
  where id = p_item_id
  returning * into v_item;

  if not found then
    raise exception 'No such dish.' using errcode = 'P0002';
  end if;
  -- Renaming a dish does not rewrite history: order_items carries its own copy
  -- of the name and the price it was sold at.
  return to_jsonb(v_item);
end;
$$;
revoke all on function public.admin_set_item(uuid, int, boolean, boolean, text, text) from public;
grant execute on function public.admin_set_item(uuid, int, boolean, boolean, text, text) to authenticated;

create or replace function public.admin_set_option(
  p_option_id uuid, p_is_available boolean default null, p_price_delta_kobo int default null
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_opt public.menu_options%rowtype;
begin
  perform public.assert_admin();
  update public.menu_options set
    is_available     = coalesce(p_is_available, is_available),
    price_delta_kobo = coalesce(p_price_delta_kobo, price_delta_kobo)
  where id = p_option_id
  returning * into v_opt;
  if not found then
    raise exception 'No such choice.' using errcode = 'P0002';
  end if;
  return to_jsonb(v_opt);
end;
$$;
revoke all on function public.admin_set_option(uuid, boolean, int) from public;
grant execute on function public.admin_set_option(uuid, boolean, int) to authenticated;

create or replace function public.admin_set_area(
  p_area_id uuid, p_fee_kobo int default null, p_is_active boolean default null
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_area public.delivery_areas%rowtype;
begin
  perform public.assert_admin();
  if p_fee_kobo is not null and p_fee_kobo < 0 then
    raise exception 'A delivery fee cannot be negative.' using errcode = '22023';
  end if;
  update public.delivery_areas set
    fee_kobo  = coalesce(p_fee_kobo, fee_kobo),
    is_active = coalesce(p_is_active, is_active)
  where id = p_area_id
  returning * into v_area;
  if not found then
    raise exception 'No such delivery area.' using errcode = 'P0002';
  end if;
  return to_jsonb(v_area);
end;
$$;
revoke all on function public.admin_set_area(uuid, int, boolean) from public;
grant execute on function public.admin_set_area(uuid, int, boolean) to authenticated;

-- ── The shop-wide switches ──────────────────────────────────────────────────
-- p_free_delivery_threshold_kobo uses -1 for "leave alone" rather than null,
-- because null is a meaningful value for that column: it means there is no
-- free-delivery threshold at all.
create or replace function public.admin_set_settings(
  p_accepting_orders             boolean default null,
  p_pause_reason                 text    default null,
  p_min_order_kobo               int     default null,
  p_free_delivery_threshold_kobo int     default -1,
  p_prep_time_minutes            int     default null
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_s public.settings%rowtype;
begin
  perform public.assert_admin();
  update public.settings set
    accepting_orders = coalesce(p_accepting_orders, accepting_orders),
    -- A reason only means anything while ordering is off; turning it back on
    -- clears it so a stale "back in 20 minutes" cannot reappear next week.
    pause_reason = case
      when coalesce(p_accepting_orders, accepting_orders) then null
      else coalesce(nullif(btrim(coalesce(p_pause_reason, '')), ''), pause_reason)
    end,
    min_order_kobo = coalesce(p_min_order_kobo, min_order_kobo),
    free_delivery_threshold_kobo = case
      when p_free_delivery_threshold_kobo = -1 then free_delivery_threshold_kobo
      when p_free_delivery_threshold_kobo = 0  then null
      else p_free_delivery_threshold_kobo
    end,
    prep_time_minutes = coalesce(p_prep_time_minutes, prep_time_minutes),
    updated_at = now()
  where id
  returning * into v_s;
  return to_jsonb(v_s);
end;
$$;
revoke all on function public.admin_set_settings(boolean, text, int, int, int) from public;
grant execute on function public.admin_set_settings(boolean, text, int, int, int) to authenticated;

-- ── Reports ─────────────────────────────────────────────────────────────────
-- Built on sales_summary() and top_dishes() so there is one definition of what
-- a completed order is worth, and returned in one call so the screen does not
-- draw itself three times.
create or replace function public.admin_report(p_from date, p_to date)
returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare v_out jsonb;
begin
  perform public.assert_admin();
  if p_from > p_to then
    raise exception 'That date range runs backwards.' using errcode = '22023';
  end if;

  select jsonb_build_object(
    'from', p_from,
    'to',   p_to,
    'days', coalesce((select jsonb_agg(to_jsonb(d) order by d.day desc)
                      from public.sales_summary(p_from, p_to) d), '[]'::jsonb),
    'top',  coalesce((select jsonb_agg(to_jsonb(t))
                      from public.top_dishes(p_from, p_to, 10) t), '[]'::jsonb),
    'totals', (
      select jsonb_build_object(
               'orders',        count(*),
               'gross_kobo',    coalesce(sum(o.total_kobo), 0),
               'delivery_kobo', coalesce(sum(o.delivery_fee_kobo), 0),
               'avg_kobo',      coalesce(sum(o.total_kobo) / nullif(count(*), 0), 0))
      from public.orders o
      where o.status = 'completed' and o.day between p_from and p_to),
    -- Counted separately: a cancellation is not revenue, but a week of them is
    -- the most useful number on this page.
    'cancelled', (select count(*) from public.orders o
                  where o.status = 'cancelled' and o.day between p_from and p_to),
    'by_fulfilment', coalesce((
      select jsonb_agg(jsonb_build_object('key', x.fulfilment, 'orders', x.n, 'gross_kobo', x.g))
      from (select o.fulfilment, count(*) n, sum(o.total_kobo) g
            from public.orders o
            where o.status = 'completed' and o.day between p_from and p_to
            group by o.fulfilment order by 2 desc) x), '[]'::jsonb),
    'by_channel', coalesce((
      select jsonb_agg(jsonb_build_object('key', x.channel, 'orders', x.n, 'gross_kobo', x.g))
      from (select o.channel, count(*) n, sum(o.total_kobo) g
            from public.orders o
            where o.status = 'completed' and o.day between p_from and p_to
            group by o.channel order by 2 desc) x), '[]'::jsonb)
  ) into v_out;

  return v_out;
end;
$$;
revoke all on function public.admin_report(date, date) from public;
grant execute on function public.admin_report(date, date) to authenticated;

-- ── Staff ───────────────────────────────────────────────────────────────────
create or replace function public.admin_staff()
returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare v_out jsonb;
begin
  perform public.assert_admin();
  select coalesce(jsonb_agg(jsonb_build_object(
           'user_id', s.user_id, 'email', u.email, 'role', s.role,
           'display_name', s.display_name, 'is_active', s.is_active,
           'created_at', s.created_at, 'is_you', s.user_id = auth.uid())
         order by s.is_active desc, s.display_name), '[]'::jsonb)
    into v_out
  from public.staff s join auth.users u on u.id = s.user_id;
  return v_out;
end;
$$;
revoke all on function public.admin_staff() from public;
grant execute on function public.admin_staff() to authenticated;

-- Creating the login itself needs the service_role key, which must never reach
-- a browser — so the account is made in the Supabase dashboard (or by the
-- person signing up) and linked here by email.
create or replace function public.admin_add_staff(
  p_email text, p_role staff_role, p_display_name text
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_uid uuid; v_row public.staff%rowtype;
begin
  perform public.assert_admin();
  if nullif(btrim(coalesce(p_display_name, '')), '') is null then
    raise exception 'Give the person a name for the screen.' using errcode = '22023';
  end if;

  select id into v_uid from auth.users where lower(email) = lower(btrim(p_email));
  if v_uid is null then
    raise exception 'No account exists for %. Create the login in Supabase first, then add them here.',
      btrim(p_email) using errcode = 'P0002';
  end if;
  if exists (select 1 from public.staff where user_id = v_uid) then
    raise exception 'That account is already staff.' using errcode = '23505';
  end if;

  insert into public.staff (user_id, role, display_name)
  values (v_uid, p_role, btrim(p_display_name))
  returning * into v_row;
  return to_jsonb(v_row);
end;
$$;
revoke all on function public.admin_add_staff(text, staff_role, text) from public;
grant execute on function public.admin_add_staff(text, staff_role, text) to authenticated;

create or replace function public.admin_set_staff(
  p_user_id uuid, p_role staff_role default null, p_is_active boolean default null,
  p_display_name text default null
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_row public.staff%rowtype; v_admins int;
begin
  perform public.assert_admin();

  update public.staff set
    role         = coalesce(p_role, role),
    is_active    = coalesce(p_is_active, is_active),
    display_name = coalesce(nullif(btrim(coalesce(p_display_name, '')), ''), display_name)
  where user_id = p_user_id
  returning * into v_row;
  if not found then
    raise exception 'No such staff member.' using errcode = 'P0002';
  end if;

  -- Locking the last administrator out is unrecoverable from any screen: it
  -- would take a service_role key and the SQL editor to undo. Refuse it.
  select count(*) into v_admins from public.staff
   where role = 'admin' and is_active;
  if v_admins = 0 then
    raise exception 'That would leave nobody able to administer the shop.'
      using errcode = 'P0001';
  end if;

  return to_jsonb(v_row);
end;
$$;
revoke all on function public.admin_set_staff(uuid, staff_role, boolean, text) from public;
grant execute on function public.admin_set_staff(uuid, staff_role, boolean, text) to authenticated;
