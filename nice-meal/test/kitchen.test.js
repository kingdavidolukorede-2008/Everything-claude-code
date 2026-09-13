/* Drives the kitchen dashboard against the stub + the real migrations. */
const { chromium } = require('playwright');
const { Pool } = require('pg');
const BASE = 'http://127.0.0.1:8199';
const APP  = BASE + '/kitchen/';   // where it actually deploys
// Host, port and user come from the usual PG* environment variables.
const pool = new Pool({ database: process.env.DB || 'nm_dash' });

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra ? '  << ' + extra : '')); }
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// place_order throttles at three orders per phone per two minutes, so each
// test order comes from a different number.
let phoneSeq = 0;
async function place(over) {
  const menu = await (await fetch(BASE + '/__test/menu')).json();
  const jollof = menu.find(m => m.name.indexOf('Jollof') === 0);
  phoneSeq++;
  const body = Object.assign({
    name: 'Chidinma Okafor',
    phone: '0803' + String(1000000 + phoneSeq),
    fulfilment: 'pickup',
    items: [{ item_id: jollof.id, quantity: 2, option_ids: [jollof.opts[0].id] }]
  }, over || {});
  const r = await fetch(BASE + '/__test/place', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  return r.json();
}

async function signIn(page, email) {
  await page.fill('#email', email);
  await page.fill('#password', 'correct-horse');
  await page.click('#signin-submit');
}

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM || undefined,
    // Start with audio blocked, which is the real state of a tablet after a
    // reload. The unlock path is the thing under test.
    args: ['--autoplay-policy=document-user-activation-required']
  });

  // Watch the real AudioContext rather than trusting the UI about it: an
  // oscillator only gets created when a sound is genuinely produced.
  const spyAudio = () => {
    const Real = window.AudioContext;
    window.__nmCtxs = [];
    window.__nmBeeps = 0;
    window.AudioContext = function () {
      const c = new Real();
      window.__nmCtxs.push(c);
      const make = c.createOscillator.bind(c);
      c.createOscillator = function () { window.__nmBeeps++; return make(); };
      return c;
    };
    window.__nmAudioState = () => window.__nmCtxs.length ? window.__nmCtxs[0].state : null;
  };

  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addInitScript(spyAudio);
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  const badResponses = [];
  page.on('response', r => { if (r.status() >= 400) badResponses.push(r.status() + ' ' + r.url()); });

  console.log('\n== sign in ==');
  await page.goto(APP, { waitUntil: 'load' });
  await page.waitForSelector('#view-signin:not([hidden])');
  ok('sign-in shows when there is no session', await page.isVisible('#signin-form'));

  await page.fill('#email', 'kitchen@nicemeal.test');
  await page.fill('#password', 'wrong');
  await page.click('#signin-submit');
  await page.waitForSelector('#signin-error:not([hidden])');
  ok('a wrong password is explained', /did not match/.test(await page.textContent('#signin-error')));

  await signIn(page, 'nobody@nicemeal.test');
  await page.waitForTimeout(600);
  ok('an account that is not staff is told so, not left on an empty board',
    /not set up as kitchen staff/.test(await page.textContent('#signin-error')),
    await page.textContent('#signin-error'));

  await signIn(page, 'kitchen@nicemeal.test');
  await page.waitForSelector('#view-board:not([hidden])', { timeout: 5000 });
  ok('kitchen staff reach the board', await page.isVisible('#board'));
  ok('the board starts empty', (await page.textContent('#count-new')) === '0');

  console.log('\n== sound unlock ==');
  // Signing in is a user gesture, and the browser will only start audio on
  // one. Spending it there is why the board arrives audible.
  ok('signing in leaves the audio context running',
    (await page.evaluate(() => window.__nmAudioState())) === 'running',
    String(await page.evaluate(() => window.__nmAudioState())));
  ok('so the unlock bar is not in the way', !(await page.isVisible('#soundbar')));

  // The scenario the whole design exists for: the tablet reloads overnight.
  // The session is restored from storage, but the audio permission is not.
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#view-board:not([hidden])', { timeout: 5000 });
  ok('a reload keeps the staff signed in', await page.isVisible('#board'));
  ok('but the sound bar comes back, because the audio permission did not',
    await page.isVisible('#soundbar'));
  ok('"Test sound" is hidden while audio is blocked', !(await page.isVisible('#sound-test')));
  ok('nothing has claimed sound is on', (await page.evaluate(() => window.__nmAudioState())) === null);

  await page.click('#sound-on');
  await page.waitForTimeout(500);
  ok('the audio context is genuinely running, not just claimed',
    (await page.evaluate(() => window.__nmAudioState())) === 'running');
  ok('unlocking hides the bar', !(await page.isVisible('#soundbar')));
  ok('unlocking reveals the test button', await page.isVisible('#sound-test'));
  ok('unlocking plays a sound back, so it is proved rather than promised',
    (await page.evaluate(() => window.__nmBeeps)) > 0);

  console.log('\n== an order arrives ==');
  const o1 = await place();
  await page.waitForSelector('.ticket', { timeout: 4000 });
  ok('the ticket appears without a reload', (await page.textContent('#count-new')) === '1');
  ok('it is in the New column', (await page.locator('#col-new .ticket').count()) === 1);
  ok('the code is shown', (await page.textContent('.ticket-code')) === o1.code, o1.code);
  ok('the screen alarms', await page.evaluate(() => document.body.classList.contains('alarm')));
  ok('the tab title carries the count', /NEW ORDER/.test(await page.title()), await page.title());
  ok('the ticket is marked unheard', await page.locator('.ticket.is-unheard').count() === 1);
  const items = await page.textContent('.ticket-items');
  ok('quantity, dish and the chosen option are all on the ticket',
    /×2/.test(items) && /Jollof/.test(items) && /Chicken/.test(items), items.replace(/\s+/g, ' '));
  ok('no money reaches the kitchen screen',
    !/₦|\d{3,}/.test(await page.textContent('.ticket-items')), items.replace(/\s+/g, ' '));

  console.log('\n== the alert repeats until someone touches it ==');
  const beeps = await page.evaluate(() => window.__nmBeeps);
  await page.waitForTimeout(5000);   // REPEAT is 4s in the stub config
  ok('an untouched order re-alarms', (await page.evaluate(() => window.__nmBeeps)) > beeps,
    'was ' + beeps + ' now ' + (await page.evaluate(() => window.__nmBeeps)));

  await page.click('.ticket button[data-act="ack"]');
  await page.waitForTimeout(800);
  ok('"Heard it" stops the alarm', !(await page.evaluate(() => document.body.classList.contains('alarm'))));
  ok('and resets the tab title', !/NEW ORDER/.test(await page.title()));
  const afterAck = await page.evaluate(() => window.__nmBeeps);
  await page.waitForTimeout(5000);
  ok('and it stays stopped', (await page.evaluate(() => window.__nmBeeps)) === afterAck);

  console.log('\n== moving an order along ==');
  await page.click('#col-new .ticket button[data-act="preparing"]');
  await page.waitForTimeout(800);
  ok('Start cooking moves it to Cooking', (await page.locator('#col-preparing .ticket').count()) === 1);
  await page.click('#col-preparing .ticket button[data-act="ready"]');
  await page.waitForTimeout(800);
  ok('Ready moves it to Ready', (await page.locator('#col-ready .ticket').count()) === 1);
  ok('the last button names the handover for a pickup',
    /Picked up/.test(await page.textContent('#col-ready .ticket button[data-act="completed"]')));

  console.log('\n== the last step asks twice ==');
  await page.click('#col-ready .ticket button[data-act="completed"]');
  await page.waitForTimeout(300);
  ok('one tap only arms it', (await page.locator('#col-ready .ticket').count()) === 1);
  ok('and says so', /Tap again/.test(await page.textContent('#col-ready .ticket button[data-act="completed"]')));
  const st1 = (await pool.query('select status from orders where code=$1', [o1.code])).rows[0].status;
  ok('nothing was written on the first tap', st1 === 'ready', st1);
  await page.click('#col-ready .ticket button[data-act="completed"]');
  await page.waitForTimeout(900);
  ok('the second tap completes it', (await page.locator('.ticket').count()) === 0);
  const st2 = (await pool.query('select status from orders where code=$1', [o1.code])).rows[0].status;
  ok('and the database agrees', st2 === 'completed', st2);

  console.log('\n== the arm expires rather than lingering ==');
  const o2 = await place({ fulfilment: 'delivery', address: '12 Aina Obembe Street', name: 'Tunde A' });
  await page.waitForSelector('.ticket', { timeout: 4000 });
  ok('a delivery is tagged as one', /DELIVERY/i.test(await page.textContent('.tag')));
  await page.click('.ticket button[data-act="preparing"]'); await page.waitForTimeout(700);
  await page.click('.ticket button[data-act="ready"]');     await page.waitForTimeout(700);
  await page.click('.ticket button[data-act="completed"]'); await page.waitForTimeout(5600);
  ok('an unconfirmed tap disarms itself',
    !/Tap again/.test(await page.textContent('.ticket button[data-act="completed"]')));
  ok('and the order is still there', (await page.locator('.ticket').count()) === 1);
  ok('the rider handover is named for a delivery',
    /Sent with rider/.test(await page.textContent('.ticket button[data-act="completed"]')));

  console.log('\n== cancelling ==');
  await page.click('.ticket button[data-act="cancel"]');
  await page.waitForSelector('#cancel-overlay:not([hidden])');
  await page.click('#cancel-confirm');
  await page.waitForTimeout(400);
  ok('a cancellation with no reason is refused before it is sent',
    await page.isVisible('#cancel-error') && (await page.locator('.ticket').count()) === 1);
  // Tab must not wander onto the board behind the scrim, where every button
  // changes an order.
  const ring = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    ring.push(await page.evaluate(() => {
      const a = document.activeElement;
      return (a.id || a.tagName) + (a.closest('#cancel-overlay') ? '' : ' <<OUTSIDE>>');
    }));
  }
  ok('focus stays inside the sheet', !ring.some(r => /OUTSIDE/.test(r)), ring.join(', '));

  await page.keyboard.press('Escape');
  ok('Escape closes the sheet', !(await page.isVisible('#cancel-overlay')));
  ok('and focus goes back to the button that opened it',
    await page.evaluate(() => document.activeElement.getAttribute('data-act') === 'cancel'),
    await page.evaluate(() => document.activeElement.outerHTML.slice(0, 80)));

  await page.click('.ticket button[data-act="cancel"]');
  await page.waitForSelector('#cancel-overlay:not([hidden])');
  await page.fill('#cancel-reason', 'Ran out of chicken');
  await page.click('#cancel-confirm');
  await page.waitForTimeout(900);
  ok('a cancellation with a reason goes through', (await page.locator('.ticket').count()) === 0);
  const c = (await pool.query('select status, cancel_reason from orders where code=$1', [o2.code])).rows[0];
  ok('the reason is stored', c.status === 'cancelled' && c.cancel_reason === 'Ran out of chicken',
    JSON.stringify(c));

  console.log('\n== a customer name is text, never markup ==');
  const o3 = await place({ name: '<img src=x onerror="window.__pwned=1">Ada' });
  await page.waitForSelector('.ticket', { timeout: 4000 });
  ok('the injected name is rendered as characters',
    (await page.textContent('.ticket-name')).indexOf('<img') === 0);
  ok('nothing executed', !(await page.evaluate(() => window.__pwned)));
  ok('no element was created from it', (await page.locator('.ticket-name img').count()) === 0);

  console.log('\n== an ageing ticket colours itself ==');
  // placed_at never moves in real life, so the board does not watch it for
  // changes; backdate the row and reload to get a genuinely old ticket.
  await pool.query("update orders set placed_at = now() - interval '12 minutes' where code = $1", [o3.code]);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('.ticket', { timeout: 5000 });
  ok('a ticket past the warning age is marked', (await page.locator('.ticket.is-warm').count()) === 1);
  ok('and shows the age in words', /12 min/.test(await page.textContent('.ticket-age')),
    await page.textContent('.ticket-age'));
  await pool.query("update orders set placed_at = now() - interval '25 minutes' where code = $1", [o3.code]);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('.ticket', { timeout: 5000 });
  ok('a ticket past the late age escalates', (await page.locator('.ticket.is-late').count()) === 1);
  ok('and stops being merely warm', (await page.locator('.ticket.is-warm').count()) === 0);

  console.log('\n== layout ==');
  const fills = await page.evaluate(() => {
    const b = document.getElementById('board').getBoundingClientRect();
    return { bottom: Math.round(b.bottom), vh: window.innerHeight };
  });
  ok('the columns reach the bottom of the screen',
    Math.abs(fills.bottom - fills.vh) <= 2, JSON.stringify(fills));
  ok('an empty column says so near its heading, not at the foot of the screen',
    await page.evaluate(() => {
      const h = document.getElementById('h-preparing').getBoundingClientRect();
      const e = document.getElementById('empty-preparing').getBoundingClientRect();
      return e.top - h.bottom < 60;
    }));
  ok('each column scrolls on its own rather than the page',
    await page.evaluate(() => getComputedStyle(document.getElementById('col-new')
      .parentNode.querySelector('.col-body')).overflowY === 'auto'));

  console.log('\n== screenshots ==');
  await page.screenshot({ path: (process.env.SHOTS || '.') + '/shot-board-1400.png', fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: (process.env.SHOTS || '.') + '/shot-board-390.png', fullPage: true });
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok('no sideways scrolling at 390px', overflow <= 0, 'overflow ' + overflow + 'px');
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.waitForTimeout(300);

  console.log('\n== the socket drops ==');
  await fetch(BASE + '/__test/drop');
  await page.waitForTimeout(600);
  const downText = await page.textContent('#conn .pill-text');
  ok('the header stops claiming to be live', !/^Live$/.test(downText), downText);
  await page.waitForSelector('#conn[data-state="live"]', { timeout: 12000 });
  ok('and it reconnects on its own', (await page.getAttribute('#conn', 'data-state')) === 'live');

  console.log('\n== the API goes away ==');
  await fetch(BASE + '/__test/api?up=0');
  await page.waitForTimeout(11000);   // past STALE_SECONDS, which the stub sets to 8
  ok('the tickets already on screen stay put', (await page.locator('.ticket').count()) === 1);
  ok('the failure is stated', await page.isVisible('#board-error'));
  ok('and the freshness pill turns bad',
    await page.evaluate(() => document.getElementById('freshness').classList.contains('pill--bad')));
  await fetch(BASE + '/__test/api?up=1');
  await page.waitForTimeout(5000);
  ok('it recovers by itself', !(await page.isVisible('#board-error')));

  // tidy up before the no-socket run
  await page.click('.ticket button[data-act="cancel"]');
  await page.waitForSelector('#cancel-overlay:not([hidden])');
  await page.fill('#cancel-reason', 'test tidy');
  await page.click('#cancel-confirm');
  await page.waitForTimeout(800);
  ok('board clear before the fallback test', (await page.locator('.ticket').count()) === 0);

  console.log('\n== with no socket at all, the poll still delivers ==');
  const ctx2 = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx2.addInitScript(() => {
    // The nastiest shape of broken: a socket that opens and then says
    // nothing, ever. A captive portal, or a proxy that eats the upgrade.
    // Nothing fires, so only a timeout can notice.
    window.WebSocket = function () { this.readyState = 0; this.close = function () {}; this.send = function () {}; };
  });
  const p2 = await ctx2.newPage();
  await p2.goto(APP, { waitUntil: 'load' });
  await signIn(p2, 'kitchen@nicemeal.test');
  await p2.waitForSelector('#view-board:not([hidden])', { timeout: 5000 });
  const o4 = await place({ name: 'Poll Test' });
  await p2.waitForSelector('.ticket', { timeout: 10000 });
  ok('the order still arrives, on the poll alone',
    (await p2.textContent('.ticket-code')) === o4.code);
  // ...and the header must stop saying "Connecting…" rather than implying
  // all is well for the rest of the shift.
  await p2.waitForSelector('#conn[data-state="down"]', { timeout: 15000 });
  ok('and a socket that hangs is eventually admitted to be down',
    /Not live/.test(await p2.textContent('#conn .pill-text')),
    await p2.textContent('#conn .pill-text'));
  await ctx2.close();

  console.log('\n== the session refreshes before it expires ==');
  await fetch(BASE + '/__test/ttl?s=65');
  const ctx3 = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const p3 = await ctx3.newPage();
  const refreshes = [];
  p3.on('request', r => { if (/grant_type=refresh_token/.test(r.url())) refreshes.push(r.url()); });
  await p3.goto(APP, { waitUntil: 'load' });
  await signIn(p3, 'kitchen@nicemeal.test');
  await p3.waitForSelector('#view-board:not([hidden])', { timeout: 5000 });
  const tok1 = await p3.evaluate(() => JSON.parse(localStorage.getItem('nm.session')).access_token);
  await p3.waitForTimeout(9000);
  const tok2 = await p3.evaluate(() => JSON.parse(localStorage.getItem('nm.session')).access_token);
  ok('the token was rotated before expiry', refreshes.length > 0 && tok1 !== tok2,
    refreshes.length + ' refresh calls');
  await p3.waitForTimeout(1500);
  ok('the board is still working after the rotation',
    !(await p3.isVisible('#board-error')) && (await p3.getAttribute('#conn', 'data-state')) === 'live');
  await fetch(BASE + '/__test/ttl?s=3600');
  await ctx3.close();

  console.log('\n== a tablet that was switched off overnight ==');
  // Its access token is long dead but the refresh token is fine. It must come
  // back on its own, not stop at a password prompt nobody knows.
  await fetch(BASE + '/__test/ttl?s=1');
  const ctx4 = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx4.addInitScript(spyAudio);
  const p4 = await ctx4.newPage();
  await p4.goto(APP, { waitUntil: 'load' });
  await signIn(p4, 'kitchen@nicemeal.test');
  await p4.waitForSelector('#view-board:not([hidden])', { timeout: 5000 });
  await p4.waitForTimeout(3000);
  await fetch(BASE + '/__test/ttl?s=3600');
  await p4.reload({ waitUntil: 'load' });
  await p4.waitForTimeout(2500);
  ok('an expired token is renewed rather than thrown away',
    await p4.isVisible('#board') && !(await p4.isVisible('#signin-form')),
    await p4.textContent('#signin-error').catch(() => ''));
  ok('and the board is working', (await p4.getAttribute('#conn', 'data-state')) === 'live');

  // The bell bar is easy to walk past; the first tap on anything should do it.
  ok('sound starts blocked after that reload', await p4.isVisible('#soundbar'));
  await p4.click('#h-preparing');
  await p4.waitForTimeout(600);
  ok('any tap on the screen turns the sound on',
    (await p4.evaluate(() => window.__nmAudioState())) === 'running');
  ok('and the bar gets out of the way', !(await p4.isVisible('#soundbar')));
  ok('the signed-in name is shown on the shared tablet',
    (await p4.textContent('#whoami')) === 'Kitchen tablet',
    await p4.textContent('#whoami'));
  await ctx4.close();

  console.log('\n== signing out ==');
  await page.click('#signout');
  await page.waitForSelector('#view-signin:not([hidden])', { timeout: 4000 });
  ok('sign out returns to the sign-in screen', await page.isVisible('#signin-form'));
  ok('and clears the stored session', await page.evaluate(() => !localStorage.getItem('nm.session')));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(600);
  ok('a reload does not walk back in', await page.isVisible('#signin-form'));

  console.log('\n== console ==');
  // Two failures are deliberate: the wrong-password attempt, and the API
  // outage. Everything else on this list would be a real defect.
  const unexpected = badResponses.filter(r =>
    !/^400 .*\/auth\/v1\/token\?grant_type=password$/.test(r) &&
    !/^503 .*\/rest\/v1\/rpc\/kitchen_board$/.test(r));
  ok('no unexpected failed requests', unexpected.length === 0, unexpected.join(' | '));
  ok('exactly one sign-in was rejected, and it was the deliberate one',
    badResponses.filter(r => /^400 /.test(r)).length === 1);

  const real = errors.filter(e => !/status of (400|503)/.test(e)
                              && !/WebSocket connection to .* failed/.test(e)
                              && !/net::ERR_/.test(e));
  ok('no unexpected console errors', real.length === 0, real.join(' | '));
  ok('nothing was blocked by the page\'s own CSP',
    !errors.some(e => /Content Security Policy/i.test(e)),
    errors.filter(e => /Content Security Policy/i.test(e)).join(' | '));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  await browser.close();
  await pool.end();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
