# Nice Meal — backend

Supabase (Postgres + Realtime + Auth). Orders come off the website, land on the
kitchen screen within a second with an audible alert, and the owner gets history
and reports. No online payment: a web order is a ticket, paid on handover.

**Status.** All four screens are built and tested: the
[checkout](../ORDERING.md) on the public site, the
[kitchen dashboard](../kitchen), and the [admin dashboard](../admin). A customer
can place an order on the website and it appears on the kitchen screen within a
second or two, or staff can type one in over the phone.

```
migrations/
  0001_schema.sql     tables, money as kobo, the Lagos business day
  0002_functions.sql  place_order() and the status transitions
  0003_kitchen.sql    the order feed, the kitchen board, the reports
  0004_rls.sql        row level security
  0005_seed.sql       the menu exactly as the website states it
  0006_admin.sql      the admin queries, each behind its own is_admin() check
  0007_checkout.sql   public_menu(), the checkout's one read
test/
  00_supabase_stub.sql  enough of Supabase to run locally
  01_tests.sql          97 checks, most of them about who can see what
  run.sh                applies everything to a scratch db and runs them
```

## Applying it

In the Supabase SQL editor, or with the CLI, run `migrations/` in order. They
are plain SQL and assume nothing but a fresh project. Then make yourself an
admin — sign up through Supabase Auth, then:

```sql
insert into staff (user_id, role, display_name)
values ('<your auth.users id>', 'admin', 'Your name');
```

A row in `staff` is what makes someone staff. Deleting it revokes access
everywhere, immediately — that is the whole off-boarding procedure.

## Running the tests

```bash
PGHOST=/tmp PGPORT=5433 ./test/run.sh
```

Needs a local Postgres 16. `00_supabase_stub.sql` recreates the pieces the
migrations lean on — the `auth` schema, `auth.uid()`, the `anon` and
`authenticated` roles, the realtime publication — so the same SQL that runs on
Supabase runs here. The suite grants table privileges to `anon` and
`authenticated` exactly as Supabase does, so RLS is what is actually being
tested rather than a missing GRANT.

## The four decisions that shape everything else

**The browser never sends a price.** `place_order()` takes item ids, quantities
and option ids — and no money. Every naira is read from the database inside the
function, which is `security definer`, and there is no INSERT policy on `orders`
for any role. A client that could post its own total could buy a ₦2,500 egusi
for ₦1, and no amount of front-end validation prevents that; only the absence of
the path does. The test suite asserts that a direct insert is refused.

**Money is kobo, stored as integers.** ₦2,000 is `200000`. Floats do not add up
to the number printed on a receipt.

**"Today" is the Lagos business day.** Africa/Lagos is UTC+1 with no DST, so a
UTC date rolls over at 1am local — mid-service on a late night. Every order
carries `day` from `lagos_day()`, so one evening's tickets stay in one day's
report and the ticket numbers restart when the shop does.

**Prices are copied onto the order, not joined to.** `order_items` stores
`name_at_order` and `unit_price_kobo`. Reprice the jollof next month and last
month's receipts do not change. Tested.

## Asking who you are

`me()` returns the caller's own `staff` row, and both dashboards use it to
decide what to show. Reading the `staff` table directly does not answer the
question: the policy on it is "your own row, or *everything* if you are an
admin", so selecting a single row from it hands an administrator an arbitrary
colleague's — and a screen that reads a role off that shows the wrong one. This
was a real bug, caught by the browser tests; it is now covered in SQL too.

## Who can see what

This is the part worth reading twice. There are two staff roles and they are
separated in the database, not in the interface.

| | website visitor | kitchen | admin |
|---|---|---|---|
| Menu, prices, delivery areas | read, via `public_menu()` | read | read + write |
| Place an order | via `place_order()` | — | — |
| Their own order's status | via `get_order_status()` | — | — |
| `orders` / `order_items` tables | **no access at all** | **no access at all** | read |
| What is cooking now | — | via `kitchen_board()` | read |
| Move an order along | — | `set_order_status()` | same |
| Revenue and reports | — | **nothing** | read |
| Pause ordering | — | — | write |
| Take a phone or counter order | — | — | `place_order(… 'phone')` |
| Add or deactivate staff | — | — | write |

Every `admin_*` function begins with an `is_admin()` check, so kitchen staff are
refused each one individually rather than being kept out by an interface that
merely does not link to them.

The kitchen tablet sits unattended on a counter, so it holds no path to a
customer's phone number, a delivery address, or the day's takings.
`kitchen_board()` returns the dish, quantity, options, customer name and any
note — what you need to cook and call the order out — and no money column
exists in its signature.

Customer details are never readable through the public API key. There is no
`anon` policy on `orders`, so an order goes in through `place_order()` and comes
back out only through `get_order_status()`, which needs the order code *and* its
random `track_token`. Codes are sequential and would otherwise be trivial to
walk.

## How the kitchen screen hears about an order

The obvious design is to subscribe to `orders` directly. That does not work
here: Supabase Realtime only delivers rows the subscriber is allowed to read, so
it would mean granting the kitchen tablet read access to everything above.

Instead a trigger writes a deliberately thin row to `order_events` — an order
id, its code, its status, a timestamp. No money, no customer details. The
kitchen subscribes to that, and pulls the cooking detail through
`kitchen_board()`.

```
website → place_order()  →  orders ─trigger─→ order_events ─realtime─→ kitchen screen
                                                                          ↓ beep
                                                          kitchen_board() ← refetch
```

`order_events` doubles as an audit trail: when each ticket was placed,
acknowledged and finished.

### Two things the screen must get right

Both are now handled in [`../kitchen`](../kitchen), and both are worth restating
here because any future screen built on this feed faces them again.

**The sound needs an explicit unlock.** Browsers refuse to play audio until
someone has interacted with the page, and that permission is lost on every
reload. A tablet that reboots overnight comes back silent, and nobody discovers
it until an order is missed. The dashboard must open with a visible "sound on"
control that creates the AudioContext on a real tap, show plainly whether sound
is currently armed, and never rely on audio alone — a `new` order should also
flash the screen.

**Realtime connections drop.** Wi-fi in a kitchen is not reliable, and a
dashboard that silently stops receiving is worse than one that never worked,
because the staff still trust it. The screen needs a poll of `kitchen_board()`
every 15–20 seconds regardless of the socket, a visible connection indicator,
and a reconnect that refetches rather than assuming it missed nothing.

## Business rules enforced in the database

Because the front end can be bypassed:

- Ordering stops instantly when `settings.accepting_orders` is off — the switch
  for when the kitchen is swamped.
- A sold-out dish is refused, by name, so the customer knows which one.
- Required choices are enforced: no ticket reaches the kitchen saying "Jollof
  Rice & Protein" without a protein.
- An option belonging to another dish is refused.
- A delivery needs an active area and an address, by table constraint.
- Quantities are 1–50; an order is 1–40 lines.
- Four orders from one phone number inside two minutes are refused. With no
  payment step, nothing else stands between a bored stranger and the kitchen.
  Signed-in staff are exempt: a busy counter legitimately puts several orders
  through the shop's own callback number in a minute.
- A non-`web` channel — "this came in by phone" — can only be set by staff. It
  is the one fact about an order that cannot be reconstructed afterwards.
- Pausing stops the website, not the shop: `place_order()` still accepts a staff
  order while `accepting_orders` is off.
- The last active administrator cannot be deactivated or demoted. It is the one
  change no screen could undo.
- A completed or cancelled order cannot be reopened, and a cancellation needs a
  reason.
- `total_kobo = subtotal_kobo + delivery_fee_kobo` is a check constraint, not a
  convention.

## Still to decide

- **Delivery fees are seeded at ₦0** for all seven areas. The website never
  quoted a fee, so nothing was invented on the restaurant's behalf. The admin
  dashboard's Menu & shop tab has the table, and warns how many are still
  unset. Set them before taking a delivery order.
- **The menu now exists in two places** — these tables and the static HTML.
  Until the site reads from here, a price changed in one is wrong in the other.
  The plan is for the marketing pages to keep their static markup for search
  engines and first paint, and to mark items sold out from the database after
  load, so an unreachable database costs you ordering but never the menu.
- **The opening hours contradict themselves** in the website copy (three places
  say Mon–Sat, the hours table says Mon–Sun). Nothing here enforces hours yet;
  worth settling before it does.
