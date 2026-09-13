-- ============================================================================
-- Nice Meal — 0008 a delivery fee nobody has quoted yet
--
-- 0005 seeded every area at ₦0, because the website never quoted a delivery
-- fee and inventing one on a real restaurant's behalf was not on. But a
-- placeholder of nothing and a decision to charge nothing were stored as the
-- same number, and the checkout believed the placeholder: it offered every
-- customer "Baruwa — free delivery" and totalled the order as if that were
-- true. The first person to find out otherwise would have been whoever opened
-- the door to the rider.
--
-- So the two are told apart, and the column that does it is the one the fact
-- actually lives on:
--
--   fee_kobo null  we have not set a fee for this area. The customer is told
--                  we will confirm it when we call, the order stores no
--                  delivery fee at all, and its total is the food alone.
--   fee_kobo 0     delivery there really is free, and the customer is told so.
--
-- An order keeps the same distinction: delivery_fee_kobo null means nobody
-- quoted this one, which is a different thing from a fee of zero and has to
-- stay different once it is in the kitchen's hands.
--
-- Already ran the earlier files against a project? Run 0002_functions.sql
-- again as well — place_order does the arithmetic that this file makes
-- possible, and every function file is `create or replace`, safe to re-run.
-- ============================================================================

alter table public.delivery_areas alter column fee_kobo drop not null;
alter table public.delivery_areas alter column fee_kobo drop default;

-- The placeholders 0005 inserted. A zero somebody typed deliberately is not
-- being discarded here: the admin screen has always shown 0 as "no fee set",
-- so nobody could have set one believing they were announcing free delivery.
update public.delivery_areas set fee_kobo = null where fee_kobo = 0;

-- The `fee_kobo >= 0` check needs no change: a check constraint passes when it
-- evaluates to null, so it keeps rejecting a negative fee and lets an absent
-- one through.

alter table public.orders alter column delivery_fee_kobo drop not null;
-- The default stays 0. An order that omits the column is a pickup, and a
-- pickup's delivery fee is genuinely nothing rather than unknown.

-- An unknown fee cannot be added to a total, so the total is the food alone
-- and the constraint says as much, rather than going null and silently
-- passing — a check that evaluates to null holds, which would have left every
-- total unguarded for exactly the orders this migration exists for.
alter table public.orders drop constraint orders_total_adds_up;
alter table public.orders add constraint orders_total_adds_up
  check (total_kobo = subtotal_kobo + coalesce(delivery_fee_kobo, 0));
