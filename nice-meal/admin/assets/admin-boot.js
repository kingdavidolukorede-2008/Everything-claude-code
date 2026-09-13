/* Nice Meal — admin: sign in, and start. Loaded last, once every view has
   registered itself on NM.admin.views. */
(function (global) {
  'use strict';

  var A = global.NM.admin;
  var el = A.el;
  var cfg = A.cfg;

  if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf('YOUR-PROJECT-REF') !== -1) {
    document.body.className = '';
    el('view-signin').hidden = false;
    A.show(el('signin-error'), 'This dashboard has not been configured yet. '
      + 'Put your Supabase project URL and anon key in admin/config.js.');
    el('signin-submit').disabled = true;
    return;
  }

  A.client = new global.NM.Client(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  el('signin-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    A.hide(el('signin-error'));
    var btn = el('signin-submit');
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    A.client.signIn(el('email').value, el('password').value)
      .then(A.checkAdmin)
      .then(function () {
        el('password').value = '';
        A.start();
      })
      .catch(function (err) {
        A.client.signOut();
        A.show(el('signin-error'), err.message === 'Invalid login credentials'
          ? 'That email and password did not match.'
          : err.message);
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = 'Sign in';
      });
  });

  el('signout').addEventListener('click', function () {
    A.client.signOut().then(function () { A.toSignIn(''); });
  });

  // A browser tab left open over lunch comes back with a dead access token and
  // a good refresh token. Spend the refresh token before asking for a password.
  if (A.client.token()) {
    var expiry = A.client.session.expires_at || 0;
    var ready = (expiry - Date.now() < 60000) ? A.client.refresh() : Promise.resolve();
    ready.then(A.checkAdmin).then(A.start).catch(function (err) {
      A.client.signOut();
      A.toSignIn(err.status === 401 || err.status === 403 || !err.status ? '' : err.message);
    });
  } else {
    A.toSignIn('');
  }
}(window));
