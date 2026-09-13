-- ============================================================================
-- Nice Meal — 0004 row level security
--
-- Default posture: every table denies everything, and each policy below grants
-- back the narrowest thing that works. In particular there is no anon policy
-- on `orders` or `order_items` at all — a customer's name, phone number and
-- address are never readable through the public API key. The website gets an
-- order in through place_order() and back out through get_order_status(), both
-- of which return only that one order.
-- ============================================================================

alter table public.staff              enable row level security;
alter table public.menu_categories    enable row level security;
alter table public.menu_items         enable row level security;
alter table public.menu_option_groups enable row level security;
alter table public.menu_options       enable row level security;
alter table public.delivery_areas     enable row level security;
alter table public.settings           enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;
alter table public.order_events       enable row level security;

-- ── Staff ───────────────────────────────────────────────────────────────────
create policy staff_read_self on public.staff
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy staff_admin_writes on public.staff
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── The menu is public, but only the parts that are on ──────────────────────
create policy menu_categories_public_read on public.menu_categories
  for select to anon, authenticated using (is_active);
create policy menu_categories_admin on public.menu_categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy menu_items_public_read on public.menu_items
  for select to anon, authenticated using (is_active);
create policy menu_items_admin on public.menu_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy menu_option_groups_public_read on public.menu_option_groups
  for select to anon, authenticated using (true);
create policy menu_option_groups_admin on public.menu_option_groups
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy menu_options_public_read on public.menu_options
  for select to anon, authenticated using (true);
create policy menu_options_admin on public.menu_options
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy delivery_areas_public_read on public.delivery_areas
  for select to anon, authenticated using (is_active);
create policy delivery_areas_admin on public.delivery_areas
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- The website has to know whether the kitchen is taking orders before it shows
-- a checkout, so the settings row is readable; only an admin can change it.
create policy settings_public_read on public.settings
  for select to anon, authenticated using (true);
create policy settings_admin_write on public.settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── Orders: admin reads, nobody writes directly ─────────────────────────────
-- Kitchen staff are deliberately absent here. They see orders through
-- kitchen_board(), which strips the money and the address.
create policy orders_admin_read on public.orders
  for select to authenticated using (public.is_admin());
create policy orders_admin_write on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy order_items_admin_read on public.order_items
  for select to authenticated using (public.is_admin());

-- No INSERT policy on either table, for any role. The only way in is
-- place_order(), which is security definer and prices everything itself.

-- ── The kitchen feed ────────────────────────────────────────────────────────
-- Any active staff member can watch it; it carries a code and a status.
create policy order_events_staff_read on public.order_events
  for select to authenticated using (public.is_staff());

-- ── Realtime ────────────────────────────────────────────────────────────────
-- Only the thin feed is published. Realtime honours the policy above, so an
-- unauthenticated browser subscribing to it receives nothing.
alter publication supabase_realtime add table public.order_events;
