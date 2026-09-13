/* Nice Meal — the kitchen dashboard.
 *
 * This screen sits on a counter for a ten-hour shift and is read from an
 * arm's length by someone with their hands full. Three things decide whether
 * it is any good, and all three are failure modes rather than features:
 *
 *   1. It must not go quiet without saying so. The alert sound needs a
 *      browser gesture to start, and that permission is lost on every reload;
 *      a tablet that rebooted overnight comes back silent. So the sound state
 *      is read from the audio context itself, never assumed, and every alert
 *      also flashes the screen and changes the tab title.
 *   2. It must not go stale without saying so. The live socket is only ever a
 *      nudge — the board is refetched on a timer regardless, and the header
 *      shows how long ago that last succeeded.
 *   3. It must not lose an order to a mis-tap. Handing over and cancelling
 *      cannot be undone from here, so both ask twice.
 */
(function () {
  'use strict';

  var cfg = window.NM_CONFIG || {};
  var POLL_MS   = (cfg.POLL_SECONDS || 15) * 1000;
  var ALERT_MS  = (cfg.ALERT_REPEAT_SECONDS || 30) * 1000;
  var WARN_MIN  = cfg.WARN_MINUTES || 10;
  var LATE_MIN  = cfg.LATE_MINUTES || 20;
  var STALE_MS  = (cfg.STALE_SECONDS || 45) * 1000;

  var $ = function (id) { return document.getElementById(id); };

  var el = {
    body:       document.body,
    signin:     $('view-signin'),
    signinForm: $('signin-form'),
    signinErr:  $('signin-error'),
    signinBtn:  $('signin-submit'),
    email:      $('email'),
    password:   $('password'),
    board:      $('view-board'),
    conn:       $('conn'),
    freshness:  $('freshness'),
    soundbar:   $('soundbar'),
    soundOn:    $('sound-on'),
    soundTest:  $('sound-test'),
    whoami:     $('whoami'),
    signout:    $('signout'),
    boardError: $('board-error'),
    paused:     $('paused-banner'),
    pausedWhy:  $('paused-reason'),
    liveNew:    $('live-new'),
    liveQuiet:  $('live-quiet'),
    toast:      $('toast'),
    cancelOv:   $('cancel-overlay'),
    cancelWhich:$('cancel-which'),
    cancelWhy:  $('cancel-reason'),
    cancelErr:  $('cancel-error'),
    cancelBack: $('cancel-back'),
    cancelGo:   $('cancel-confirm'),
    cols: {
      'new':       { body: $('col-new'),       count: $('count-new'),       empty: $('empty-new') },
      'preparing': { body: $('col-preparing'), count: $('count-preparing'), empty: $('empty-preparing') },
      'ready':     { body: $('col-ready'),     count: $('count-ready'),     empty: $('empty-ready') }
    }
  };

  if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf('YOUR-PROJECT-REF') !== -1) {
    el.body.className = '';
    el.signin.hidden = false;
    fail(el.signinErr, 'This dashboard has not been configured yet. Put your Supabase project URL and anon key in kitchen/config.js.');
    el.signinBtn.disabled = true;
    return;
  }

  var client = new window.NM.Client(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  /* ── State ──────────────────────────────────────────────────────────────*/

  var orders = [];            // whatever kitchen_board() last returned
  var renderKey = '';         // what is currently drawn, so we redraw only on change
  var pendingRender = false;  // a redraw held back while a confirm tap is live
  var pendingConfirm = null;  // { id, act, button, timer }
  var cancelling = null;      // the order the cancel sheet is about
  var lastGood = 0;           // when the board last loaded successfully
  var fetching = false;
  var queued = false;         // a refresh asked for while one was in flight
  var settingsAge = 0;        // polls since the shop settings were last read
  var pollTimer = null;
  var alertTimer = null;
  var rt = null;
  var me = null;
  var wakeLock = null;

  /* ── The alert ──────────────────────────────────────────────────────────
     A synthesised two-tone chime rather than an audio file: nothing extra to
     download, nothing to 404, and a square wave carries over an extractor fan
     better than a soft one. */

  var audio = null;

  function audioReady() {
    return !!(audio && audio.state === 'running');
  }

  /* `announce` plays a short chime back on success. On the sound controls that
     is the whole point — it proves the thing works rather than promising it.
     On an incidental tap it would sound like an order arriving, so it is off. */
  function unlockSound(announce) {
    try {
      var Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) { showSoundState(); return; }
      var fresh = !audio;
      if (!audio) { audio = new Ctor(); }
      var done = function () {
        showSoundState();
        if (announce && audioReady()) { chime(0.35); }
        if (fresh && !announce && audioReady()) { toast('Alert sound is on.'); }
      };
      // resume() returns a promise in current browsers and nothing in older
      // ones, so handle both rather than assuming.
      var r = audio.resume ? audio.resume() : null;
      if (r && r.then) { r.then(done, showSoundState); } else { done(); }
    } catch (e) {
      showSoundState();
    }
  }

  function tone(at, freq, dur, gainPeak) {
    var osc = audio.createOscillator();
    var gain = audio.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    // A hard start and stop on a square wave clicks; ramp both ends.
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(gainPeak, at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(at);
    osc.stop(at + dur + 0.02);
  }

  function chime(volume) {
    if (!audioReady()) { return false; }
    var v = volume || 0.5;
    var t = audio.currentTime + 0.02;
    for (var i = 0; i < 3; i++) {
      tone(t + i * 0.46, 784, 0.15, v);
      tone(t + i * 0.46 + 0.17, 1175, 0.22, v);
    }
    return true;
  }

  function showSoundState() {
    var on = audioReady();
    el.soundbar.hidden = on;
    el.soundTest.hidden = !on;
  }

  /* The screen flashes whether or not the sound is on. This is the half of
     the alert that cannot be blocked by a browser policy. */
  function showAlarm(count) {
    el.body.classList.add('alarm');
    document.title = '(' + count + ') NEW ORDER — Nice Meal';
  }

  function clearAlarm() {
    el.body.classList.remove('alarm');
    document.title = 'Kitchen — Nice Meal';
  }

  function unheard() {
    var n = 0;
    for (var i = 0; i < orders.length; i++) {
      if (!orders[i].acknowledged_at) { n++; }
    }
    return n;
  }

  function checkAlarm(isNewArrival) {
    var n = unheard();
    if (n === 0) {
      clearAlarm();
      if (alertTimer) { window.clearInterval(alertTimer); alertTimer = null; }
      return;
    }
    // The flash and the title are just state, refreshed on every poll. The
    // sound is an event, and only fires on an arrival or on the repeat below —
    // otherwise the poll interval would quietly become the alert interval.
    showAlarm(n);
    if (isNewArrival) {
      el.liveNew.textContent = n === 1
        ? 'New order waiting.'
        : n + ' orders waiting to be started.';
      chime();
    }
    if (!alertTimer) {
      // Keep sounding. One beep missed across a busy kitchen is one order
      // missed, and nobody finds out until the customer calls.
      alertTimer = window.setInterval(function () {
        if (unheard() > 0) { showAlarm(unheard()); chime(); } else { checkAlarm(false); }
      }, ALERT_MS);
    }
  }

  /* ── Rendering ──────────────────────────────────────────────────────────
     Built with createElement and textContent throughout. Customer names and
     order notes are typed by strangers on the internet and land here
     unescaped; innerHTML would make this screen the easiest way into the
     restaurant's own systems. */

  function elt(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text !== undefined && text !== null) { n.textContent = String(text); }
    return n;
  }

  function minutesSince(iso) {
    var t = Date.parse(iso);
    if (isNaN(t)) { return 0; }
    return Math.max(0, Math.floor((Date.now() - t) / 60000));
  }

  function ageText(iso) {
    var m = minutesSince(iso);
    if (m < 1) { return 'just now'; }
    if (m < 60) { return m + ' min'; }
    var h = Math.floor(m / 60);
    return h + 'h ' + (m - h * 60) + 'm';
  }

  var FULFILMENT = {
    delivery: 'Delivery',
    pickup:   'Pickup',
    dine_in:  'Dine in'
  };

  // What the last button says depends on where the food is going: "handed
  // over" is wrong for a rider and confusing for a table.
  var HANDOVER = {
    delivery: 'Sent with rider',
    pickup:   'Picked up',
    dine_in:  'Served'
  };

  var NEXT = { 'new': 'preparing', 'preparing': 'ready', 'ready': 'completed' };
  var NEXT_LABEL = { 'new': 'Start cooking', 'preparing': 'Ready' };

  function ticket(o) {
    var card = elt('article', 'ticket ticket--' + o.status);
    card.setAttribute('data-id', o.id);
    if (!o.acknowledged_at) { card.classList.add('is-unheard'); }

    var mins = minutesSince(o.placed_at);
    if (mins >= LATE_MIN)      { card.classList.add('is-late'); }
    else if (mins >= WARN_MIN) { card.classList.add('is-warm'); }

    var head = elt('header', 'ticket-head');
    head.appendChild(elt('span', 'ticket-code', o.code));
    var age = elt('span', 'ticket-age', ageText(o.placed_at));
    age.setAttribute('data-placed', o.placed_at);
    head.appendChild(age);
    card.appendChild(head);

    var who = elt('p', 'ticket-who');
    who.appendChild(elt('span', 'tag tag--' + o.fulfilment, FULFILMENT[o.fulfilment] || o.fulfilment));
    who.appendChild(elt('span', 'ticket-name', o.customer_name));
    if (o.area) { who.appendChild(elt('span', 'ticket-area', o.area)); }
    card.appendChild(who);

    var list = elt('ul', 'ticket-items');
    var items = o.items || [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var li = elt('li', 'ticket-item');
      li.appendChild(elt('span', 'qty', '×' + it.quantity));
      var right = elt('div', 'item-body');
      right.appendChild(elt('span', 'dish', it.name));
      var opts = it.options || [];
      if (opts.length) {
        var names = [];
        for (var j = 0; j < opts.length; j++) {
          // The snapshot on the line is an array of {name, delta_kobo}; take
          // the name and drop the money, which is not the kitchen's business.
          names.push(typeof opts[j] === 'string' ? opts[j] : opts[j].name);
        }
        right.appendChild(elt('span', 'opts', names.join(' · ')));
      }
      if (it.note) { right.appendChild(elt('span', 'item-note', it.note)); }
      li.appendChild(right);
      list.appendChild(li);
    }
    card.appendChild(list);

    if (o.notes) {
      var note = elt('p', 'ticket-note');
      note.appendChild(elt('strong', null, 'Note: '));
      note.appendChild(document.createTextNode(o.notes));
      card.appendChild(note);
    }

    var actions = elt('div', 'ticket-actions');
    var next = NEXT[o.status];
    if (next) {
      var go = elt('button', 'btn btn--go', o.status === 'ready'
        ? (HANDOVER[o.fulfilment] || 'Done')
        : NEXT_LABEL[o.status]);
      go.type = 'button';
      go.setAttribute('data-act', next);
      go.setAttribute('data-id', o.id);
      // The last step cannot be walked back — set_order_status refuses to
      // touch a completed order — so it asks twice.
      if (o.status === 'ready') { go.setAttribute('data-confirm', '1'); }
      actions.appendChild(go);
    }
    if (!o.acknowledged_at) {
      var heard = elt('button', 'btn btn--quiet', 'Heard it');
      heard.type = 'button';
      heard.setAttribute('data-act', 'ack');
      heard.setAttribute('data-id', o.id);
      actions.appendChild(heard);
    }
    var cancel = elt('button', 'btn btn--ghost btn--sm', 'Cancel');
    cancel.type = 'button';
    cancel.setAttribute('data-act', 'cancel');
    cancel.setAttribute('data-id', o.id);
    actions.appendChild(cancel);
    card.appendChild(actions);

    return card;
  }

  function keyOf(list) {
    var parts = [];
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      parts.push(o.id + ':' + o.status + ':' + (o.acknowledged_at ? 1 : 0));
    }
    return parts.join('|');
  }

  function render() {
    if (pendingConfirm) { pendingRender = true; return; }
    pendingRender = false;

    var buckets = { 'new': [], 'preparing': [], 'ready': [] };
    for (var i = 0; i < orders.length; i++) {
      if (buckets[orders[i].status]) { buckets[orders[i].status].push(orders[i]); }
    }
    for (var status in buckets) {
      if (!buckets.hasOwnProperty(status)) { continue; }
      var col = el.cols[status];
      var frag = document.createDocumentFragment();
      for (var j = 0; j < buckets[status].length; j++) {
        frag.appendChild(ticket(buckets[status][j]));
      }
      col.body.textContent = '';
      col.body.appendChild(frag);
      col.count.textContent = buckets[status].length;
      col.empty.hidden = buckets[status].length > 0;
    }
  }

  /* The ages tick every second without touching the rest of the DOM, so a
     ticket cannot slide out from under a finger that is mid-tap. */
  function tickAges() {
    var nodes = document.querySelectorAll('.ticket-age');
    for (var i = 0; i < nodes.length; i++) {
      var placed = nodes[i].getAttribute('data-placed');
      nodes[i].textContent = ageText(placed);
      var card = nodes[i].closest ? nodes[i].closest('.ticket') : null;
      if (card) {
        var m = minutesSince(placed);
        card.classList.toggle('is-late', m >= LATE_MIN);
        card.classList.toggle('is-warm', m >= WARN_MIN && m < LATE_MIN);
      }
    }
    showFreshness();
  }

  function showFreshness() {
    if (!lastGood) { el.freshness.textContent = '—'; return; }
    var secs = Math.floor((Date.now() - lastGood) / 1000);
    var stale = (Date.now() - lastGood) > STALE_MS;
    el.freshness.textContent = stale
      ? 'Last updated ' + (secs < 120 ? secs + 's' : Math.floor(secs / 60) + ' min') + ' ago'
      : 'Updated ' + secs + 's ago';
    el.freshness.classList.toggle('pill--bad', stale);
  }

  function setConn(state) {
    var text = {
      connecting:   'Connecting…',
      reconnecting: 'Reconnecting…',
      live:         'Live',
      down:         'Not live — checking every ' + Math.round(POLL_MS / 1000) + 's'
    }[state] || state;
    el.conn.setAttribute('data-state', state === 'reconnecting' ? 'connecting' : state);
    el.conn.querySelector('.pill-text').textContent = text;
  }

  /* ── Talking to the database ────────────────────────────────────────────*/

  function loadBoard(isNudge) {
    // A refresh asked for while one is in flight is queued rather than
    // dropped: the one after a button tap has to land, or the ticket appears
    // stuck until the next poll fifteen seconds later.
    if (fetching) { queued = queued || isNudge || true; return Promise.resolve(); }
    fetching = true;
    return client.rpc('kitchen_board', {}).then(function (rows) {
      var list = rows || [];
      var before = {};
      for (var i = 0; i < orders.length; i++) { before[orders[i].id] = true; }
      var arrived = false;
      for (var j = 0; j < list.length; j++) {
        if (!before[list[j].id] && !list[j].acknowledged_at) { arrived = true; }
      }

      orders = list;
      lastGood = Date.now();
      hide(el.boardError);

      var key = keyOf(list);
      if (key !== renderKey) { renderKey = key; render(); }
      showFreshness();
      checkAlarm(arrived || isNudge === 'first');
      fetching = false;
      drainQueued();
    }).catch(function (err) {
      fetching = false;
      if (err.status === 401) {
        // Drop anything queued: it would fire straight back into a request
        // that cannot succeed and bounce off the sign-in screen again.
        queued = false;
        toSignIn('Your session expired. Sign in again.');
        return;
      }
      drainQueued();
      // A failed refresh must not blank the board: the tickets on screen are
      // still the last thing the kitchen was told, and cooking from them is
      // better than cooking from nothing.
      fail(el.boardError, 'Could not reach the kitchen feed: ' + err.message +
        ' Showing the last orders received.');
      showFreshness();
    });
  }

  function drainQueued() {
    if (!queued) { return; }
    var reason = queued;
    queued = false;
    window.setTimeout(function () { loadBoard(reason === true ? undefined : reason); }, 0);
  }

  function loadSettings() {
    return client.select('settings', 'select=accepting_orders,pause_reason&limit=1')
      .then(function (rows) {
        var s = rows && rows[0];
        if (s && s.accepting_orders === false) {
          el.paused.hidden = false;
          el.pausedWhy.textContent = s.pause_reason ? '(' + s.pause_reason + ')' : '';
        } else {
          el.paused.hidden = true;
        }
      })
      .catch(function () { /* a banner is not worth an error message */ });
  }

  function act(id, action, reason) {
    var call = action === 'ack'
      ? client.rpc('acknowledge_order', { p_order_id: id })
      : client.rpc('set_order_status', {
          p_order_id: id, p_status: action, p_cancel_reason: reason || null
        });
    return call.then(function () {
      return loadBoard();
    });
  }

  /* ── Interaction ────────────────────────────────────────────────────────*/

  function clearConfirm() {
    if (!pendingConfirm) { return; }
    window.clearTimeout(pendingConfirm.timer);
    if (pendingConfirm.button && pendingConfirm.button.parentNode) {
      pendingConfirm.button.textContent = pendingConfirm.label;
      pendingConfirm.button.classList.remove('is-confirming');
    }
    pendingConfirm = null;
    if (pendingRender) { render(); }
  }

  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest ? ev.target.closest('button[data-act]') : null;
    if (!btn) { return; }
    var id = btn.getAttribute('data-id');
    var action = btn.getAttribute('data-act');

    if (action === 'cancel') {
      clearConfirm();
      openCancel(id);
      return;
    }

    if (btn.getAttribute('data-confirm') && !(pendingConfirm && pendingConfirm.button === btn)) {
      clearConfirm();
      pendingConfirm = {
        id: id, act: action, button: btn, label: btn.textContent,
        timer: window.setTimeout(clearConfirm, 5000)
      };
      btn.textContent = 'Tap again to confirm';
      btn.classList.add('is-confirming');
      return;
    }

    clearConfirm();
    btn.disabled = true;
    act(id, action).catch(function (err) {
      fail(el.boardError, err.message);
      // Put the button back. A refused change may not alter the board at all —
      // "that order is already completed" leaves everything as it was — and a
      // permanently greyed-out button would look like a broken screen.
      btn.disabled = false;
      loadBoard();
    });
  });

  var cancelOpener = null;

  function openCancel(id) {
    var order = null;
    for (var i = 0; i < orders.length; i++) { if (orders[i].id === id) { order = orders[i]; } }
    if (!order) { return; }
    cancelling = order;
    cancelOpener = document.activeElement;
    el.cancelWhich.textContent = order.code + ' — ' + order.customer_name;
    el.cancelWhy.value = '';
    hide(el.cancelErr);
    el.cancelOv.hidden = false;
    el.cancelWhy.focus();
  }

  function closeCancel() {
    el.cancelOv.hidden = true;
    cancelling = null;
    // Back to the button that opened it, so a keyboard user is not dropped at
    // the top of the document with the board rebuilt underneath them.
    if (cancelOpener && cancelOpener.parentNode) { cancelOpener.focus(); }
    cancelOpener = null;
  }

  /* Keep Tab inside the sheet while it is open. Without this the focus ring
     wanders onto the board behind the scrim, where the buttons it lands on
     change orders. */
  el.cancelOv.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Tab') { return; }
    var focusable = el.cancelOv.querySelectorAll('button, input');
    if (!focusable.length) { return; }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  });

  el.cancelBack.addEventListener('click', closeCancel);
  el.cancelGo.addEventListener('click', function () {
    var reason = el.cancelWhy.value.replace(/^\s+|\s+$/g, '');
    if (!reason) {
      fail(el.cancelErr, 'Give a reason — the database will not accept a cancellation without one.');
      el.cancelWhy.focus();
      return;
    }
    var id = cancelling.id, code = cancelling.code;
    el.cancelGo.disabled = true;
    act(id, 'cancelled', reason).then(function () {
      el.cancelGo.disabled = false;
      closeCancel();
      toast(code + ' cancelled.');
    }).catch(function (err) {
      el.cancelGo.disabled = false;
      fail(el.cancelErr, err.message);
    });
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      if (!el.cancelOv.hidden) { closeCancel(); }
      clearConfirm();
    }
  });

  el.soundOn.addEventListener('click', function () { unlockSound(true); });
  // No "did it work?" message: if it did not, the orange bar comes straight
  // back, which says it better than a toast would.
  el.soundTest.addEventListener('click', function () { unlockSound(true); });

  el.signout.addEventListener('click', function () {
    stop();
    client.signOut().then(function () { toSignIn(''); });
  });

  /* Any tap anywhere is a usable gesture, so spend it. A staff member who
     never reads the bell bar still ends up with sound on the first ticket they
     touch — and because the bar only hides once the audio context is genuinely
     running, it stays up if the tap was not enough. */
  document.addEventListener('click', function () {
    if (!audioReady()) { unlockSound(); }
  }, true);

  /* ── Screen and visibility ──────────────────────────────────────────────*/

  function keepAwake() {
    if (!navigator.wakeLock || !navigator.wakeLock.request) { return; }
    navigator.wakeLock.request('screen').then(function (lock) {
      wakeLock = lock;
      lock.addEventListener('release', function () { wakeLock = null; });
    }).catch(function () { /* denied or unsupported; the tablet's own setting covers it */ });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') { return; }
    // A tablet that slept has a board that is however many minutes stale and
    // a socket the OS may have torn down without telling us.
    if (el.board.hidden) { return; }
    keepAwake();
    loadBoard();
    if (rt && (!rt.ws || rt.ws.readyState > 1)) { rt.connect(); }
  });

  window.addEventListener('online', function () { if (!el.board.hidden) { loadBoard(); } });

  /* ── Small UI helpers ───────────────────────────────────────────────────*/

  function hide(node) { node.hidden = true; node.textContent = ''; }
  function fail(node, msg) { node.textContent = msg; node.hidden = false; }

  var toastTimer = null;
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.hidden = false;
    el.liveQuiet.textContent = msg;
    if (toastTimer) { window.clearTimeout(toastTimer); }
    toastTimer = window.setTimeout(function () { el.toast.hidden = true; }, 4000);
  }

  /* ── Session lifecycle ──────────────────────────────────────────────────*/

  function stop() {
    if (pollTimer) { window.clearInterval(pollTimer); pollTimer = null; }
    if (alertTimer) { window.clearInterval(alertTimer); alertTimer = null; }
    if (rt) { rt.close(); rt = null; }
    if (wakeLock) { try { wakeLock.release(); } catch (e) {} wakeLock = null; }
    orders = [];
    renderKey = '';
    clearAlarm();
  }

  function toSignIn(message) {
    stop();
    el.body.className = '';
    el.board.hidden = true;
    el.signin.hidden = false;
    if (message) { fail(el.signinErr, message); } else { hide(el.signinErr); }
    el.email.focus();
  }

  function start() {
    el.body.className = 'running';
    el.signin.hidden = true;
    el.board.hidden = false;
    el.whoami.textContent = me ? me.display_name : '';
    showSoundState();
    keepAwake();

    loadBoard('first');
    loadSettings();

    // The poll runs whether or not the socket is up. This is the guarantee:
    // the worst case for a new order being seen is one interval, not "until
    // someone notices the board has not moved in an hour".
    pollTimer = window.setInterval(function () {
      loadBoard();
      // The pause switch is an admin action, so it can flip while this screen
      // is open. Re-read it about once a minute rather than on every poll —
      // without it the kitchen spends the evening wondering why the website
      // has gone quiet.
      settingsAge += POLL_MS;
      if (settingsAge >= 60000) { settingsAge = 0; loadSettings(); }
    }, POLL_MS);

    rt = client.realtime('order_events', function () { loadBoard(true); }, setConn);
  }

  el.signinForm.addEventListener('submit', function (ev) {
    ev.preventDefault();
    hide(el.signinErr);
    el.signinBtn.disabled = true;
    el.signinBtn.textContent = 'Signing in…';
    // The sign-in tap is a user gesture, which is the browser's price for
    // audio. Spending it here means the board arrives with sound already on.
    unlockSound();

    client.signIn(el.email.value, el.password.value)
      .then(checkStaff)
      .then(function () {
        el.password.value = '';
        start();
      })
      .catch(function (err) {
        client.signOut();
        fail(el.signinErr, err.message === 'Invalid login credentials'
          ? 'That email and password did not match.'
          : err.message);
      })
      .then(function () {
        el.signinBtn.disabled = false;
        el.signinBtn.textContent = 'Sign in';
      });
  });

  /* Signing in is not the same as being staff. Without this check a customer
     account would reach a permanently empty board with no explanation —
     kitchen_board() returns nothing rather than refusing. */
  function checkStaff() {
    // me() rather than a select on `staff`: an admin's policy on that table
    // returns every row, so picking one off the top gives back somebody else.
    return client.rpc('me', {})
      .then(function (row) {
        if (!row || !row.is_active) {
          throw new Error('This account is not set up as kitchen staff. Ask an administrator to add it.');
        }
        me = row;
        return row;
      });
  }

  /* ── Boot ───────────────────────────────────────────────────────────────*/

  window.setInterval(tickAges, 1000);

  if (client.token()) {
    // A tablet that has been off for two hours comes back with a dead access
    // token and a perfectly good refresh token. Spend the refresh token before
    // giving up, or every quiet morning starts with someone hunting for the
    // password.
    var expiry = client.session.expires_at || 0;
    var ready = (expiry - Date.now() < 60000) ? client.refresh() : Promise.resolve();
    ready.then(checkStaff).then(start).catch(function (err) {
      client.signOut();
      toSignIn(err.status === 401 || err.status === 403 || !err.status ? '' : err.message);
    });
  } else {
    toSignIn('');
  }
}());
