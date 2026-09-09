-- Run against a scratch database that has the stub + all migrations applied.
-- Every check prints PASS or FAIL; the run ends with a count.
\set ON_ERROR_STOP off
\pset pager off

create table if not exists _results (name text, ok boolean, detail text);
truncate _results;

create or replace function _check(p_name text, p_ok boolean, p_detail text default '')
returns void language plpgsql security definer as $$
begin insert into _results values (p_name, p_ok, p_detail); end $$;

-- Something that should be refused: record whether it actually was.
create or replace function _denied(p_name text, p_sql text) returns void
language plpgsql as $$
begin
  execute p_sql;
  perform _check(p_name, false, 'ALLOWED — it should not have been');
exception when others then
  perform _check(p_name, true, sqlerrm);
end $$;
grant execute on function _check(text, boolean, text) to anon, authenticated;
grant execute on function _denied(text, text) to anon, authenticated;

-- ── Fixtures ────────────────────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'kitchen@nicemeal.test'),
  ('22222222-2222-2222-2222-222222222222', 'admin@nicemeal.test')
on conflict do nothing;
insert into public.staff (user_id, role, display_name) values
  ('11111111-1111-1111-1111-111111111111', 'kitchen', 'Kitchen tablet'),
  ('22222222-2222-2222-2222-222222222222', 'admin',   'Owner')
on conflict do nothing;

-- The kitchen has run out of beans today.
update public.menu_items set is_available = false where name = 'Beans & Plantain';

-- ════════════════════════════════════════════════════════════════════════════
-- A customer on the website (anonymous)
-- ════════════════════════════════════════════════════════════════════════════
set role anon;
select set_config('request.jwt.claim.sub', '', false);

-- Jollof ₦2,000 × 2 with a protein choice, plus a ₦200 drink.
do $$
declare r jsonb; jollof uuid; chicken uuid; drink uuid; water uuid;
begin
  select id into jollof from menu_items where name = 'Jollof Rice & Protein';
  select mo.id into chicken from menu_options mo join menu_option_groups g on g.id = mo.group_id
    where g.menu_item_id = jollof and mo.name = 'Chicken';
  select id into drink from menu_items where name = 'Soft Drinks & Water';
  select mo.id into water from menu_options mo join menu_option_groups g on g.id = mo.group_id
    where g.menu_item_id = drink and mo.name = 'Fanta';

  r := public.place_order('Adaeze O', '08031234567', 'pickup',
        jsonb_build_array(
          jsonb_build_object('item_id', jollof, 'quantity', 2, 'option_ids', jsonb_build_array(chicken)),
          jsonb_build_object('item_id', drink,  'quantity', 1, 'option_ids', jsonb_build_array(water))));

  perform _check('order total priced by the database',
    (r->>'total_kobo')::int = 420000,
    'got ' || (r->>'total_kobo') || ' kobo, expected 420000 (₦2,000×2 + ₦200)');
  perform _check('order code is dated and sequential',
    r->>'code' ~ '^NM-[0-9]{4}-[0-9]{2}$', r->>'code');
  perform _check('a track token comes back', (r->>'track_token') is not null);
end $$;

-- The client cannot name its own price: there is no price parameter at all,
-- and it cannot reach the table to write one.
select _denied('anon cannot INSERT an order directly',
  $q$ insert into orders (code, daily_seq, fulfilment, customer_name, customer_phone,
        subtotal_kobo, delivery_fee_kobo, total_kobo)
      values ('HACK-1', 999, 'pickup', 'Mallory', '08000000000', 1, 0, 1) $q$);

select _check('anon cannot read any order',
  (select count(*) from orders) = 0, 'rows visible to anon: ' || (select count(*) from orders)::text);
select _check('anon cannot read order items',
  (select count(*) from order_items) = 0);
select _check('anon cannot read the kitchen feed',
  (select count(*) from order_events) = 0);
select _check('anon gets nothing from the board',
  (select count(*) from kitchen_board()) = 0);
select _check('anon gets nothing from sales',
  (select count(*) from sales_summary(current_date, current_date)) = 0);
select _check('anon can read the live menu', (select count(*) from menu_items) = 7);

-- Business rules
select _denied('rejects a dish that is sold out', $q$
  do $x$ declare i uuid; begin
    select id into i from menu_items where name = 'Beans & Plantain';
    perform place_order('Test','08031111111','pickup',
      jsonb_build_array(jsonb_build_object('item_id', i, 'quantity', 1)));
  end $x$ $q$);
select _denied('rejects a missing required choice', $q$
  do $x$ declare i uuid; begin
    select id into i from menu_items where name = 'Jollof Rice & Protein';
    perform place_order('Test','08032222222','pickup',
      jsonb_build_array(jsonb_build_object('item_id', i, 'quantity', 1)));
  end $x$ $q$);
select _denied('rejects an option from another dish', $q$
  do $x$ declare i uuid; o uuid; begin
    select id into i from menu_items where name = 'Jollof Rice & Protein';
    select mo.id into o from menu_options mo join menu_option_groups g on g.id = mo.group_id
      join menu_items mi on mi.id = g.menu_item_id where mi.name = 'Egusi Soup & Swallow' limit 1;
    perform place_order('Test','08033333333','pickup',
      jsonb_build_array(jsonb_build_object('item_id', i, 'quantity', 1, 'option_ids', jsonb_build_array(o))));
  end $x$ $q$);
select _denied('rejects a delivery with no area', $q$
  do $x$ declare i uuid; c uuid; begin
    select id into i from menu_items where name = 'White Rice & Stew';
    perform place_order('Test','08034444444','delivery',
      jsonb_build_array(jsonb_build_object('item_id', i, 'quantity', 1)), null, null);
  end $x$ $q$);
select _denied('rejects an absurd quantity', $q$
  do $x$ declare i uuid; begin
    select id into i from menu_items where name = 'White Rice & Stew';
    perform place_order('Test','08035555555','pickup',
      jsonb_build_array(jsonb_build_object('item_id', i, 'quantity', 9999)));
  end $x$ $q$);
select _denied('rejects an empty order', $q$
  select place_order('Test','08036666666','pickup','[]'::jsonb) $q$);

-- Rate limit: a fourth order from one number inside two minutes is refused.
do $$
declare i uuid; k int;
begin
  select id into i from menu_items where name = 'White Rice & Stew';
  for k in 1..3 loop
    perform place_order('Flood','08037777777','pickup',
      jsonb_build_array(jsonb_build_object('item_id', i, 'quantity', 1)));
  end loop;
end $$;
select _denied('throttles a flood from one phone number', $q$
  do $x$ declare i uuid; begin
    select id into i from menu_items where name = 'White Rice & Stew';
    perform place_order('Flood','08037777777','pickup',
      jsonb_build_array(jsonb_build_object('item_id', i, 'quantity', 1)));
  end $x$ $q$);

reset role;

-- ════════════════════════════════════════════════════════════════════════════
-- The kitchen tablet
-- ════════════════════════════════════════════════════════════════════════════
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

select _check('kitchen sees the open orders on the board',
  (select count(*) from kitchen_board()) = 4,
  'board rows: ' || (select count(*) from kitchen_board())::text);
select _check('the board carries what is needed to cook',
  (select items::text <> '[]' and customer_name is not null from kitchen_board() limit 1));
select _check('the board exposes no money column',
  not exists (
    select 1 from information_schema.routines r
    join information_schema.parameters p on p.specific_name = r.specific_name
    where r.routine_name = 'kitchen_board' and p.parameter_name ilike '%kobo%'));
select _check('kitchen cannot read the orders table',
  (select count(*) from orders) = 0, 'rows visible: ' || (select count(*) from orders)::text);
select _check('kitchen cannot read customer phone numbers',
  (select count(*) from orders where customer_phone is not null) = 0);
select _check('kitchen can watch the order feed',
  (select count(*) from order_events) >= 4, 'events: ' || (select count(*) from order_events)::text);
select _check('kitchen gets nothing from the sales report',
  (select count(*) from sales_summary(current_date - 7, current_date)) = 0);

-- Moving a ticket along stamps its own timestamps.
do $$
declare oid uuid; o orders%rowtype;
begin
  select order_id into oid from order_events where event = 'placed' order by id limit 1;
  o := set_order_status(oid, 'preparing');
  perform _check('kitchen can start an order', o.status = 'preparing' and o.preparing_at is not null);
  perform _check('starting an order acknowledges it', o.acknowledged_at is not null);
  o := set_order_status(oid, 'ready');
  perform _check('kitchen can mark it ready', o.status = 'ready' and o.ready_at is not null);
  perform _check('the first timestamp is not overwritten', o.preparing_at is not null);
  o := set_order_status(oid, 'completed');
  perform _check('kitchen can complete it', o.status = 'completed' and o.completed_at is not null);
end $$;

select _denied('a completed order cannot be reopened', $q$
  do $x$ declare oid uuid; begin
    select id into oid from orders where status = 'completed' limit 1;
    perform set_order_status(oid, 'preparing');
  end $x$ $q$);
select _denied('cancelling requires a reason', $q$
  do $x$ declare oid uuid; begin
    select order_id into oid from order_events where event='placed' order by id desc limit 1;
    perform set_order_status(oid, 'cancelled');
  end $x$ $q$);
select _check('a status change reaches the feed',
  (select count(*) from order_events where event = 'status_changed') >= 3,
  'status events: ' || (select count(*) from order_events where event='status_changed')::text);
do $$
declare v_before int; v_after int; v_open boolean; v_open_after boolean;
begin
  select price_kobo into v_before from menu_items where name = 'Jollof Rice & Protein';
  update menu_items set price_kobo = 1 where name = 'Jollof Rice & Protein';
  select price_kobo into v_after  from menu_items where name = 'Jollof Rice & Protein';
  perform _check('a kitchen price change has no effect', v_after = v_before,
    'before ' || v_before || ', after ' || v_after);

  select accepting_orders into v_open from settings;
  update settings set accepting_orders = not v_open where id;
  select accepting_orders into v_open_after from settings;
  perform _check('the kitchen cannot flip the ordering switch', v_open_after = v_open);
end $$;

reset role;

-- ════════════════════════════════════════════════════════════════════════════
-- The owner
-- ════════════════════════════════════════════════════════════════════════════
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);

select _check('admin reads every order',
  (select count(*) from orders) >= 4, 'rows: ' || (select count(*) from orders)::text);
select _check('admin reads the sales report',
  (select count(*) from sales_summary(current_date - 7, current_date)) = 1);
select _check('the report totals only completed orders',
  (select gross_kobo from sales_summary(current_date - 7, current_date) limit 1)
    = (select sum(total_kobo) from orders where status = 'completed')
  and (select count(*) from orders where status <> 'completed') > 0,
  'report ' || coalesce((select gross_kobo from sales_summary(current_date-7,current_date) limit 1)::text,'null')
  || ' vs completed ' || coalesce((select sum(total_kobo) from orders where status='completed')::text,'null'));
select _check('admin sees best sellers',
  (select count(*) from top_dishes(current_date - 7, current_date)) >= 1);
do $$
declare n int;
begin
  update menu_items set price_kobo = 210000 where name = 'White Rice & Stew';
  get diagnostics n = row_count;
  perform _check('admin can reprice a dish', n = 1, 'rows updated: ' || n);
  update settings set accepting_orders = false where id;
  get diagnostics n = row_count;
  perform _check('admin can pause ordering', n = 1, 'rows updated: ' || n);
end $$;
select _check('every order total still adds up',
  not exists (select 1 from orders where total_kobo <> subtotal_kobo + delivery_fee_kobo));
select _check('line totals match quantity times unit price',
  not exists (select 1 from order_items where line_total_kobo <> unit_price_kobo * quantity));
select _check('order subtotal equals the sum of its lines',
  not exists (
    select 1 from orders o
    join (select order_id, sum(line_total_kobo) s from order_items group by order_id) t on t.order_id = o.id
    where o.subtotal_kobo <> t.s));

reset role;

-- A paused shop turns customers away.
set role anon;
select set_config('request.jwt.claim.sub', '', false);
select _denied('a paused kitchen refuses new orders', $q$
  do $x$ declare i uuid; begin
    select id into i from menu_items where name = 'White Rice & Stew';
    perform place_order('Late','08039999999','pickup',
      jsonb_build_array(jsonb_build_object('item_id', i, 'quantity', 1)));
  end $x$ $q$);
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
select _check('repricing does not rewrite history',
  (select price_kobo from menu_items where name = 'White Rice & Stew') = 210000
  and exists (select 1 from order_items
              where name_at_order = 'White Rice & Stew' and unit_price_kobo = 200000),
  'menu now ' || (select price_kobo from menu_items where name='White Rice & Stew')::text
  || ', historic line ' || coalesce((select min(unit_price_kobo)::text from order_items
                                     where name_at_order='White Rice & Stew'),'none'));
reset role;

\echo ''
\echo '──────────────── results ────────────────'
select case when ok then 'PASS' else 'FAIL' end as r, name,
       case when ok then '' else detail end as detail
from _results order by ctid;
select count(*) filter (where ok) as passed, count(*) filter (where not ok) as failed from _results;
