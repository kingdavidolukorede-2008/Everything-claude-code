/* Nice Meal — admin dashboard configuration.
 *
 * The same two values as kitchen/config.js. They are kept in a separate file
 * so each dashboard can be deployed on its own if you ever want to.
 *
 * Both are meant to be public: the anon key is a published identifier, and
 * everything it can reach is guarded by the row level security policies in
 * ../backend/migrations/0004_rls.sql and by the is_admin() check at the top of
 * every function this screen calls.
 *
 * NEVER put the service_role key here. That key bypasses row level security
 * entirely, and anything in this file is served to the browser.
 */
window.NM_CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT-REF.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR-ANON-PUBLIC-KEY'
};
