-- Test accounts. The stub accepts any password of 'correct-horse' for these,
-- because it is standing in for Supabase Auth rather than implementing it.
-- Never applied to a real project.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'kitchen@nicemeal.test'),
  ('22222222-2222-2222-2222-222222222222', 'admin@nicemeal.test'),
  -- Signed up, but not staff. The dashboard must tell this account why it is
  -- not getting a board, rather than showing it an empty one.
  ('33333333-3333-3333-3333-333333333333', 'nobody@nicemeal.test');

insert into public.staff (user_id, role, display_name) values
  ('11111111-1111-1111-1111-111111111111', 'kitchen', 'Kitchen tablet'),
  ('22222222-2222-2222-2222-222222222222', 'admin',   'Owner');
