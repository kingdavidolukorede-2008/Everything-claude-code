/* A stand-in for Supabase, backed by the real migrations on a real Postgres.
   Speaks the same three shapes the dashboard talks to: GoTrue's token
   endpoint, PostgREST's /rest/v1, and Realtime's Phoenix socket. Test-only. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const { Pool } = require('pg');

const PORT = Number(process.env.PORT || 8199);
const ROOT = path.resolve(__dirname, '..');            // the kitchen/ folder
const SITE = path.resolve(__dirname, '..', '..');       // nice-meal/, for ../favicon.svg
// Host, port and user come from the usual PG* environment variables.
const pool = new Pool({ database: process.env.DB || 'nm_dash' });

const sessions = new Map();   // refresh_token -> uid
let tokenTtl = Number(process.env.TOKEN_TTL || 3600);
let apiDown = false;          // flipped by /__test/api to simulate an outage

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function mintToken(uid) {
  const exp = Math.floor(Date.now() / 1000) + tokenTtl;
  return b64url({ alg: 'HS256', typ: 'JWT' }) + '.' + b64url({ sub: uid, exp, role: 'authenticated' }) + '.sig';
}
function uidFromAuth(req) {
  const h = req.headers.authorization || '';
  const tok = h.replace(/^Bearer\s+/i, '');
  const parts = tok.split('.');
  if (parts.length !== 3) return null;
  try {
    let p = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (p.length % 4) p += '=';
    const claims = JSON.parse(Buffer.from(p, 'base64').toString());
    if (claims.exp && claims.exp * 1000 < Date.now()) return { expired: true };
    return { uid: claims.sub };
  } catch (e) { return null; }
}

async function asRole(role, uid, fn) {
  const c = await pool.connect();
  try {
    await c.query('begin');
    await c.query(`set local role ${role}`);
    await c.query(`select set_config('request.jwt.claim.sub', $1, true)`, [uid || '']);
    const r = await fn(c);
    await c.query('commit');
    return r;
  } catch (e) {
    try { await c.query('rollback'); } catch (_) {}
    throw e;
  } finally { c.release(); }
}

function send(res, code, body, type) {
  const payload = type ? body : JSON.stringify(body);
  res.writeHead(code, {
    'Content-Type': type || 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*'
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    let d = '';
    req.on('data', (c) => { d += c; });
    req.on('end', () => { try { resolve(d ? JSON.parse(d) : {}); } catch (e) { resolve({}); } });
  });
}

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const p = u.pathname;

  if (req.method === 'OPTIONS') return send(res, 204, '', 'text/plain');

  // ── test control ──────────────────────────────────────────────────────
  if (p === '/__test/place') {
    const body = await readBody(req);
    try {
      let area = body.area || null;
      if (body.fulfilment === 'delivery' && !area) {
        area = (await pool.query('select id from public.delivery_areas where is_active limit 1')).rows[0].id;
      }
      const out = await asRole('anon', null, (c) =>
        c.query('select public.place_order($1,$2,$3::fulfilment_type,$4::jsonb,$5,$6,$7) as r',
          [body.name, body.phone, body.fulfilment || 'pickup', JSON.stringify(body.items),
           area, body.address || null, body.notes || null]));
      return send(res, 200, out.rows[0].r);
    } catch (e) { return send(res, 400, { message: e.message }); }
  }
  if (p === '/__test/api') { apiDown = u.searchParams.get('up') !== '1'; return send(res, 200, { apiDown }); }
  if (p === '/__test/drop') { for (const s of wss.clients) s.terminate(); return send(res, 200, { dropped: true }); }
  if (p === '/__test/ttl') { tokenTtl = Number(u.searchParams.get('s') || 3600); return send(res, 200, { tokenTtl }); }
  if (p === '/__test/menu') {
    const r = await asRole('anon', null, (c) => c.query(
      `select i.id, i.name, g.id gid, g.name gname, g.min_select,
              (select json_agg(json_build_object('id',o.id,'name',o.name)) from menu_options o where o.group_id=g.id) opts
         from menu_items i left join menu_option_groups g on g.menu_item_id=i.id order by i.name`));
    return send(res, 200, r.rows);
  }

  // ── auth ──────────────────────────────────────────────────────────────
  if (p === '/auth/v1/token') {
    const body = await readBody(req);
    const grant = u.searchParams.get('grant_type');
    if (grant === 'refresh_token') {
      const uid = sessions.get(body.refresh_token);
      if (!uid) return send(res, 400, { message: 'Invalid Refresh Token' });
      const rt = 'r' + Math.random().toString(36).slice(2);
      sessions.delete(body.refresh_token);
      sessions.set(rt, uid);
      return send(res, 200, { access_token: mintToken(uid), refresh_token: rt, token_type: 'bearer', expires_in: tokenTtl });
    }
    const r = await pool.query('select id from auth.users where email = $1', [body.email]);
    if (!r.rows.length || body.password !== 'correct-horse') {
      return send(res, 400, { message: 'Invalid login credentials' });
    }
    const uid = r.rows[0].id;
    const rt = 'r' + Math.random().toString(36).slice(2);
    sessions.set(rt, uid);
    return send(res, 200, { access_token: mintToken(uid), refresh_token: rt, token_type: 'bearer', expires_in: tokenTtl });
  }
  if (p === '/auth/v1/logout') return send(res, 204, '', 'text/plain');

  // ── PostgREST ─────────────────────────────────────────────────────────
  if (p.startsWith('/rest/v1/')) {
    if (apiDown) { res.writeHead(503); return res.end('down'); }
    const auth = uidFromAuth(req);
    if (auth && auth.expired) return send(res, 401, { message: 'JWT expired' });
    const uid = auth && auth.uid;
    const role = uid ? 'authenticated' : 'anon';

    if (p.startsWith('/rest/v1/rpc/')) {
      const fn = p.slice('/rest/v1/rpc/'.length);
      const args = await readBody(req);
      try {
        const out = await asRole(role, uid, async (c) => {
          if (fn === 'kitchen_board') return (await c.query('select * from public.kitchen_board()')).rows;
          if (fn === 'acknowledge_order') {
            return (await c.query('select public.acknowledge_order($1) as r', [args.p_order_id])).rows[0].r;
          }
          if (fn === 'set_order_status') {
            return (await c.query('select public.set_order_status($1,$2::order_status,$3) as r',
              [args.p_order_id, args.p_status, args.p_cancel_reason || null])).rows[0].r;
          }
          throw new Error('unknown function ' + fn);
        });
        return send(res, 200, out);
      } catch (e) { return send(res, 400, { message: e.message, code: e.code }); }
    }

    const table = p.slice('/rest/v1/'.length);
    if (!/^[a-z_]+$/.test(table)) return send(res, 404, { message: 'no' });
    const cols = (u.searchParams.get('select') || '*').replace(/[^a-z_,*]/g, '');
    const limit = Number(u.searchParams.get('limit') || 100);
    try {
      const out = await asRole(role, uid, (c) =>
        c.query(`select ${cols} from public.${table} limit ${Math.min(limit, 500)}`));
      return send(res, 200, out.rows);
    } catch (e) { return send(res, 400, { message: e.message }); }
  }

  // ── static ────────────────────────────────────────────────────────────
  if (p === '/config.js') {
    return send(res, 200,
      `window.NM_CONFIG={SUPABASE_URL:'http://127.0.0.1:${PORT}',SUPABASE_ANON_KEY:'test-anon',` +
      `POLL_SECONDS:${process.env.POLL || 3},ALERT_REPEAT_SECONDS:${process.env.REPEAT || 4},` +
      `STALE_SECONDS:${process.env.STALE || 8},` +
      `WARN_MINUTES:10,LATE_MINUTES:20};`, 'text/javascript');
  }
  // index.html points at ../favicon.svg, which is a sibling of kitchen/ in the
  // real deployment but outside this stub's root.
  const file = p === '/favicon.svg'
    ? path.join(SITE, 'favicon.svg')
    : path.join(ROOT, p === '/' ? 'index.html' : p);
  if (!file.startsWith(ROOT) && !file.startsWith(SITE)) {
    res.writeHead(403); return res.end();
  }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
});

// ── Realtime ────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: '/realtime/v1/websocket' });
const joined = new Set();

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let m; try { m = JSON.parse(raw.toString()); } catch (e) { return; }
    if (m.topic === 'phoenix' && m.event === 'heartbeat') {
      return ws.send(JSON.stringify({ topic: 'phoenix', event: 'phx_reply', ref: m.ref, payload: { status: 'ok', response: {} } }));
    }
    if (m.event === 'phx_join') {
      ws.nmTopic = m.topic;
      joined.add(ws);
      return ws.send(JSON.stringify({
        topic: m.topic, event: 'phx_reply', ref: m.ref,
        payload: { status: 'ok', response: { postgres_changes: [{ id: 1, event: 'INSERT', schema: 'public', table: 'order_events' }] } }
      }));
    }
  });
  ws.on('close', () => joined.delete(ws));
});

// Real Supabase pushes on WAL; here we watch the table and push the same shape.
let lastEventId = 0;
setInterval(async () => {
  if (!joined.size) return;
  try {
    const r = await pool.query('select id, order_id, code, event, status from public.order_events where id > $1 order by id', [lastEventId]);
    for (const row of r.rows) {
      lastEventId = Math.max(lastEventId, Number(row.id));
      for (const ws of joined) {
        if (ws.readyState !== 1) continue;
        ws.send(JSON.stringify({
          topic: ws.nmTopic, event: 'postgres_changes',
          payload: { ids: [1], data: { schema: 'public', table: 'order_events', type: 'INSERT', record: row } }
        }));
      }
    }
  } catch (e) { /* ignore */ }
}, 300);

pool.query('select coalesce(max(id),0) m from public.order_events')
  .then((r) => { lastEventId = Number(r.rows[0].m); })
  .catch(() => {})
  .then(() => server.listen(PORT, '127.0.0.1', () => console.log('stub on ' + PORT)));
