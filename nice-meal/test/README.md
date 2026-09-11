# Browser tests — the checkout and both dashboards

260 checks that drive the real screens in a real browser, against the real
migrations on a real Postgres. No mocked database, no mocked queries: an order
placed in these tests goes through `place_order()`, gets priced by the
database, trips the trigger, and comes back out through `kitchen_board()` and
`admin_orders()` under row level security, exactly as it will in the
restaurant.

The whole site is served the way it deploys — the checkout at `/order.html`, the
dashboards at `/kitchen/` and `/admin/` — so every relative link in them is
exercised as it really is.

```bash
npm install
PGHOST=/tmp PGPORT=5433 ./run.sh      # or wherever your local Postgres is
```

Needs Postgres 16, Node 18+, and Playwright's Chromium (`npm install` fetches
it; set `CHROMIUM` if you already have one somewhere else).

```
run.sh                rebuilds the database, starts the stub, runs every suite
stub-supabase.js      a stand-in for Supabase
seed.sql              three test accounts: kitchen, admin, and a non-staff one
kitchen.test.js       80 checks
checkout.test.js      69 checks
picks.test.js         32 checks
admin.test.js         79 checks
kitchen-a11y.test.js  axe-core over the kitchen screen
site-a11y.test.js     axe-core over the three public pages
admin-a11y.test.js    axe-core over all five admin tabs
```

They run in a set order, and `run.sh` says why: the kitchen suite asserts an
empty board so it goes before anything places an order, and the checkout and
picks suites read the seeded menu so they go before the admin suite starts
repricing it.
Each suite restores what it changed; the order just means they do not have to.

All three accessibility suites run at three widths, on WCAG 2.0 A/AA and 2.1
A/AA — plus axe's best-practice rules on the marketing pages.

## What the stub is, and what it is not

Supabase is three services behind one URL: GoTrue for auth, PostgREST for the
API, Realtime for the socket. `stub-supabase.js` answers the handful of routes
these screens use, in the shapes those three services use, and passes
everything else through to a local Postgres running the migrations from
[`../backend`](../backend).

So it is a genuine test of each screen's behaviour and of the database's
rules, and **not** a test of Supabase's own semantics. It does not verify JWTs
— it reads the claims and trusts them — and it polls `order_events` where real
Realtime reads the write-ahead log. If the dashboard broke against real
Supabase in a way it does not break here, it would be in one of those two
seams.

## What the kitchen suite covers

- **Sign in** — a wrong password, and an account that authenticates fine but
  has no `staff` row, which must be told so rather than shown an empty board.
- **The sound unlock** — that signing in leaves audio genuinely running; that a
  reload takes it away again and the orange bar comes back; that the bar only
  clears once the audio context really is running; that any tap anywhere will
  do. Checked against the browser's own `AudioContext`, not against what the
  interface claims.
- **An order arriving** — live, with the alarm, the tab title, the flash, and
  the repeat that keeps going until somebody touches it. And that no money
  reaches the screen.
- **Every status transition**, against the database afterwards.
- **The two confirm taps** — that one tap writes nothing, that the arm expires,
  and that the second tap is what commits.
- **Cancelling** — refused without a reason, and the reason stored.
- **A customer name containing markup**, which must render as characters.
- **Ageing** — amber, then red.
- **Four ways of being disconnected**: a dropped socket that must reconnect; an
  API outage, where the tickets on screen must stay put and the failure be
  stated; a socket that connects and then hangs, which only a timeout can
  notice; and no socket at all, where the poll must still deliver the order.
- **Session refresh** before the token expires, and a tablet switched off
  overnight coming back on its refresh token instead of asking for a password.
- **Layout** — that the columns fill the screen and nothing scrolls sideways at
  390px.
- **No unexpected failed requests, console errors, or CSP violations.**

## What the admin suite covers

- **Who gets in** — a wrong password, and a kitchen account, which authenticates
  perfectly well and must be turned away with a reason and a pointer to
  `/kitchen/` rather than shown a dashboard where every panel refuses one at a
  time.
- **The order list** — that it shows the money and the phone number the kitchen
  screen cannot see, that the detail panel carries the address and the lines,
  and that filtering by day, status and a search over code/phone/name all
  narrow it.
- **Moving an order along from the desk**, against the database afterwards,
  including the second tap on handing over and on cancelling, and that a
  cancellation with no reason never leaves the browser.
- **Taking an order** — that a required choice is demanded before a dish can be
  added, that a delivery with no address is refused, that the saved order is
  recorded as a phone order rather than a web one, and that **the total is the
  database's**, not the browser's preview.
- **The menu screen** — prices, sold-out switches, individual choices, delivery
  fees and the warning that counts how many are still unset. Including the
  cross-check that matters: a choice switched off here is unselectable on the
  order-taking screen a moment later.
- **Pausing** — that it stops the website, says so across the dashboard, and
  does *not* stop staff taking an order by phone.
- **Reports** — headline figures checked against the database directly.
- **Staff** — adding by email, the message when no such login exists, promoting,
  and the refusal to remove the last administrator, which also has to put the
  switch back rather than leave the screen lying.
- **A customer name containing markup**, in the list and in the detail panel.

## What the checkout suite covers

- **The menu** — that all of it arrives in one call, grouped into courses.
- **Adding a dish** — one press for a dish with no choices; for one with
  choices, the first press opens them and adding without answering is refused in
  words, on the dish, while the customer is still looking at it.
- **Quantities** — that the same dish with the same choices merges into one line
  rather than repeating, and that taking the last one off removes it.
- **What is off today** — a sold-out dish is listed, marked, and not addable; a
  switched-off choice cannot be picked and says why.
- **The minimum order** and the **free-delivery threshold**, including that no
  delivery line is shown at all for a pickup.
- **What the form refuses before sending** — a one-letter name, a phone number
  that could not be called, a delivery with no address — and that none of it
  reached the database.
- **Placing it** — that the order is recorded as a website order, that the
  confirmation quotes **the database's** price rather than the browser's
  preview, that the address and note survive, and that it lands on the kitchen
  board.
- **Finding it again** — remembered on the device, status fetched, status
  following what the kitchen does. And that the order code *alone* opens
  nothing: codes are sequential, so the random token is what protects them.
- **The three ways it can fail** — paused, unreachable, and never configured —
  each of which must end with the telephone in front of the customer.
- **That the rest of the site does not depend on any of it**: the homepage and
  the full menu are loaded with the API switched off and must render intact.
- **A dish name containing markup**, which must render as characters.

## What the picks suite covers

Picking dishes on the homepage and the full menu, and the handover to the
checkout. The buttons are the easy part; the seam is the point.

- **The controls appear on every dish** on both pages, and the bar stays out of
  the way until something is picked.
- **The stepper**, because being able to add three and not take one back off is
  the kind of small cruelty that sends people to the phone. Taking the last one
  off puts the add button back and takes the bar away.
- **That picking a dish sends no request anywhere.** These pages hold no keys and
  their CSP sets `connect-src 'none'`; a regression would otherwise surface as a
  silent CSP violation rather than a broken feature.
- **That picks survive moving between the two pages.**
- **The handover**: a dish with no choices arrives in the basket priced by *the
  database*, not by the page it was picked from; a dish that needs a choice is
  opened with the database's own options rather than guessed at; and the customer
  is told which is which.
- **That picks are spent, not repeated** — a reload does not re-stock a basket
  somebody just emptied.
- **When the two menus disagree**: a dish sold out today and a dish withdrawn
  from the menu are both named to the customer and left out, rather than
  vanishing.
- **That the full menu still reads, and still takes a pick, with the API down.**

## The accessibility suites

`kitchen-a11y.test.js` covers the sign-in screen, the board with a ticket on it,
and the open cancel sheet. `admin-a11y.test.js` covers the sign-in screen, the
order list, an order open, the cancel prompt, and all five tabs.
`site-a11y.test.js` covers the homepage, the full menu, and the checkout in
every state — choosing, options open, a validation error showing, the details
step, dishes carried over from the menu pages, paused, and unreachable. It also
covers both menu pages with a dish picked, and hovers the stepper and the bar.

Both hover each kind of button and re-run. That is not thoroughness for its own
sake: a hover that lightens a coloured fill under white text loses contrast
every time, and the first version of the kitchen dashboard shipped a green hover
at 3.96:1 on the most-pressed control on the screen. It was caught only because
a pointer happened to be resting on the right button. Now it is checked on
purpose.

Two more findings worth recording, both from the admin screens, because they
generalise:

**Contrast has to be measured against the surface the text is actually on.** A
grey that cleared 4.6:1 on the page background failed at 4.48:1 on a card,
because the cards are lighter than the page.

**Never dim a container with `opacity`.** A sold-out dish card at `opacity:
0.55` composited every colour inside it toward the background and quietly took
the price and the group labels below AA. Dim with colour instead.

**A button style belongs to the ground it was designed for.** The site's
secondary button is cream-on-transparent, built for the dark hero. Reused on the
checkout's white cards it measured **1.22:1** — not low-contrast but genuinely
invisible. This suite caught 258 violations on its first run, almost all of them
that one button repeated down the page.

It then caught the same mistake twice more. The "Add to order" button on the
full menu reused that same secondary style and measured **1.13:1** on the cream
rows — invisible on the page where most people would press it, while being
perfectly legible on the homepage, whose cards are dark. `.btn-secondary` now
carries a comment in `styles.css` saying which grounds it is for.

**A fixed bar is page content sitting outside every landmark.** The picks bar is
appended to the body, so on its first run axe reported the count and the
checkout link as content in no region at all. It lives in an `<aside>` now.
