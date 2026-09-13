# Nice Meal — ordering online

`order.html` is the checkout: the page where a customer picks their food, says
where it's going, and gets an order code. It is the last of the four screens,
and the one that finally connects the website to the kitchen.

Static HTML, CSS and JavaScript like the rest of the site — no build step. It
uses the shared Supabase client in
[`assets/js/nm-client.js`](assets/js/nm-client.js) and needs the database in
[`backend/`](backend) applied first.

```
order.html              the checkout
assets/css/order.css    on top of styles.css, using its tokens
assets/js/order.js      the three steps, the basket, tracking
assets/js/picks.js      "Add to order" on the homepage and the full menu
config.js               your Supabase URL and anon key — shared with both dashboards
```

## Starting an order from the menu pages

Every dish on the homepage and on the full menu has an **Add to order** button,
and a bar along the bottom counts what has been picked. Pressing **Go to
checkout** carries it here.

**The bar shows a count and no money.** The prices on those pages are typed into
the HTML; the prices a customer pays come from the database. A running total
there would be quoting the wrong source, and the customer would find out at the
worst possible moment.

**A pick records which dish, and nothing else.** Not the choice, not the price.
The static menu is a second copy of the kitchen's menu and the two can drift —
they had, in this repository: the menu page offered *"Fried chicken / Grilled
chicken"* where the database's own options were *"Fried"* and *"Grilled"*.
Matching a choice across that gap would have failed silently for one dish in
seven. The page now prints the database's own questions and option names, and
`test/picks.test.js` compares the two against `public_menu()` so that editing
either one alone fails the suite. That closes today's gap; it does not make a
second copy of a menu safe to trust, so the choices are still asked for here,
against options read from the database a moment earlier.

On arrival this page says what happened to every pick:

| What it found | What it does |
|---|---|
| A dish with no choices | Adds it, at the database's price |
| A dish that needs a choice | Opens that dish with its real options showing, and says so |
| A dish sold out today | Names it, and leaves it out |
| A dish no longer on the menu | Names it, and leaves it out |

Picks are spent when they are applied, so a reload does not quietly re-stock a
basket somebody had just emptied.

**`index.html` and `nice-meal-menu.html` still make no requests.** `picks.js`
talks to `localStorage` and nothing else; their CSP keeps `connect-src 'none'`,
and there is a test that picks a dish and asserts that not one request left the
page.

## How it works

**Three steps.** Choose your food → where it's going → done. Every dish on the
menu, the delivery areas and the shop's settings arrive in **one** call
(`public_menu()`), because the customer is on a phone on mobile data and every
round trip costs them something.

**Nothing is paid online.** The order is a ticket. The confirmation says so in
those words, twice, and names the amount to have ready.

**The price on screen is a preview.** `place_order()` reads every figure from
the database again when it saves, and *that* is what the confirmation shows and
what the customer pays. They agree because they follow the same rules — but if
they ever disagreed, the saved one is right. The browser never sends a price.

**Sold-out dishes are shown, marked, and not addable.** A dish that vanished
from the list looks like a dish the restaurant never sold. Same for individual
choices: "no gizzard today" greys out gizzard, not the whole jollof.

**A required choice is asked for on the dish, not at the end.** The database
refuses an order missing one, so asking at checkout would mean rejecting a
completed form. The card says "Choose", opens the options, and only then adds.

## Finding an order again

After ordering, the code and a random token are kept in `localStorage`, and
"Your recent orders" shows the last five with a live status. No account, no
email link, no password.

The token matters. Order codes are sequential — `NM-0910-07` — so the code
alone would let anyone read the next person's order. `get_order_status()`
requires the code **and** the token, and there is a test that confirms the code
alone returns nothing.

Clearing the browser's data loses the list. The order is unaffected; the
restaurant has it, and they have the customer's phone number.

## When it can't take an order

Both cases end the same way — with the telephone in front of the customer,
because the restaurant still has one:

| What happened | What the page shows |
|---|---|
| The kitchen paused online ordering | The reason they gave, and a call button. The menu is not shown as orderable. |
| The database is unreachable, or `config.js` was never filled in | "Something's wrong at our end — not yours", and a call button. |

Both are covered by tests. A checkout that fails silently loses the sale twice:
once now, and again when the customer decides the place looks broken.

**The rest of the site does not depend on any of this.** `index.html` and
`nice-meal-menu.html` have no keys, make no requests, and render identically
with the database switched off — there is a test for that too. Only this one
page opens `connect-src`, and only to Supabase.

## Delivery fees

Read from `delivery_areas`, which holds **three** states, not two:

| `fee_kobo` | The customer is told | The order stores |
|---|---|---|
| a number | that fee, added to the total | the fee |
| `0` | **free delivery** | `0` |
| *not set* | **the fee is confirmed when we call** | no fee, and a total that is the food alone |

The third one exists because all seven areas start with no fee: the website
never quoted one, and inventing one on a restaurant's behalf was not on. Held
as ₦0, that placeholder was indistinguishable from a decision to deliver for
free — and the checkout read it as exactly that, offering every customer "free
delivery" and printing a total that looked settled. The rider would have been
the one to break that promise.

So an unset fee is now absent rather than zero, all the way through: the area
list says it is coming, the delivery line says "We will confirm when we call",
the total reads "₦2,000 + delivery", the confirmation repeats it, and the order
reaches the admin dashboard marked *not quoted — agree it on the call*. Nothing
downstream can mistake it for nothing owed, which is the entire point.

**Setting a fee of ₦0 is still available and still means free** — it is a
decision, it is stored as one, and the admin screen stops counting that area as
unset. Clearing the box back to empty changes nothing, because `Number('')` is
0 and a fee of zero is the one thing that must never be set by accident.

If a free-delivery threshold is configured, the fee is waived above it and the
line reads "Free" — a real zero, because the shop decided it.

## Setting it up

1. Apply [`backend/`](backend) to your Supabase project.
2. Put your project URL and `anon` key in [`config.js`](config.js) — one file,
   shared by the checkout and both dashboards.
3. Set the delivery fees on the admin dashboard's **Menu & shop** tab.
4. Deploy. `_headers` already carries the one rule this page needs.

That's it — there is no separate step to "turn on" ordering. The links from the
homepage, the nav and the full-menu page all already point here.

## Testing it

```bash
cd test && npm install
cd .. && PGHOST=/tmp PGPORT=5433 ./test/run.sh
```

79 checks drive this page in a real browser against a local Postgres running
the real migrations, plus an accessibility pass over every state of it. See
[`test/README.md`](test/README.md).
