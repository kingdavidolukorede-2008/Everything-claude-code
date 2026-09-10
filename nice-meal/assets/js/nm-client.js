/* Nice Meal — a small Supabase client, hand-written.
 *
 * Everything the two dashboards need is four things: sign in, call a function,
 * read a row, and listen for a nudge. That is a few hundred readable lines
 * against a 120 KB dependency, and it keeps the page's own
 * `script-src 'self'` intact — no CDN in the header, nothing to re-fetch on a
 * kitchen tablet with a bad connection.
 *
 * The one deliberate design choice worth reading: the realtime socket is
 * treated as a NUDGE, never as data. A message on the topic means "something
 * changed, go look" — the board is always redrawn from kitchen_board(). So a
 * mis-parsed payload costs nothing, and the 15-second poll covers a socket
 * that never connects at all.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'nm.session';

  /* ── Small helpers ──────────────────────────────────────────────────────*/

  function jwtExpiry(token) {
    // The access token's `exp` decides when we refresh. Read it rather than
    // trusting expires_in against a tablet clock that may be badly wrong.
    try {
      var part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      while (part.length % 4) { part += '='; }
      var claims = JSON.parse(atob(part));
      return claims.exp ? claims.exp * 1000 : 0;
    } catch (e) {
      return 0;
    }
  }

  function readStored() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      // Private mode, or storage disabled. Sign-in still works, it just will
      // not survive a reload.
      return null;
    }
  }

  function writeStored(session) {
    try {
      if (session) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        global.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) { /* nothing we can do, and nothing that should stop the app */ }
  }

  /* fetch has no timeout of its own, and a request that never settles would
     leave the board waiting on it forever — the poll would keep firing and
     keep finding one already in flight. Twenty seconds, then treat it as a
     failure and let the next poll try again. */
  function fetchWithTimeout(url, opts) {
    var options = opts || {};
    if (!global.AbortController) { return global.fetch(url, options); }
    var ctrl = new global.AbortController();
    options.signal = ctrl.signal;
    var timer = global.setTimeout(function () { ctrl.abort(); }, 20000);
    return global.fetch(url, options).then(function (res) {
      global.clearTimeout(timer);
      return res;
    }, function (err) {
      global.clearTimeout(timer);
      throw err;
    });
  }

  /* ── Money ──────────────────────────────────────────────────────────────
     Kobo in, naira on screen. It lives here, in the file every screen loads,
     so a customer's confirmation and the owner's order list write the same
     amount the same way — divide once, at the last moment, and only for
     display. */
  function naira(k) {
    var n = Math.round(Number(k) || 0);
    var whole = Math.floor(Math.abs(n) / 100);
    var part = Math.abs(n) % 100;
    var s = '₦' + whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (part) { s += '.' + (part < 10 ? '0' : '') + part; }
    return (n < 0 ? '-' : '') + s;
  }

  function kobo(nairaValue) {
    var n = Number(nairaValue);
    if (!isFinite(n)) { return null; }
    return Math.round(n * 100);
  }

  /* An Error carrying whatever the server was willing to explain. Postgres
     RAISE messages come back in `message`; that is what place_order and
     set_order_status use to say "Order NM-0910-07 is already completed", and
     it is far better on screen than "400". */
  function apiError(status, body) {
    var text = 'Something went wrong (' + status + ').';
    if (body && typeof body === 'object') {
      text = body.message || body.error_description || body.error || body.msg || text;
    } else if (typeof body === 'string' && body) {
      text = body;
    }
    var err = new Error(text);
    err.status = status;
    return err;
  }

  /* ── The client ─────────────────────────────────────────────────────────*/

  function Client(url, anonKey) {
    this.url = String(url).replace(/\/+$/, '');
    this.anonKey = anonKey;
    this.session = readStored();
    this._refreshTimer = null;
    this._onSession = [];
    if (this.session) { this._scheduleRefresh(); }
  }

  Client.prototype.onSession = function (fn) { this._onSession.push(fn); };

  Client.prototype._emitSession = function () {
    for (var i = 0; i < this._onSession.length; i++) {
      try { this._onSession[i](this.session); } catch (e) { /* keep going */ }
    }
  };

  Client.prototype.token = function () {
    return this.session ? this.session.access_token : null;
  };

  Client.prototype._headers = function (extra) {
    var h = {
      apikey: this.anonKey,
      Authorization: 'Bearer ' + (this.token() || this.anonKey)
    };
    for (var k in extra) { if (extra.hasOwnProperty(k)) { h[k] = extra[k]; } }
    return h;
  };

  Client.prototype._setSession = function (session) {
    if (session && session.access_token) {
      session.expires_at = jwtExpiry(session.access_token);
      this.session = session;
    } else {
      this.session = null;
    }
    writeStored(this.session);
    this._scheduleRefresh();
    this._emitSession();
  };

  /* Refresh a minute before the token dies. This is not housekeeping: an
     expired token does not just fail the next request, it also gets the
     realtime subscription dropped by the server — the dashboard would appear
     to work and then quietly stop receiving orders about an hour into a
     shift. */
  Client.prototype._scheduleRefresh = function () {
    var self = this;
    if (this._refreshTimer) { global.clearTimeout(this._refreshTimer); this._refreshTimer = null; }
    if (!this.session || !this.session.expires_at) { return; }
    var wait = Math.max(5000, this.session.expires_at - Date.now() - 60000);
    this._refreshTimer = global.setTimeout(function () { self.refresh(); }, wait);
  };

  Client.prototype.signIn = function (email, password) {
    var self = this;
    return fetchWithTimeout(this.url + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { apikey: this.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (body) {
        if (!res.ok) { throw apiError(res.status, body); }
        self._setSession(body);
        return body;
      });
    });
  };

  Client.prototype.refresh = function () {
    var self = this;
    if (!this.session || !this.session.refresh_token) {
      return Promise.reject(new Error('No session to refresh.'));
    }
    // Stand the scheduled refresh down while this one is in flight. Supabase
    // rotates refresh tokens, so a second attempt with the token this one is
    // already spending comes back 400 and would sign the tablet out.
    if (this._refreshTimer) { global.clearTimeout(this._refreshTimer); this._refreshTimer = null; }
    return fetchWithTimeout(this.url + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { apikey: this.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: this.session.refresh_token })
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (body) {
        if (!res.ok) {
          // A refresh token the server has rejected will never work again;
          // clearing it sends the user to the sign-in screen instead of
          // looping on a request that cannot succeed.
          if (res.status === 400 || res.status === 401) { self._setSession(null); }
          throw apiError(res.status, body);
        }
        self._setSession(body);
        return body;
      });
    }).catch(function (err) {
      // A refresh that failed on the network keeps the session; try again
      // shortly rather than throwing the shift off the board.
      if (self.session) {
        self._refreshTimer = global.setTimeout(function () { self.refresh(); }, 20000);
      }
      throw err;
    });
  };

  Client.prototype.signOut = function () {
    var self = this;
    var token = this.token();
    this._setSession(null);
    if (!token) { return Promise.resolve(); }
    return fetchWithTimeout(this.url + '/auth/v1/logout', {
      method: 'POST',
      headers: { apikey: this.anonKey, Authorization: 'Bearer ' + token }
    }).catch(function () { /* the local session is already gone, which is what matters */ });
  };

  /* Call a Postgres function. Every write the dashboards perform goes through
     one of these — there is no table the browser may INSERT into. */
  Client.prototype.rpc = function (name, args) {
    return fetchWithTimeout(this.url + '/rest/v1/rpc/' + name, {
      method: 'POST',
      headers: this._headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(args || {})
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (body) {
        if (!res.ok) { throw apiError(res.status, body); }
        return body;
      });
    });
  };

  /* Read rows through PostgREST. Row level security decides what comes back;
     `staff?select=role` returns the caller's own row and nobody else's. */
  Client.prototype.select = function (table, query) {
    return fetchWithTimeout(this.url + '/rest/v1/' + table + (query ? '?' + query : ''), {
      headers: this._headers({ Accept: 'application/json' })
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (body) {
        if (!res.ok) { throw apiError(res.status, body); }
        return body;
      });
    });
  };

  /* ── Realtime ───────────────────────────────────────────────────────────
     Supabase Realtime speaks Phoenix's channel protocol over a WebSocket.
     We join one topic, ask for inserts on order_events, and heartbeat. Any
     message that arrives on our topic calls onNudge(); nothing here parses
     the row, because the board is redrawn from kitchen_board() regardless.

     onState is called with 'connecting' | 'live' | 'down' so the screen can
     say so. A dashboard that has silently stopped receiving is worse than one
     that never worked, because the staff still trust it. */

  function Realtime(client, table, onNudge, onState) {
    this.client = client;
    this.table = table;
    this.onNudge = onNudge;
    this.onState = onState || function () {};
    this.topic = 'realtime:nm-' + table;
    this.ws = null;
    this.ref = 0;
    this.attempt = 0;
    this.joined = false;
    this.closed = false;
    this._heartbeat = null;
    this._pendingBeat = null;
    this._retry = null;
    this._joinTimer = null;
  }

  Realtime.prototype._send = function (event, payload, topic) {
    if (!this.ws || this.ws.readyState !== 1) { return; }
    this.ref += 1;
    this.ws.send(JSON.stringify({
      topic: topic || this.topic,
      event: event,
      payload: payload || {},
      ref: String(this.ref)
    }));
  };

  Realtime.prototype.connect = function () {
    var self = this;
    if (this.closed) { return; }
    if (this._retry) { global.clearTimeout(this._retry); this._retry = null; }

    var token = this.client.token();
    if (!token) { this.onState('down'); return; }

    this.onState(this.attempt === 0 ? 'connecting' : 'reconnecting');

    var base = this.client.url.replace(/^http/, 'ws');
    var url = base + '/realtime/v1/websocket?apikey=' +
      encodeURIComponent(this.client.anonKey) + '&vsn=1.0.0';

    var ws;
    try {
      ws = new global.WebSocket(url);
    } catch (e) {
      this._reconnect();
      return;
    }
    this.ws = ws;
    this.joined = false;

    ws.onopen = function () {
      self.attempt = 0;
      self._send('phx_join', {
        config: {
          broadcast: { self: false },
          presence: { key: '' },
          // The filter is a courtesy to the server; row level security is what
          // actually decides that this socket may see order_events at all.
          postgres_changes: [{ event: 'INSERT', schema: 'public', table: self.table }],
          private: false
        },
        access_token: self.client.token()
      });
      self._startHeartbeat();
    };

    /* A socket can open and then simply never answer — a captive portal or a
       proxy that accepts the TCP connection and eats the upgrade. Without this
       the header would sit on "Connecting…" for the rest of the shift, which
       is the one thing it must never do: say nothing while nothing works. */
    this._joinTimer = global.setTimeout(function () {
      if (!self.joined) {
        self.onState('down');
        try { ws.close(); } catch (e) { self._reconnect(); }
      }
    }, 10000);

    ws.onmessage = function (evt) {
      var msg;
      try { msg = JSON.parse(evt.data); } catch (e) { return; }
      if (!msg) { return; }

      if (msg.event === 'phx_reply' && msg.topic === self.topic) {
        var ok = msg.payload && msg.payload.status === 'ok';
        if (ok && !self.joined) { self._markJoined(); }
        if (!ok && !self.joined) {
          // Joining was refused — an expired token, or this account is not
          // staff. Fall back to the poll rather than hammering the socket.
          self.onState('down');
          ws.close();
        }
        return;
      }
      if (msg.topic === 'phoenix') { self._pendingBeat = null; return; }
      if (msg.event === 'phx_error' || msg.event === 'phx_close') {
        self.joined = false;
        self.onState('down');
        return;
      }
      if (msg.topic !== self.topic) { return; }
      if (msg.event === 'system') {
        if (msg.payload && msg.payload.status === 'error') { self.onState('down'); }
        return;
      }
      // Anything else on our topic — a postgres_changes payload in whatever
      // shape this server version sends — means go and look.
      self._markJoined();
      self.onNudge();
    };

    ws.onerror = function () { /* onclose always follows; handled there */ };

    ws.onclose = function () {
      self._stopHeartbeat();
      if (self._joinTimer) { global.clearTimeout(self._joinTimer); self._joinTimer = null; }
      self.joined = false;
      if (!self.closed) { self.onState('down'); self._reconnect(); }
    };
  };

  Realtime.prototype._markJoined = function () {
    if (this._joinTimer) { global.clearTimeout(this._joinTimer); this._joinTimer = null; }
    this.joined = true;
    this.onState('live');
  };

  Realtime.prototype._startHeartbeat = function () {
    var self = this;
    this._stopHeartbeat();
    this._heartbeat = global.setInterval(function () {
      // A TCP connection can stay open long after it has stopped carrying
      // anything — a phone hotspot handing over, a captive portal. An
      // unanswered heartbeat is the only way to notice from in here.
      if (self._pendingBeat) {
        self._pendingBeat = null;
        if (self.ws) { self.ws.close(); }
        return;
      }
      self._pendingBeat = Date.now();
      self._send('heartbeat', {}, 'phoenix');
    }, 25000);
  };

  Realtime.prototype._stopHeartbeat = function () {
    if (this._heartbeat) { global.clearInterval(this._heartbeat); this._heartbeat = null; }
    this._pendingBeat = null;
  };

  Realtime.prototype._reconnect = function () {
    var self = this;
    if (this.closed) { return; }
    this.attempt += 1;
    // Back off, but never past ten seconds: this is a kitchen, and a long
    // backoff after a wifi blip would leave the board stale through a rush.
    var wait = Math.min(10000, 500 * Math.pow(2, Math.min(this.attempt, 5)));
    wait += Math.random() * 500;
    this._retry = global.setTimeout(function () { self.connect(); }, wait);
  };

  /* Called after a token refresh. Without this the server drops the
     subscription when the old token expires. */
  Realtime.prototype.setToken = function () {
    if (this.ws && this.ws.readyState === 1) {
      this._send('access_token', { access_token: this.client.token() });
    }
  };

  Realtime.prototype.close = function () {
    this.closed = true;
    this._stopHeartbeat();
    if (this._retry) { global.clearTimeout(this._retry); this._retry = null; }
    if (this._joinTimer) { global.clearTimeout(this._joinTimer); this._joinTimer = null; }
    if (this.ws) { try { this.ws.close(); } catch (e) {} }
    this.ws = null;
  };

  Client.prototype.realtime = function (table, onNudge, onState) {
    var rt = new Realtime(this, table, onNudge, onState);
    this.onSession(function () { rt.setToken(); });
    rt.connect();
    return rt;
  };

  global.NM = global.NM || {};
  global.NM.Client = Client;
  global.NM.naira = naira;
  global.NM.kobo = kobo;
}(window));
