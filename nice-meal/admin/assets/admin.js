/* Nice Meal — admin dashboard: the shell.
 *
 * Sign-in, the tab router, and the handful of helpers every view needs. The
 * views themselves are in admin-orders.js and admin-shop.js; admin-boot.js
 * starts the whole thing once they have registered.
 *
 * Two things here are worth reading rather than skimming:
 *
 * Every date and time on this screen is rendered in Africa/Lagos, never in
 * whatever timezone the browser happens to be in. The database's notion of a
 * day is the Lagos business day, so a report run from a laptop in another
 * country has to ask for the same days the takings were recorded against, or
 * it silently reports the wrong window.
 *
 * Every value that came out of the database is put on screen with
 * textContent. Customer names, addresses and order notes are typed by
 * strangers; this page is where an administrator reads them.
 */
(function (global) {
  'use strict';

  var cfg = global.NM_CONFIG || {};
  var admin = {};

  /* ── Small helpers ──────────────────────────────────────────────────────*/

  function el(id) { return document.getElementById(id); }

  function elt(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text !== undefined && text !== null) { n.textContent = String(text); }
    return n;
  }

  /* Money formatting lives in nm-client.js, which every screen loads, so a
     customer's confirmation and this order list write the same amount the same
     way. */
  var naira = global.NM.naira;
  var kobo = global.NM.kobo;

  /* The Lagos business day as YYYY-MM-DD, whatever the browser thinks today
     is. en-CA is the shortest way to that format. */
  function lagosDay(date) {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(date || new Date());
    } catch (e) {
      return (date || new Date()).toISOString().slice(0, 10);
    }
  }

  function daysAgo(n) {
    return lagosDay(new Date(Date.now() - n * 86400000));
  }

  function whenText(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return ''; }
    var opts = { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit', hour12: false };
    var time;
    try { time = d.toLocaleTimeString('en-GB', opts); }
    catch (e) { time = d.toISOString().slice(11, 16); }
    var day = lagosDay(d);
    if (day === lagosDay()) { return 'Today ' + time; }
    if (day === daysAgo(1))  { return 'Yesterday ' + time; }
    return day.slice(8) + '/' + day.slice(5, 7) + ' ' + time;
  }

  var LABEL = {
    fulfilment: { delivery: 'Delivery', pickup: 'Pickup', dine_in: 'Dine in' },
    channel:    { web: 'Website', phone: 'Phone', walk_in: 'Counter' },
    status:     { 'new': 'New', preparing: 'Cooking', ready: 'Ready',
                  completed: 'Completed', cancelled: 'Cancelled' }
  };
  function label(kind, key) {
    return (LABEL[kind] && LABEL[kind][key]) || key || '';
  }

  /* ── Messages ───────────────────────────────────────────────────────────*/

  var toastTimer = null;
  function toast(msg) {
    var t = el('toast');
    t.textContent = msg;
    t.hidden = false;
    el('live').textContent = msg;
    if (toastTimer) { global.clearTimeout(toastTimer); }
    toastTimer = global.setTimeout(function () { t.hidden = true; }, 3500);
  }

  function fail(msg) {
    var b = el('app-error');
    b.textContent = msg;
    b.hidden = false;
  }
  function clearFail() { var b = el('app-error'); b.hidden = true; b.textContent = ''; }

  function show(node, msg) { node.textContent = msg; node.hidden = false; }
  function hide(node) { node.hidden = true; node.textContent = ''; }

  /* Everything that talks to the database goes through here, so a dead session
     lands on the sign-in screen once rather than in five different places.

     It deliberately does NOT clear the error banner on success. A refused
     change is followed by a refetch to put the screen back in step with the
     database, and that refetch succeeds — so clearing here would wipe the
     explanation a fraction of a second after showing it. The banner is cleared
     when the user starts something new instead: see `begin`. */
  function call(fn, args) {
    return admin.client.rpc(fn, args || {}).catch(function (err) {
      if (err.status === 401) { admin.toSignIn('Your session expired. Sign in again.'); }
      throw err;
    });
  }

  /* Call at the top of anything the user just initiated. */
  function begin() { clearFail(); }

  /* A second tap for anything that cannot be undone. Same pattern as the
     kitchen screen, and for the same reason. */
  var pending = null;
  function confirmTap(btn, run) {
    if (pending && pending.btn === btn) {
      global.clearTimeout(pending.timer);
      btn.textContent = pending.label;
      btn.classList.remove('is-confirming');
      pending = null;
      run();
      return;
    }
    clearConfirm();
    pending = { btn: btn, label: btn.textContent, timer: global.setTimeout(clearConfirm, 5000) };
    btn.textContent = 'Tap again to confirm';
    btn.classList.add('is-confirming');
  }
  function clearConfirm() {
    if (!pending) { return; }
    global.clearTimeout(pending.timer);
    if (pending.btn && pending.btn.parentNode) {
      pending.btn.textContent = pending.label;
      pending.btn.classList.remove('is-confirming');
    }
    pending = null;
  }

  /* ── Views ──────────────────────────────────────────────────────────────*/

  admin.views = {};
  var current = null;

  function route() {
    var name = (global.location.hash || '').replace(/^#\/?/, '') || 'orders';
    if (!admin.views[name]) { name = 'orders'; }
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      var isIt = tabs[i].getAttribute('data-view') === name;
      if (isIt) { tabs[i].setAttribute('aria-current', 'page'); }
      else { tabs[i].removeAttribute('aria-current'); }
    }
    var views = document.querySelectorAll('.view');
    for (var j = 0; j < views.length; j++) {
      views[j].hidden = views[j].id !== 'v-' + name;
    }
    clearConfirm();
    clearFail();
    current = name;
    if (admin.views[name].enter) { admin.views[name].enter(); }
  }

  admin.go = function (name) {
    if (global.location.hash === '#/' + name) { route(); }
    else { global.location.hash = '#/' + name; }
  };
  admin.currentView = function () { return current; };

  /* ── Session ────────────────────────────────────────────────────────────*/

  admin.me = null;

  admin.toSignIn = function (message) {
    document.body.className = '';
    el('view-app').hidden = true;
    el('view-signin').hidden = false;
    if (message) { show(el('signin-error'), message); } else { hide(el('signin-error')); }
    el('email').focus();
  };

  admin.start = function () {
    document.body.className = 'running';
    el('view-signin').hidden = true;
    el('view-app').hidden = false;
    el('whoami').textContent = admin.me ? admin.me.display_name : '';
    if (!global.location.hash) { global.location.hash = '#/orders'; }
    route();
    admin.refreshPausedBanner();
  };

  /* Signing in is not the same as being an administrator. Without this check a
     kitchen account would reach a dashboard where every panel returned "Not
     authorised" one at a time. */
  admin.checkAdmin = function () {
    return admin.client.rpc('me', {})
      .then(function (row) {
        if (!row || !row.is_active) {
          throw new Error('This account is not set up as staff.');
        }
        if (row.role !== 'admin') {
          throw new Error('This account is kitchen staff, not an administrator. '
            + 'The kitchen screen is at /kitchen/.');
        }
        admin.me = row;
        return row;
      });
  };

  /* The pause switch is shop-wide and can be flipped from the menu screen or
     by another administrator, so the banner is refreshed rather than drawn
     once at sign-in. */
  admin.refreshPausedBanner = function () {
    return admin.client.select('settings', 'select=accepting_orders,pause_reason&limit=1')
      .then(function (rows) {
        var s = rows && rows[0];
        var b = el('paused-banner');
        if (s && s.accepting_orders === false) {
          b.textContent = 'The website is not taking orders'
            + (s.pause_reason ? ' — ' + s.pause_reason : '')
            + '. Staff can still take orders by phone or at the counter.';
          b.hidden = false;
        } else {
          b.hidden = true;
        }
        return s;
      })
      .catch(function () { /* a banner is not worth an error message */ });
  };

  global.addEventListener('hashchange', route);

  /* ── Exports ────────────────────────────────────────────────────────────*/

  admin.cfg = cfg;
  admin.el = el;
  admin.elt = elt;
  admin.naira = naira;
  admin.kobo = kobo;
  admin.lagosDay = lagosDay;
  admin.daysAgo = daysAgo;
  admin.whenText = whenText;
  admin.label = label;
  admin.toast = toast;
  admin.fail = fail;
  admin.clearFail = clearFail;
  admin.show = show;
  admin.hide = hide;
  admin.call = call;
  admin.begin = begin;
  admin.confirmTap = confirmTap;
  admin.clearConfirm = clearConfirm;

  global.NM = global.NM || {};
  global.NM.admin = admin;
}(window));
