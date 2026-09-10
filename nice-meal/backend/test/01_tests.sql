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
  ('22222222-2222-2222-2222-222222222222', 'admin@nicemeal.test'),
  -- Signed up, never made staff.
  ('33333333-3333-3333-3333-333333333333', 'nobody@nicemeal.test')
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
-- These two are refused at the grant, before row level security is consulted
-- at all — execute was never given to anon. Asserting "returns no rows" would
-- raise instead of returning, and with ON_ERROR_STOP off that statement would
-- be skipped and quietly counted as nothing.
select _denied('anon is refused the kitchen board outright', $q$ select kitchen_board() $q$);
select _denied('anon is refused the sales figures outright',
  $q$ select sales_summary(current_date, current_date) $q$);
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

-- ════════════════════════════════════════════════════════════════════════════
-- The admin functions (0006)
--
-- These are the ones that expose every phone number and every naira the shop
-- has taken, so most of what follows is about who is refused.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Nobody signed in ────────────────────────────────────────────────────────
set role anon;
select set_config('request.jwt.claim.sub', '', false);
select _denied('anon cannot list orders',      $q$ select admin_orders() $q$);
select _denied('anon cannot read the menu tree',$q$ select admin_menu() $q$);
select _denied('anon cannot run a report',     $q$ select admin_report(current_date, current_date) $q$);
select _denied('anon cannot list staff',       $q$ select admin_staff() $q$);
select _denied('anon cannot change a price',   $q$
  select admin_set_item((select id from menu_items limit 1), 100) $q$);
select _denied('anon cannot resume ordering',  $q$ select admin_set_settings(true) $q$);
select _denied('anon cannot add themselves as staff', $q$
  select admin_add_staff('kitchen@nicemeal.test', 'admin', 'Sneaky') $q$);
-- The channel says how an order reached the shop; a stranger must not be able
-- to dress a web order up as one taken at the counter.
select _denied('anon cannot claim an order came in by phone', $q$
  do $x$ declare i uuid; begin
    select id into i from menu_items where name = 'White Rice & Stew';
    perform place_order('Faker','08037777777','pickup',
      jsonb_build_array(jsonb_build_object('item_id', i, 'quantity', 1)),
      null, null, null, 'phone');
  end $x$ $q$);
reset role;

-- ── Kitchen staff: signed in, but not an administrator ──────────────────────
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
select _denied('kitchen staff cannot list orders with the money on them',
  $q$ select admin_orders() $q$);
select _denied('kitchen staff cannot run a report', $q$ select admin_report(current_date, current_date) $q$);
select _denied('kitchen staff cannot list staff',   $q$ select admin_staff() $q$);
select _denied('kitchen staff cannot change a price', $q$
  select admin_set_item((select id from menu_items limit 1), 100) $q$);
select _denied('kitchen staff cannot resume ordering', $q$ select admin_set_settings(true) $q$);
select _denied('kitchen staff cannot promote themselves', $q$
  select admin_set_staff('11111111-1111-1111-1111-111111111111', 'admin') $q$);
select _check('kitchen staff asking who they are get their own row',
  (me()->>'role') = 'kitchen', coalesce(me()::text, 'null'));
reset role;

-- Signed in, but never made staff.
set role authenticated;
select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', false);
select _check('an account that is not staff gets nothing back from me()', me() is null,
  coalesce(me()::text, 'null'));
select _check('and sees no orders on the kitchen board',
  (select count(*) from kitchen_board()) = 0);
reset role;

-- ── The administrator ───────────────────────────────────────────────────────
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);

select _check('admin sees orders with the phone number and the total',
  (admin_orders()->>'total')::int > 0
  and (admin_orders()->'rows'->0->>'customer_phone') is not null
  and (admin_orders()->'rows'->0->>'total_kobo') is not null);

select _check('the order list carries its lines',
  jsonb_array_length(admin_orders()->'rows'->0->'items') > 0);

select _check('searching by phone number narrows the list',
  (admin_orders(null, null, null, '08031234567')->>'total')::int
    < (admin_orders()->>'total')::int);

select _check('filtering by status narrows the list',
  (admin_orders(null, null, array['cancelled']::order_status[])->>'total')::int
    < (admin_orders()->>'total')::int);

select _check('the menu tree includes what is switched off',
  exists (select 1 from jsonb_array_elements(admin_menu()->'categories') c,
                        jsonb_array_elements(c->'items') i
          where (i->>'is_available')::boolean = false),
  'Beans & Plantain was marked sold out at the top of this file');

select _check('the menu tree carries the delivery areas and the settings',
  jsonb_array_length(admin_menu()->'areas') > 0
  and (admin_menu()->'settings'->>'accepting_orders') is not null);

-- Setting the fees is the one thing that has to happen before a delivery order
-- can be taken: they are all seeded at zero.
do $$ declare a uuid; f int; begin
  select id into a from delivery_areas order by name limit 1;
  perform admin_set_area(a, 50000);
  select fee_kobo into f from delivery_areas where id = a;
  perform _check('admin can set a delivery fee', f = 50000, 'fee is ' || f);
end $$;
select _denied('a negative delivery fee is refused', $q$
  select admin_set_area((select id from delivery_areas order by name limit 1), -100) $q$);

do $$ declare i uuid; p int; av boolean; begin
  select id into i from menu_items where name = 'Fried Rice & Chicken';
  perform admin_set_item(i, 260000);
  select price_kobo into p from menu_items where id = i;
  perform _check('admin can change a price through the function', p = 260000, 'price is ' || p);
  perform admin_set_item(i, null, false);
  select price_kobo, is_available into p, av from menu_items where id = i;
  perform _check('marking a dish sold out leaves its price alone',
    av = false and p = 260000, 'available ' || av || ', price ' || p);
end $$;
select _denied('a price of zero is refused', $q$
  select admin_set_item((select id from menu_items where name = 'Fried Rice & Chicken'), 0) $q$);

-- The pause reason must not outlive the pause.
do $$ declare s public.settings%rowtype; begin
  perform admin_set_settings(false, 'Swamped, back in 20 minutes');
  select * into s from settings;
  perform _check('admin can pause ordering with a reason',
    s.accepting_orders = false and s.pause_reason like 'Swamped%', coalesce(s.pause_reason, 'null'));
  perform admin_set_settings(true);
  select * into s from settings;
  perform _check('resuming clears the stale reason',
    s.accepting_orders and s.pause_reason is null, coalesce(s.pause_reason, 'null'));
end $$;

select _check('a report totals only completed orders',
  (admin_report(current_date - 7, current_date)->'totals'->>'orders')::int
    = (select count(*) from orders where status = 'completed' and day between current_date - 7 and current_date));
select _check('a report counts cancellations separately from revenue',
  (admin_report(current_date - 7, current_date)->>'cancelled')::int
    = (select count(*) from orders where status = 'cancelled' and day between current_date - 7 and current_date));
select _check('a report breaks the takings down by how the order arrived',
  jsonb_typeof(admin_report(current_date - 7, current_date)->'by_channel') = 'array');
select _denied('a backwards date range is refused', $q$
  select admin_report(current_date, current_date - 7) $q$);

-- me() has to answer for the caller, not for whoever happens to sort first.
-- The policy on `staff` returns every row to an administrator, so a plain
-- select limited to one row hands them a colleague's.
select _check('an admin asking who they are gets their own row',
  (me()->>'role') = 'admin' and (me()->>'display_name') = 'Owner',
  coalesce(me()::text, 'null'));
select _check('and a select on staff would not have told them that',
  (select count(*) from staff) > 1,
  'admin can see ' || (select count(*) from staff)::text || ' staff rows');

select _check('admin sees the staff list with emails',
  jsonb_array_length(admin_staff()) = 2
  and exists (select 1 from jsonb_array_elements(admin_staff()) s
              where s->>'email' = 'kitchen@nicemeal.test'));
select _check('the staff list marks which row is you',
  exists (select 1 from jsonb_array_elements(admin_staff()) s
          where (s->>'is_you')::boolean and s->>'role' = 'admin'));
select _denied('staff cannot be added for an email with no account', $q$
  select admin_add_staff('nobody-at-all@nicemeal.test', 'kitchen', 'Ghost') $q$);
select _denied('somebody who is already staff cannot be added twice', $q$
  select admin_add_staff('kitchen@nicemeal.test', 'kitchen', 'Again') $q$);

-- The one change no screen could undo.
select _denied('the last administrator cannot lock themselves out', $q$
  select admin_set_staff('22222222-2222-2222-2222-222222222222', null, false) $q$);
select _check('and they are still an active admin afterwards',
  (select is_active and role = 'admin' from staff
   where user_id = '22222222-2222-2222-2222-222222222222'));

do $$ declare n int; begin
  perform admin_set_staff('11111111-1111-1111-1111-111111111111', null, false);
  select count(*) into n from staff where user_id = '11111111-1111-1111-1111-111111111111' and not is_active;
  perform _check('a kitchen account can be deactivated', n = 1);
  perform admin_set_staff('11111111-1111-1111-1111-111111111111', null, true);
end $$;

-- ── Orders taken by staff, not by the website ───────────────────────────────
do $$ declare i uuid; r jsonb; begin
  select id into i from menu_items where name = 'White Rice & Stew';
  r := place_order('Walk-in customer','08030000001','dine_in',
        jsonb_build_array(jsonb_build_object('item_id', i, 'quantity', 1)),
        null, null, null, 'walk_in');
  perform _check('staff can record how an order arrived',
    (select channel from orders where code = r->>'code') = 'walk_in');
end $$;

-- Pausing stops the website. It must not stop the telephone.
do $$ declare i uuid; r jsonb; begin
  perform admin_set_settings(false, 'Website paused');
  select id into i from menu_items where name = 'White Rice & Stew';
  r := place_order('Phone order','08030000002','pickup',
        jsonb_build_array(jsonb_build_object('item_id', i, 'quantity', 1)),
        null, null, null, 'phone');
  perform _check('a paused shop still lets staff take a phone order', r->>'code' is not null);
  perform admin_set_settings(true);
end $$;

-- The throttle exists because a stranger faces no payment. Staff are signed in.
do $$ declare i uuid; k int := 0; begin
  select id into i from menu_items where name = 'White Rice & Stew';
  for k in 1..4 loop
    perform place_order('Counter rush','08030000003','pickup',
      jsonb_build_array(jsonb_build_object('item_id', i, 'quantity', 1)),
      null, null, null, 'walk_in');
  end loop;
  perform _check('staff are not throttled the way an anonymous browser is',
    (select count(*) from orders where customer_phone = '08030000003') = 4);
end $$;

reset role;

\echo ''
\echo '──────────────── results ────────────────'
select case when ok then 'PASS' else 'FAIL' end as r, name,
       case when ok then '' else detail end as detail
from _results order by ctid;
select count(*) filter (where ok) as passed, count(*) filter (where not ok) as failed from _results;
