# Kitchen dashboard — tests

Eighty checks that drive the real dashboard in a real browser, against the real
migrations on a real Postgres. No mocked database, no mocked queries: an order
placed in these tests goes through `place_order()`, gets priced by the
database, trips the trigger, and comes back out through `kitchen_board()` under
row level security, exactly as it will in the restaurant.

```bash
npm install
PGHOST=/tmp PGPORT=5433 ./run.sh      # or wherever your local Postgres is
```

Needs Postgres 16, Node 18+, and Playwright's Chromium (`npm install` fetches
it; set `CHROMIUM` if you already have one somewhere else).

```
run.sh              rebuilds the database, starts the stub, runs both suites
stub-supabase.js    a stand-in for Supabase
seed.sql            three test accounts: kitchen, admin, and a non-staff one
dashboard.test.js   80 checks
a11y.test.js        axe-core over every screen and state, at three widths
```

## What the stub is, and what it is not

Supabase is three services behind one URL: GoTrue for auth, PostgREST for the
API, Realtime for the socket. `stub-supabase.js` answers the handful of routes
this dashboard uses, in the shapes those three services use, and passes
everything else through to a local Postgres running the migrations from
[`../../backend`](../../backend).

So it is a genuine test of the dashboard's behaviour and of the database's
rules, and **not** a test of Supabase's own semantics. It does not verify JWTs
— it reads the claims and trusts them — and it polls `order_events` where real
Realtime reads the write-ahead log. If the dashboard broke against real
Supabase in a way it does not break here, it would be in one of those two
seams.

## What it covers

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

`a11y.test.js` runs axe-core over the sign-in screen, the board with a ticket
on it, and the open cancel sheet, at 1400px, 900px and 390px, on WCAG 2.0 A/AA
and 2.1 A/AA.

It also hovers each kind of button and re-runs. That is not thoroughness for
its own sake: a hover that lightens a coloured fill under white text loses
contrast every time, and the first version of this dashboard shipped a green
hover at 3.96:1 on the most-pressed control on the screen. It was caught only
because a pointer happened to be resting on the right button. Now it is
checked on purpose.
