#!/usr/bin/env bash
# Drives the kitchen dashboard end to end against the real migrations on a
# local Postgres. Nothing here touches a Supabase project.
#
#   npm install                              # once, in this folder
#   PGHOST=/tmp PGPORT=5433 ./test/run.sh    # from kitchen/
#
# Needs: Postgres 16, Node 18+, and Playwright's Chromium. If Chromium is not
# where Playwright expects it, point CHROMIUM at the binary.
set -euo pipefail
cd "$(dirname "$0")"
DB=${DB:-nm_dash}
PORT=${PORT:-8199}
export DB PORT
export PGUSER=${PGUSER:-postgres}

# ── The stub holds connections open, so stop it before dropping the database.
# It also caches the highest order_events id it has sent; restarting it is what
# keeps that honest across a reset of the sequences.
stop_stub() {
  local here; here="$(pwd)"
  for p in $(ls /proc 2>/dev/null | grep -E '^[0-9]+$' || true); do
    if [ "$(readlink "/proc/$p/cwd" 2>/dev/null || true)" = "$here" ] \
    && [ "$(cat "/proc/$p/comm" 2>/dev/null || true)" = "node" ]; then
      kill "$p" 2>/dev/null || true
    fi
  done
  sleep 1
}
trap stop_stub EXIT
stop_stub

# ── Rebuild the database from the migrations the real project uses ──────────
psql -q -c "drop database if exists $DB;" -c "create database $DB;"
for f in ../../backend/test/00_supabase_stub.sql ../../backend/migrations/*.sql; do
  psql -q -d "$DB" -v ON_ERROR_STOP=1 -f "$f" > /dev/null
done
# Supabase grants table privileges to anon/authenticated and leaves the gating
# to row level security, so the stub has to do the same or the tests would pass
# for the wrong reason.
psql -q -d "$DB" \
  -c "grant select, insert, update, delete on all tables in schema public to anon, authenticated;" \
  -c "grant usage, select on all sequences in schema public to anon, authenticated;"
psql -q -d "$DB" -v ON_ERROR_STOP=1 -f seed.sql > /dev/null
echo "database $DB rebuilt"

# ── Start the stand-in for Supabase ─────────────────────────────────────────
NO_PROXY=127.0.0.1,localhost node stub-supabase.js > stub.log 2>&1 &
for _ in $(seq 1 20); do
  if curl -sf --noproxy '*' -m 1 "http://127.0.0.1:$PORT/config.js" > /dev/null; then break; fi
  sleep 0.5
done
echo "stub listening on $PORT"

# ── Run ─────────────────────────────────────────────────────────────────────
status=0
NO_PROXY=127.0.0.1,localhost node dashboard.test.js || status=$?
NO_PROXY=127.0.0.1,localhost node a11y.test.js      || status=$?
exit $status
