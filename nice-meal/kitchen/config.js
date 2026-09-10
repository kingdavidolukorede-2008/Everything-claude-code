/* Nice Meal — kitchen dashboard configuration.
 *
 * Replace the two placeholders with the values from your Supabase project
 * (Project Settings → API). Both are meant to be public: the anon key is a
 * published identifier, and every table it can reach is guarded by the row
 * level security policies in ../backend/migrations/0004_rls.sql.
 *
 * NEVER put the service_role key here. That key bypasses row level security
 * entirely, and anything in this file is served to the browser.
 */
window.NM_CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT-REF.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR-ANON-PUBLIC-KEY',

  /* The board is refetched on this interval whether or not the live socket is
     working. It is the reason a dropped connection costs seconds, not a
     service. Do not raise it much: it is the floor on how late an order can
     be noticed. */
  POLL_SECONDS: 15,

  /* How long the board may go without a successful refresh before the header
     says so out loud. Three missed polls by default. */
  STALE_SECONDS: 45,

  /* An order nobody has touched re-alarms this often. One missed beep in a
     loud kitchen is one missed order, so the alert repeats rather than
     sounding once. */
  ALERT_REPEAT_SECONDS: 30,

  /* Ticket ages that turn a ticket amber, then red. */
  WARN_MINUTES: 10,
  LATE_MINUTES: 20
};
