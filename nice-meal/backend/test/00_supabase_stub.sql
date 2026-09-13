-- Local-only. Recreates just enough of Supabase's environment to run the
-- migrations against a plain Postgres: the auth schema, the JWT-backed
-- auth.uid(), the API roles, and the realtime publication. Never applied to a
-- real Supabase project, which provides all of this already.
create schema if not exists auth;

create table if not exists auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text unique
);

create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls; end if;
end $$;

grant usage on schema public, auth to anon, authenticated, service_role;
alter default privileges in schema public grant select on tables to anon, authenticated;

do $$ begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime; end if;
end $$;
