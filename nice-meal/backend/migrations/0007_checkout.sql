-- ============================================================================
-- Nice Meal — 0007 the public checkout
--
-- One function, and it is deliberately NOT `security definer`. Everything else
-- in this schema that reads across tables runs as the owner with an explicit
-- role check on the first line, because it exposes things the caller could not
-- otherwise see. This one exposes nothing extra: it reads exactly the tables a
-- visitor may already select from, so leaving it as an invoker function means
-- the policies in 0004_rls.sql stay the single source of truth for what is
-- public. An inactive dish is filtered by `menu_items_public_read`, not by a
-- WHERE clause here that could drift away from it.
--
-- It exists at all because a customer on a phone should pay for one round trip
-- rather than five.
-- ============================================================================

create or replace function public.public_menu()
returns jsonb
language sql stable set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', c.id,
               'name', c.name,
               'items', coalesce((
                 select jsonb_agg(jsonb_build_object(
                          'id', i.id,
                          'name', i.name,
                          'description', i.description,
                          'price_kobo', i.price_kobo,
                          -- Sold out today is shown, not hidden: a dish missing
                          -- from the list looks like it was never sold here.
                          'is_available', i.is_available,
                          'groups', coalesce((
                            select jsonb_agg(jsonb_build_object(
                                     'id', g.id, 'name', g.name,
                                     'min_select', g.min_select,
                                     'max_select', g.max_select,
                                     'options', coalesce((
                                       select jsonb_agg(jsonb_build_object(
                                                'id', o.id, 'name', o.name,
                                                'price_delta_kobo', o.price_delta_kobo,
                                                'is_available', o.is_available)
                                              order by o.sort_order, o.name)
                                       from public.menu_options o
                                       where o.group_id = g.id), '[]'::jsonb))
                                   order by g.sort_order, g.name)
                            from public.menu_option_groups g
                            where g.menu_item_id = i.id), '[]'::jsonb))
                        order by i.sort_order, i.name)
                 from public.menu_items i
                 where i.category_id = c.id), '[]'::jsonb))
             order by c.sort_order, c.name)
      from public.menu_categories c), '[]'::jsonb),

    'areas', coalesce((
      select jsonb_agg(jsonb_build_object('id', a.id, 'name', a.name, 'fee_kobo', a.fee_kobo)
             order by a.sort_order, a.name)
      from public.delivery_areas a), '[]'::jsonb),

    -- Named one by one rather than to_jsonb(settings): a column added to that
    -- table later must not become public by accident.
    'settings', (
      select jsonb_build_object(
               'accepting_orders',             s.accepting_orders,
               'pause_reason',                 s.pause_reason,
               'min_order_kobo',               s.min_order_kobo,
               'free_delivery_threshold_kobo', s.free_delivery_threshold_kobo,
               'prep_time_minutes',            s.prep_time_minutes)
      from public.settings s limit 1)
  );
$$;
revoke all on function public.public_menu() from public;
grant execute on function public.public_menu() to anon, authenticated;
