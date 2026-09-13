-- ============================================================================
-- Nice Meal — 0003 the kitchen feed
--
-- The kitchen screen needs to know the instant an order lands. The obvious way
-- is to subscribe to `orders` itself, but Supabase Realtime only delivers rows
-- the subscriber is allowed to read — so that would mean granting the kitchen
-- tablet read access to every customer's phone number, address and the day's
-- revenue, on a device that sits unattended on a counter.
--
-- Instead the trigger below writes a thin event row carrying nothing but an
-- order id, its code and its status. The kitchen subscribes to that, and pulls
-- the cooking detail it needs through kitchen_board(), which returns no money
-- and no address. The wide table stays readable only by an admin.
-- ============================================================================

create table public.order_events (
  id       bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  code     text not null,
  event    text not null check (event in ('placed', 'status_changed', 'acknowledged')),
  status   order_status,
  at       timestamptz not null default now()
);
create index order_events_at_idx on public.order_events (at desc);
comment on table public.order_events is
  'Deliberately narrow: no money, no customer details. This is the table the kitchen tablet subscribes to.';

create or replace function public.emit_order_event()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_events (order_id, code, event, status)
    values (new.id, new.code, 'placed', new.status);
  elsif new.status is distinct from old.status then
    insert into public.order_events (order_id, code, event, status)
    values (new.id, new.code, 'status_changed', new.status);
  elsif new.acknowledged_at is distinct from old.acknowledged_at then
    insert into public.order_events (order_id, code, event, status)
    values (new.id, new.code, 'acknowledged', new.status);
  end if;
  return new;
end;
$$;

create trigger orders_emit_event
  after insert or update on public.orders
  for each row execute function public.emit_order_event();

-- ── What the kitchen is allowed to see ──────────────────────────────────────
-- Everything needed to cook and hand over a ticket, and nothing else. No
-- totals, no line prices, no delivery address — the driver gets the address
-- from the admin screen.
create or replace function public.kitchen_board()
returns table (
  id              uuid,
  code            text,
  status          order_status,
  fulfilment      fulfilment_type,
  customer_name   text,
  area            text,
  notes           text,
  placed_at       timestamptz,
  acknowledged_at timestamptz,
  items           jsonb
)
language sql stable security definer set search_path = public, pg_temp as $$
  select o.id, o.code, o.status, o.fulfilment,
         o.customer_name, a.name, o.notes, o.placed_at, o.acknowledged_at,
         coalesce((
           select jsonb_agg(jsonb_build_object(
                    'name',     oi.name_at_order,
                    'quantity', oi.quantity,
                    'options',  oi.options_at_order,
                    'note',     oi.note)
                  order by oi.name_at_order)
           from public.order_items oi where oi.order_id = o.id
         ), '[]'::jsonb)
  from public.orders o
  left join public.delivery_areas a on a.id = o.delivery_area_id
  where public.is_staff()
    and o.status in ('new', 'preparing', 'ready')
  order by o.placed_at;
$$;
revoke all on function public.kitchen_board() from public;
grant execute on function public.kitchen_board() to authenticated;

-- ── Reports ─────────────────────────────────────────────────────────────────
-- Admin only. Kept as a function rather than a view so the role check travels
-- with it and cannot be lost by someone re-granting the view.
create or replace function public.sales_summary(p_from date, p_to date)
returns table (
  day            date,
  orders_count   bigint,
  gross_kobo     bigint,
  delivery_kobo  bigint,
  avg_order_kobo bigint
)
language sql stable security definer set search_path = public, pg_temp as $$
  select o.day, count(*), sum(o.total_kobo), sum(o.delivery_fee_kobo),
         (sum(o.total_kobo) / greatest(count(*), 1))::bigint
  from public.orders o
  where public.is_admin()
    and o.status = 'completed'
    and o.day between p_from and p_to
  group by o.day
  order by o.day desc;
$$;
revoke all on function public.sales_summary(date, date) from public;
grant execute on function public.sales_summary(date, date) to authenticated;

create or replace function public.top_dishes(p_from date, p_to date, p_limit int default 10)
returns table (name text, sold bigint, revenue_kobo bigint)
language sql stable security definer set search_path = public, pg_temp as $$
  select oi.name_at_order, sum(oi.quantity)::bigint, sum(oi.line_total_kobo)::bigint
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where public.is_admin()
    and o.status = 'completed'
    and o.day between p_from and p_to
  group by oi.name_at_order
  order by 2 desc
  limit greatest(1, least(p_limit, 100));
$$;
revoke all on function public.top_dishes(date, date, int) from public;
grant execute on function public.top_dishes(date, date, int) to authenticated;
