-- ============================================================================
-- Nice Meal — 0005 seed
--
-- The menu exactly as the website states it today, so the database and the
-- printed page agree from the first minute. Prices are in kobo: ₦2,000 is
-- 200000. The option groups come from the dish descriptions themselves —
-- "chicken, beef, fish, or gizzard", "eba, fufu, or pounded yam".
--
-- Delivery fees are NOT from the website, which never quoted one. Nothing is
-- invented on a real restaurant's behalf, so they go in as ₦0 here and
-- 0008_delivery_fee.sql turns them into "not set yet" — a state the customer
-- is told about honestly instead of being promised free delivery. Set them in
-- the admin screen before taking a delivery order.
-- ============================================================================

insert into public.settings (id, accepting_orders, min_order_kobo, prep_time_minutes)
values (true, true, 0, 30)
on conflict (id) do nothing;

insert into public.menu_categories (name, sort_order) values
  ('Rice dishes', 1), ('Soups & Swallows', 2), ('Light meals', 3), ('Drinks', 4)
on conflict (name) do nothing;

insert into public.menu_items (category_id, name, description, price_kobo, sort_order)
select c.id, v.name, v.description, v.price_kobo, v.sort_order
from (values
  ('Rice dishes', 'Jollof Rice & Protein',
   'Our signature smoky jollof, cooked low and slow with a rich tomato base.', 200000, 1),
  ('Rice dishes', 'Fried Rice & Chicken',
   'Golden, well-seasoned fried rice loaded with vegetables and served with succulent chicken.', 220000, 2),
  ('Rice dishes', 'White Rice & Stew',
   'Fluffy steamed rice paired with our house tomato stew.', 200000, 3),
  ('Soups & Swallows', 'Egusi Soup & Swallow',
   'Thick, hearty egusi soup with assorted meat. Comfort in a bowl.', 250000, 1),
  ('Soups & Swallows', 'Banga Soup & Starch',
   'Rich palm-nut soup slow-cooked with fragrant spices and assorted protein.', 250000, 2),
  ('Light meals', 'Beans & Plantain',
   'Slow-cooked honey beans, perfectly sweetened, served with crispy fried plantain.', 150000, 1),
  ('Drinks', 'Soft Drinks & Water',
   'Cold and ready to wash down your meal.', 20000, 1)
) as v(category, name, description, price_kobo, sort_order)
join public.menu_categories c on c.name = v.category
on conflict (category_id, name) do nothing;

-- Option groups, taken from the dish descriptions on the site.
insert into public.menu_option_groups (menu_item_id, name, min_select, max_select)
select i.id, v.group_name, 1, 1
from (values
  ('Jollof Rice & Protein', 'Choose your protein'),
  ('Fried Rice & Chicken',  'How would you like the chicken?'),
  ('Egusi Soup & Swallow',  'Choose your swallow'),
  ('Soft Drinks & Water',   'Which drink?')
) as v(item_name, group_name)
join public.menu_items i on i.name = v.item_name;

insert into public.menu_options (group_id, name, sort_order)
select g.id, v.option_name, v.sort_order
from (values
  ('Jollof Rice & Protein', 'Chicken', 1), ('Jollof Rice & Protein', 'Beef', 2),
  ('Jollof Rice & Protein', 'Fish', 3),    ('Jollof Rice & Protein', 'Gizzard', 4),
  ('Fried Rice & Chicken',  'Fried', 1),   ('Fried Rice & Chicken',  'Grilled', 2),
  ('Egusi Soup & Swallow',  'Eba', 1),     ('Egusi Soup & Swallow',  'Fufu', 2),
  ('Egusi Soup & Swallow',  'Pounded yam', 3),
  ('Soft Drinks & Water',   'Coca-Cola', 1), ('Soft Drinks & Water', 'Fanta', 2),
  ('Soft Drinks & Water',   'Sprite', 3),    ('Soft Drinks & Water', 'Table water', 4)
) as v(item_name, option_name, sort_order)
join public.menu_items i on i.name = v.item_name
join public.menu_option_groups g on g.menu_item_id = i.id
on conflict (group_id, name) do nothing;

-- The areas the site already advertises. Fees are placeholders — see above.
insert into public.delivery_areas (name, fee_kobo, sort_order) values
  ('Baruwa', 0, 1), ('Ipaja', 0, 2), ('Idimu', 0, 3), ('Egbeda', 0, 4),
  ('Iyana Ipaja', 0, 5), ('Alimosho', 0, 6), ('Ayobo', 0, 7)
on conflict (name) do nothing;
