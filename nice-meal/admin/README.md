# Nice Meal — admin dashboard

The owner's screen. Every order with the money and the customer on it, a way to
take an order over the phone, the menu and the prices, the takings, and who is
allowed in.

Static HTML, CSS and JavaScript — no build step, no framework. It shares the
Supabase client in [`../assets/js/nm-client.js`](../assets/js/nm-client.js) and
the keys in [`../config.js`](../config.js) with the checkout and the kitchen
screen, and needs the database in [`../backend`](../backend) applied first.

```
admin/
  index.html              the five tabs
  assets/admin.css
  assets/admin.js         shell, router, session, shared helpers
  assets/admin-orders.js  the order list, one order in detail, taking an order
  assets/admin-shop.js    menu and shop switches, reports, staff
  assets/admin-boot.js    sign in, and start
```

## Setting it up

The same two steps as the kitchen screen: apply the backend, then put your
Supabase project URL and `anon` key in [`../config.js`](../config.js) — one
file, shared with the checkout and the kitchen screen. Both values belong in a
public file; **never** put the `service_role` key there.

Then make sure your own account has `role = 'admin'` in the `staff` table.
Signing in with a kitchen account gets a plain "this account is not an
administrator, the kitchen screen is at /kitchen/" rather than a dashboard
where every panel refuses separately.

Deploy it with the rest of the site and it lands at
`https://yourdomain/admin/`. `../_headers` already carries the headers it
needs, including `noindex`.

## The five tabs

**Orders.** Everything, filtered by day, status, or a search across order code,
phone number and name. Click a row for the address, every line with its price,
the totals and the timestamps. From here you can move an order along or cancel
it, exactly as the kitchen can — useful when someone rings to change something.
The default view is the last seven days; **Today** and **All time** are one tap
each.

**Take an order.** For a call or someone at the counter. Customers order
themselves through the [checkout](../ORDERING.md); this is for the ones who
ring up or walk in. Pick dishes, make the
required choices, set quantities, add line notes; then the customer's name and
number, and an address if it is going out. It records whether the order came in
by phone or over the counter, which is the one thing the reports cannot work out
afterwards.

The running total is a preview. When you save, the database prices the whole
order again from its own figures and that is the number on the confirmation and
the number the customer pays. The two agree because they follow the same rules —
but if they ever disagreed, the saved one is right.

**Menu & shop.** Prices, sold-out switches, and whether a dish is on the menu at
all. Those are two different things: *On today* is "we have run out", *On the
menu* is "we do not sell this any more". Individual choices can be switched off
too, so "no gizzard today" does not take the whole jollof off the menu.

Repricing never rewrites history. Every order line carries its own copy of the
name and the price it sold at, so last month's takings stay what they were.

This tab also holds the delivery areas and their fees — **none of them set**,
because the website never quoted one. A warning at the top of that table counts
how many are still unset, and the boxes are empty rather than showing a ₦0
nobody chose. Until you fill one in, customers ordering to that area are told
the fee is confirmed when you call, and the order arrives here marked *not
quoted — agree it on the call* with its total labelled **before delivery**.
Type `0` if delivery there really is free: that is a decision, it is kept, and
that area stops being counted. Clearing a box back to empty deliberately does
nothing at all — `Number('')` is 0, and free delivery is the one setting that
must never happen by accident.

And the pause switch, which stops the *website* taking orders; staff can still
take an order by phone or at the counter while it is off, which is the whole
point of pausing.

**Reports.** Completed orders only, by Lagos business day. Headline totals, a
day-by-day bar list, best sellers, and how orders arrived and left.
Cancellations are counted but kept out of the revenue.

Every date on this screen is the **Lagos** business day, not your computer's.
Africa/Lagos is an hour ahead of UTC, so a UTC day rolls over at 1am local — in
the middle of service. Running a report from a laptop in another country still
asks for the days the takings were recorded against.

**Staff.** Who has access, what role, and whether they are still active.
Deactivating someone takes effect on their next request, everywhere, without
touching their device.

Adding somebody has two steps, and the first one cannot happen here: create
their login in Supabase (Authentication → Users → Add user), then add them on
this tab by the same email. Creating a login needs the `service_role` key, and
that key must never reach a browser.

The database will not let you remove the last administrator — deactivating or
demoting yourself is refused when nobody else would be left, because it is the
one change no screen could undo.

## What this screen assumes about you

Everything on it is guarded by `is_admin()` in the database, checked on the
first line of every function it calls. Kitchen staff are refused each one
individually, so a leaked link or a stolen kitchen tablet does not become a way
to read the takings.

The queries themselves live in the database rather than being assembled from a
query string in the browser — see the note at the top of
`../backend/migrations/0006_admin.sql`. This screen can see every phone number
the restaurant holds; the code that exposes them sits next to the check that
guards them.

## Two irreversible actions

Marking an order handed over, and cancelling one. The database refuses to
reopen either, so both ask twice, and a cancellation needs a reason that the
customer is told.

## Testing it

```bash
cd ../test && npm install
cd .. && PGHOST=/tmp PGPORT=5433 ./test/run.sh
```

89 checks drive this dashboard in a real browser against a local Postgres
running the real migrations, plus an accessibility pass over every tab at three
widths. See [`../test/README.md`](../test/README.md).
