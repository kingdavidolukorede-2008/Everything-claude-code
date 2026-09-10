#!/usr/bin/env bash
# Drives the kitchen dashboard end to end against the real migrations on a
# local Postgres. Nothing here touches a Supabase project.
#
#   npm install                              # once, in this folder
#   PGHOST=/tmp PGPORT=5433 ./test/run.sh    # from nice-meal/
#
# Needs: Postgres 16, Node 18+, and Playwright's Chromium. If Chromium is not
# where Playwright expects it, point CHROMIUM at the binary.
set -euo pipefail
cd "$(dirname "$0")"
DB=${DB:-nm_dash}
PORT=${PORT:-8199}
export DB PORT
export PGUSER=${PGUSER:-postgres}

# ── The stub holds database connections open, so it has to stop before the
# database is dropped. It also caches the highest order_events id it has sent,
# so restarting it is what keeps the realtime path honest once the sequences
# have been reset. Asking it to quit over HTTP works whatever directory the
# leftover process was started from.
stop_stub() {
  curl -sf --noproxy '*' -m 2 "http://127.0.0.1:$PORT/__test/quit" > /dev/null 2>&1 || true
  sleep 1
}
trap stop_stub EXIT
stop_stub

# ── Rebuild the database from the migrations the real project uses ──────────
psql -q -c "drop database if exists $DB;" -c "create database $DB;"
for f in ../backend/test/00_supabase_stub.sql ../backend/migrations/*.sql; do
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
up=""
for _ in $(seq 1 20); do
  if curl -sf --noproxy '*' -m 1 "http://127.0.0.1:$PORT/kitchen/config.js" > /dev/null; then up=1; break; fi
  sleep 0.5
done
# Say so here rather than letting every browser step time out against nothing.
if [ -z "$up" ]; then
  echo "The stub never came up. Its output:"
  cat stub.log
  exit 1
fi
echo "stub listening on $PORT"

# ── Run ─────────────────────────────────────────────────────────────────────
status=0
for suite in kitchen.test.js kitchen-a11y.test.js admin.test.js admin-a11y.test.js; do
  [ -f "$suite" ] || continue
  echo
  echo "═══ $suite ═══"
  NO_PROXY=127.0.0.1,localhost node "$suite" || status=$?
done
exit $status
