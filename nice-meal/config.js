/* Nice Meal — the one file you edit.
 *
 * Shared by the checkout on the website, the kitchen dashboard and the admin
 * dashboard. Put your Supabase project's values here once; there is nowhere
 * else to change them, which is the point — three copies of a key is three
 * chances to update two of them.
 *
 * From Supabase: Project Settings → API.
 *
 * Both values belong in a public file. The anon key is a published identifier,
 * not a password: everything it can reach is guarded by the row level security
 * policies in backend/migrations/0004_rls.sql and by the checks at the top of
 * every function these pages call.
 *
 * NEVER put the service_role key here. That key bypasses row level security
 * entirely, and this file is served to whoever asks for it.
 */
window.NM_CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT-REF.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR-ANON-PUBLIC-KEY',

  /* The restaurant's number, shown whenever ordering online is not possible —
     the kitchen has paused it, or the database cannot be reached at all. */
  PHONE: '0915 742 8604',
  PHONE_TEL: '+2349157428604',

  /* ── Kitchen dashboard only ─────────────────────────────────────────────*/

  /* The board is refetched on this interval whether or not the live socket is
     working. It is the reason a dropped connection costs seconds, not a
     service, and it is the floor on how late an order can be noticed. */
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
