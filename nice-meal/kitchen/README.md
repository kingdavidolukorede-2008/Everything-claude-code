# Nice Meal — kitchen dashboard

The screen that sits on the counter. An order placed anywhere — the website,
or typed in by staff — appears here within a second or two, sounds an alert,
and stays lit until somebody moves it along.

Static HTML, CSS and JavaScript. No build step, no framework, no npm install;
it deploys next to the website as a folder. The only dependency is the
database in [`../backend`](../backend), which must be applied first.

```
kitchen/
  index.html            the screen
  config.js             your Supabase URL and anon key — the one file you edit
  assets/kitchen.css
  assets/kitchen.js     the board, the alert, the status changes
```

The small hand-written Supabase client it uses is shared with the admin
dashboard and lives in [`../assets/js/nm-client.js`](../assets/js/nm-client.js).

## Setting it up

1. **Apply the backend** to your Supabase project — see
   [`../backend/README.md`](../backend/README.md). Nothing here works without it.

2. **Fill in `config.js`.** From Supabase, Project Settings → API, copy the
   Project URL and the `anon` `public` key:

   ```js
   SUPABASE_URL: 'https://abcdefgh.supabase.co',
   SUPABASE_ANON_KEY: 'eyJhbGciOi…'
   ```

   Both belong in a public file. The anon key is a published identifier, not a
   password — every table it can reach is guarded by the row level security
   policies in `0004_rls.sql`, which is what actually stops a stranger reading
   your orders. **Never put the `service_role` key here.** That one bypasses
   row level security completely, and anything in this folder is served to
   whoever asks for it.

3. **Create the staff accounts.** In Supabase, Authentication → Users → Add
   user, with an email and password for each person or each tablet. Then map
   each one to a role (SQL editor):

   ```sql
   insert into public.staff (user_id, role, display_name)
   values ('<the user id you just created>', 'kitchen', 'Front counter tablet');
   ```

   `kitchen` sees this board. `admin` sees this board and the
   [admin dashboard](../admin) as well. Signing in without a `staff` row gets a
   plain "this account is not set up as kitchen staff" rather than a
   permanently empty board.

   Once one administrator exists, the rest of this step is easier from the
   admin dashboard's Staff tab than from SQL.

   To revoke access — a phone lost, someone leaving — set `is_active = false`
   on their row. It takes effect on the next request, everywhere, without
   touching the tablet.

4. **Deploy.** The folder goes up with the rest of the site, so the dashboard
   lands at `https://yourdomain/kitchen/`. `../_headers` already carries the
   headers this page needs on Netlify and Cloudflare Pages. Bookmark that URL
   on the tablet and add it to the home screen; nothing on the public site
   links to it, and it is marked `noindex`.

## Running it on a tablet

**Turn the sound on, every time the page reloads.** This is the one piece of
daily discipline the screen needs, and the reason is worth knowing: a browser
will not play a sound until somebody has interacted with the page, and it
forgets that the moment the page reloads. A tablet that restarted overnight
comes back **silent**. So the dashboard never assumes — it reads the state
from the audio system itself, and if sound is not genuinely running it shows
an orange band across the top that is impossible to miss. Tap it. Signing in
counts as the interaction, so a fresh sign-in already has sound; a reload of
an already-signed-in tablet does not.

Every alert also flashes the board and changes the browser tab title, whether
or not sound is available. That half cannot be blocked.

**The header tells you whether to trust the screen.** Two pills, both honest:

| Shows | Means |
|---|---|
| **Live** | Connected. New orders appear the moment they are placed. |
| **Connecting…** | Trying. Orders still arrive on the 15-second check. |
| **Not live — checking every 15s** | The live connection is gone. Orders still arrive, just up to 15 seconds later. |
| **Updated 4s ago** | When the board last successfully reloaded. |
| **Last updated 3 min ago** (red) | Nothing has got through for a while. Something is wrong — check the internet. |

The board reloads itself every fifteen seconds regardless of the live
connection. That is deliberate: a dashboard that has quietly stopped receiving
is worse than one that never worked, because staff carry on trusting it. The
worst case for a new order being seen here is one interval, not "until
somebody notices the screen has not moved all evening".

**Keep the tablet awake.** The screen asks the browser to stay on while the
board is open, but not every device allows it. Set the tablet's own display
timeout to Never as well, and plug it in.

## Working an order

Each ticket shows the code, how long ago it was placed, whether it is
delivery, pickup or dine-in, the customer's name, every line with its
quantity and choices, and any note.

- **Start cooking** → moves it to Cooking.
- **Ready** → moves it to Ready.
- **Picked up / Sent with rider / Served** → done, and it leaves the board.
- **Heard it** silences the alarm without committing to cooking yet — for when
  your hands are full.
- **Cancel** asks for a reason, because the database will not accept a
  cancellation without one and the customer gets told what it says.

Tickets change colour as they age: normal, amber past ten minutes, red past
twenty. Both thresholds are in `config.js`.

**Two actions ask twice.** The last step and cancelling cannot be undone from
this screen — the database refuses to reopen a completed or cancelled order —
so a single tap only arms the button, and it disarms itself after five
seconds. This is the fix for the mis-tap that loses an order.

## What this screen deliberately cannot do

Not hidden in the interface — genuinely not reachable from this account.

- **See any money.** No totals, no prices, no delivery fees. `kitchen_board()`
  does not return them.
- **See a phone number or a street address.** The delivery area is shown so
  the kitchen knows how far it is going; the address goes to whoever is
  driving, from the admin screen.
- **See yesterday.** Only orders still in play — new, cooking, ready.
- **Change a price, or pause the website.** Both are admin-only. If ordering
  has been paused, a banner says so, so nobody spends the evening wondering
  why the website has gone quiet.

This matters because the tablet sits unattended on a counter. If it is stolen
or someone wanders behind it, what they get is a list of what is being cooked.

## Testing it without Supabase

```bash
cd ../test && npm install
cd .. && PGHOST=/tmp PGPORT=5433 ./test/run.sh
```

80 checks that drive this dashboard in a real browser against a local Postgres
running the real migrations, plus an accessibility pass. See
[`../test/README.md`](../test/README.md) for what they cover and where the
stand-in for Supabase stops being a faithful one.

`../backend/test/run.sh` covers the database itself — 91 more, mostly about
who can read what.

## Still to build

- **Checkout on the website.** There is no way for a customer to place an
  order from the site yet — it still points at Glovo and the phone. Until that
  ships, this board fills up from orders staff type in on the
  [admin dashboard](../admin), which is built.
- **Set the delivery fees.** All seven areas are seeded at ₦0 because the
  website never quoted one. The [admin dashboard](../admin) has the table and
  warns you how many are still unset. Do this before accepting a delivery
  order.
