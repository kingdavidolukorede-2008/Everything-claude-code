#!/usr/bin/env bash
# Applies every migration to a scratch database and runs the suite. Needs a
# local Postgres 16; nothing here touches a Supabase project.
#
#   PGHOST=/tmp PGPORT=5433 ./test/run.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB=${DB:-nm_test}
psql -q -U postgres -c "drop database if exists $DB;" -c "create database $DB;"
for f in test/00_supabase_stub.sql migrations/*.sql; do
  psql -q -U postgres -d "$DB" -v ON_ERROR_STOP=1 -f "$f" >/dev/null
  echo "applied  $f"
done
# Supabase grants table privileges to anon/authenticated and relies on RLS for
# the gating, so the tests have to run under the same arrangement or they would
# pass for the wrong reason.
psql -q -U postgres -d "$DB" \
  -c "grant select, insert, update, delete on all tables in schema public to anon, authenticated;"
# The suite runs with ON_ERROR_STOP off, so that one refused statement cannot
# abort the rest. The cost is that a statement which errors is skipped rather
# than failed — it never reaches _results and never gets counted. So the run is
# only trustworthy if psql reported no errors at all: anything genuinely
# expected to be refused goes through _denied(), which catches it in plpgsql
# and records a PASS.
out=$(psql -U postgres -d "$DB" -f test/01_tests.sql 2>&1)
echo "$out" | sed -n '/results/,$p'
if echo "$out" | grep -q '^psql:.*ERROR:'; then
  echo
  echo "A statement errored instead of being checked, so it was skipped:"
  echo "$out" | grep '^psql:.*ERROR:'
  exit 1
fi
