-- ============================================================================
-- Nice Meal — 0001 schema
--
-- Money is stored in kobo as integers, never naira as floats: ₦2,000 is
-- 200000. Two orders of 1/3 of anything must still add up to the printed
-- total, and a float total that is off by a hundredth of a naira is a receipt
-- nobody can reconcile.
--
-- "Day" is the Lagos business day, not the UTC one. Africa/Lagos is UTC+1 with
-- no DST, so a UTC date rolls over at 1am local — mid-service on a late night,
-- which would split one evening's tickets across two days in every report.
-- ============================================================================

create extension if not exists pgcrypto;

create type staff_role      as enum ('kitchen', 'admin');
create type order_status    as enum ('new', 'preparing', 'ready', 'completed', 'cancelled');
create type fulfilment_type as enum ('delivery', 'pickup', 'dine_in');
create type order_channel   as enum ('web', 'phone', 'walk_in');

-- The Lagos business day for a given instant.
create or replace function public.lagos_day(at timestamptz default now())
returns date language sql immutable as $$
  select (at at time zone 'Africa/Lagos')::date;
$$;

-- ── People who work here ────────────────────────────────────────────────────
create table public.staff (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  role         staff_role not null default 'kitchen',
  display_name text not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);
comment on table public.staff is
  'Maps a Supabase auth user to a role. A row here is what makes someone staff; deleting it revokes access everywhere.';

-- ── The menu ────────────────────────────────────────────────────────────────
create table public.menu_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  sort_order int not null default 0,
  is_active  boolean not null default true
);

create table public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.menu_categories(id) on delete restrict,
  name         text not null,
  description  text,
  price_kobo   integer not null check (price_kobo > 0),
  -- Two different "off" switches, because they mean different things to the
  -- kitchen: sold out today, versus no longer on the menu at all.
  is_available boolean not null default true,
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  image_path   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (category_id, name)
);

-- "Choose your protein — chicken, beef, fish, or gizzard" is a real part of an
-- order: the kitchen cannot cook the ticket without it.
create table public.menu_option_groups (
  id           uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  name         text not null,
  min_select   int not null default 1 check (min_select >= 0),
  max_select   int not null default 1 check (max_select >= 1),
  sort_order   int not null default 0,
  check (max_select >= min_select)
);

create table public.menu_options (
  id               uuid primary key default gen_random_uuid(),
  group_id         uuid not null references public.menu_option_groups(id) on delete cascade,
  name             text not null,
  price_delta_kobo integer not null default 0,
  is_available     boolean not null default true,
  sort_order       int not null default 0,
  unique (group_id, name)
);

-- ── Where we deliver ────────────────────────────────────────────────────────
create table public.delivery_areas (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  fee_kobo   integer not null default 0 check (fee_kobo >= 0),
  is_active  boolean not null default true,
  sort_order int not null default 0
);

-- ── One row of shop-wide switches ───────────────────────────────────────────
create table public.settings (
  id                           boolean primary key default true check (id),
  accepting_orders             boolean not null default true,
  pause_reason                 text,
  min_order_kobo               integer not null default 0 check (min_order_kobo >= 0),
  free_delivery_threshold_kobo integer check (free_delivery_threshold_kobo > 0),
  prep_time_minutes            int not null default 30 check (prep_time_minutes > 0),
  updated_at                   timestamptz not null default now()
);
comment on table public.settings is
  'Single row (id is always true). accepting_orders is the panic switch: the kitchen turns it off when it is swamped and the website stops taking orders immediately.';

-- ── Orders ──────────────────────────────────────────────────────────────────
create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  -- Short and sayable across a hot kitchen: NM-0912-07.
  code              text not null unique,
  day               date not null default public.lagos_day(),
  daily_seq         int not null,
  channel           order_channel not null default 'web',
  status            order_status not null default 'new',
  fulfilment        fulfilment_type not null,

  customer_name     text not null check (length(btrim(customer_name)) between 2 and 80),
  customer_phone    text not null check (customer_phone ~ '^\+?[0-9][0-9 ()-]{6,19}$'),
  delivery_area_id  uuid references public.delivery_areas(id),
  address           text,
  notes             text check (notes is null or length(notes) <= 500),

  subtotal_kobo     integer not null check (subtotal_kobo >= 0),
  delivery_fee_kobo integer not null default 0 check (delivery_fee_kobo >= 0),
  total_kobo        integer not null check (total_kobo >= 0),

  -- Lets a customer check their own order without being able to read anyone
  -- else's: the code alone is guessable, the code plus this token is not.
  track_token       uuid not null default gen_random_uuid(),

  placed_at         timestamptz not null default now(),
  acknowledged_at   timestamptz,
  acknowledged_by   uuid references auth.users(id),
  preparing_at      timestamptz,
  ready_at          timestamptz,
  completed_at      timestamptz,
  cancelled_at      timestamptz,
  cancel_reason     text,

  constraint orders_daily_seq_unique unique (day, daily_seq),
  constraint orders_total_adds_up    check (total_kobo = subtotal_kobo + delivery_fee_kobo),
  -- A delivery needs somewhere to deliver to.
  constraint orders_delivery_has_address check (
    fulfilment <> 'delivery' or (delivery_area_id is not null and length(btrim(coalesce(address,''))) > 0)
  ),
  constraint orders_cancel_has_reason check (
    status <> 'cancelled' or cancel_reason is not null
  )
);

-- Name and price are copied onto the line, never joined back to menu_items.
-- Reprice the jollof next month and last month's receipts must not change.
create table public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders(id) on delete cascade,
  menu_item_id     uuid references public.menu_items(id) on delete set null,
  name_at_order    text not null,
  unit_price_kobo  integer not null check (unit_price_kobo >= 0),
  quantity         int not null check (quantity > 0 and quantity <= 50),
  options_at_order jsonb not null default '[]'::jsonb,
  line_total_kobo  integer not null check (line_total_kobo >= 0),
  note             text check (note is null or length(note) <= 200)
);

-- ── Indexes shaped by the two queries that actually run all day ─────────────
-- The kitchen board: every order still in play, oldest first.
create index orders_open_idx on public.orders (placed_at)
  where status in ('new', 'preparing', 'ready');
-- Admin history and the daily reports.
create index orders_day_idx        on public.orders (day desc, daily_seq desc);
create index orders_placed_at_idx  on public.orders (placed_at desc);
create index order_items_order_idx on public.order_items (order_id);
create index menu_items_menu_idx   on public.menu_items (category_id, sort_order) where is_active;
