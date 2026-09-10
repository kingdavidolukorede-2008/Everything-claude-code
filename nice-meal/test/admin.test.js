/* Drives the admin dashboard against the stub + the real migrations. */
const { chromium } = require('playwright');
const { Pool } = require('pg');
const BASE = 'http://127.0.0.1:8199';
const APP  = BASE + '/admin/';
// Host, port and user come from the usual PG* environment variables.
const pool = new Pool({ database: process.env.DB || 'nm_dash' });

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra ? '  << ' + extra : '')); }
}

let phoneSeq = 500;
async function place(over) {
  const menu = await (await fetch(BASE + '/__test/menu')).json();
  const jollof = menu.find(m => m.name.indexOf('Jollof') === 0);
  phoneSeq++;
  const body = Object.assign({
    name: 'Web Customer', phone: '0805' + String(1000000 + phoneSeq), fulfilment: 'pickup',
    items: [{ item_id: jollof.id, quantity: 1, option_ids: [jollof.opts[0].id] }]
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
const q = async (sql, args) => (await pool.query(sql, args)).rows;

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const errors = [];
  const badResponses = [];
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 } });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) badResponses.push(r.status() + ' ' + r.url()); });

  console.log('\n== who gets in ==');
  await page.goto(APP, { waitUntil: 'load' });
  await page.waitForSelector('#view-signin:not([hidden])');
  ok('sign-in shows when there is no session', await page.isVisible('#signin-form'));

  await page.fill('#email', 'admin@nicemeal.test');
  await page.fill('#password', 'wrong');
  await page.click('#signin-submit');
  await page.waitForSelector('#signin-error:not([hidden])');
  ok('a wrong password is explained', /did not match/.test(await page.textContent('#signin-error')));

  // The important one: kitchen staff authenticate perfectly well. Without this
  // check they would reach a dashboard where every panel refused separately.
  await signIn(page, 'kitchen@nicemeal.test');
  await page.waitForTimeout(700);
  ok('a kitchen account is turned away from the admin screen',
    /not an administrator/.test(await page.textContent('#signin-error')),
    await page.textContent('#signin-error'));
  ok('and is told where to go instead',
    /\/kitchen\//.test(await page.textContent('#signin-error')));

  await signIn(page, 'admin@nicemeal.test');
  await page.waitForSelector('#view-app:not([hidden])', { timeout: 6000 });
  ok('an administrator reaches the dashboard', await page.isVisible('#main'));
  ok('the signed-in name is shown', (await page.textContent('#whoami')) === 'Owner');
  ok('it opens on the orders tab',
    (await page.getAttribute('.tab[data-view="orders"]', 'aria-current')) === 'page');

  console.log('\n== orders ==');
  const o1 = await place({ name: 'Chidinma Okafor', fulfilment: 'delivery',
    address: '14 Aina Obembe Street, Baruwa', notes: 'Black gate' });
  await page.click('#f-today');
  await page.waitForTimeout(900);
  ok('a new order shows up in the list',
    (await page.locator('#orders-body tr').count()) > 0);

  const rowText = await page.textContent('#orders-body');
  ok('the list shows the money the kitchen screen never sees', /₦/.test(rowText));
  ok('and the phone number', /0805/.test(rowText));

  await page.click(`#orders-body tr:has-text("${o1.code}")`);
  await page.waitForTimeout(400);
  const detail = await page.textContent('#order-detail');
  ok('the detail panel shows the delivery address', /Aina Obembe/.test(detail));
  ok('and the order note', /Black gate/.test(detail));
  ok('and the line total', /₦/.test(detail));
  ok('and how the order arrived', /Website/.test(detail), detail.replace(/\s+/g, ' ').slice(0, 200));
  // The dish and the choices made on it must be two lines, or a ticket reads
  // "Jollof Rice & ProteinChicken".
  ok('the dish and its choices are on separate lines',
    await page.evaluate(() => {
      const dish = document.querySelector('#order-detail .lines .dish');
      const opts = document.querySelector('#order-detail .lines .opts');
      if (!dish || !opts) { return false; }
      return opts.getBoundingClientRect().top >= dish.getBoundingClientRect().bottom - 1;
    }));

  console.log('\n== moving an order along from the desk ==');
  await page.click('#order-detail button[data-advance="preparing"]');
  await page.waitForTimeout(900);
  ok('start cooking is recorded',
    (await q('select status from orders where code=$1', [o1.code]))[0].status === 'preparing');
  await page.click('#order-detail button[data-advance="ready"]');
  await page.waitForTimeout(900);
  await page.click('#order-detail button[data-advance="completed"]');
  await page.waitForTimeout(300);
  ok('handing over asks twice',
    (await q('select status from orders where code=$1', [o1.code]))[0].status === 'ready');
  await page.click('#order-detail button[data-advance="completed"]');
  await page.waitForTimeout(900);
  ok('the second tap completes it',
    (await q('select status from orders where code=$1', [o1.code]))[0].status === 'completed');
  ok('a completed order offers nothing more to do',
    (await page.locator('#order-detail button[data-advance]').count()) === 0);

  console.log('\n== cancelling ==');
  const o2 = await place({ name: 'Tunde A' });
  await page.click('#f-today');
  await page.waitForTimeout(900);
  await page.click(`#orders-body tr:has-text("${o2.code}")`);
  await page.waitForTimeout(300);
  await page.click('#order-detail button[data-cancel]');
  await page.click('#order-detail button[data-cancel-confirm]');
  await page.waitForTimeout(400);
  ok('a cancellation with no reason is refused before it is sent',
    await page.isVisible('#app-error')
    && (await q('select status from orders where code=$1', [o2.code]))[0].status !== 'cancelled');
  await page.fill('#cancel-why', 'Customer changed their mind');
  await page.click('#order-detail button[data-cancel-confirm]');
  await page.waitForTimeout(300);
  await page.click('#order-detail button[data-cancel-confirm]');
  await page.waitForTimeout(900);
  const cancelled = (await q('select status, cancel_reason from orders where code=$1', [o2.code]))[0];
  ok('a cancellation with a reason goes through, on the second tap',
    cancelled.status === 'cancelled' && cancelled.cancel_reason === 'Customer changed their mind',
    JSON.stringify(cancelled));

  console.log('\n== filters and paging ==');
  await page.click('#f-clear');
  await page.waitForTimeout(900);
  const allCount = Number((await page.textContent('#page-label')).replace(/.* of /, ''));
  await page.fill('#f-search', o1.code);
  await page.click('#order-filters button[type=submit]');
  await page.waitForTimeout(900);
  ok('searching by order code finds exactly one',
    (await page.locator('#orders-body tr').count()) === 1);
  await page.fill('#f-search', '');
  await page.selectOption('#f-status', 'cancelled');
  await page.click('#order-filters button[type=submit]');
  await page.waitForTimeout(900);
  const cancelledOnly = await page.textContent('#orders-body');
  ok('filtering by status narrows the list',
    Number((await page.textContent('#page-label')).replace(/.* of /, '')) < allCount);
  ok('and only shows that status',
    !/COMPLETED|COOKING/i.test(cancelledOnly), cancelledOnly.replace(/\s+/g, ' ').slice(0, 160));

  await page.selectOption('#f-status', '');
  await page.click('#order-filters button[type=submit]');
  await page.waitForTimeout(900);
  ok('the first page has no Previous', await page.isDisabled('#page-prev'));

  console.log('\n== a customer name is text, never markup ==');
  const oX = await place({ name: '<img src=x onerror="window.__pwned=1">Ada' });
  await page.click('#f-clear');
  await page.waitForTimeout(900);
  await page.fill('#f-search', oX.code);
  await page.click('#order-filters button[type=submit]');
  await page.waitForTimeout(900);
  ok('the injected name renders as characters in the list',
    /<img src=x/.test(await page.textContent('#orders-body')));
  await page.click(`#orders-body tr:has-text("${oX.code}")`);
  await page.waitForTimeout(400);
  ok('and in the detail panel', /<img src=x/.test(await page.textContent('#order-detail')));
  ok('nothing executed', !(await page.evaluate(() => window.__pwned)));
  ok('no element was created from it',
    (await page.locator('#order-detail img').count()) === 0
    && (await page.locator('#orders-body img').count()) === 0);

  console.log('\n== taking an order over the phone ==');
  await page.click('.tab[data-view="new"]');
  await page.waitForSelector('#v-new:not([hidden])');
  await page.waitForTimeout(900);
  ok('the dish picker is populated', (await page.locator('.pick').count()) > 0);

  const jollofCard = page.locator('.pick', { hasText: 'Jollof Rice & Protein' });
  await jollofCard.locator('button[data-add]').click();
  await page.waitForTimeout(300);
  ok('a required choice is demanded before the dish can be added',
    await page.isVisible('#new-error')
    && (await page.locator('#basket li').count()) === 0,
    await page.textContent('#new-error'));

  await jollofCard.locator('.pick-group input').first().check();
  await jollofCard.locator('.js-qty').fill('2');
  await jollofCard.locator('button[data-add]').click();
  await page.waitForTimeout(300);
  ok('with the choice made it goes in the basket',
    (await page.locator('#basket li').count()) === 1);
  ok('the running total is shown',
    (await page.textContent('#sum-total')) === '₦4,000',
    await page.textContent('#sum-total'));

  await page.check('input[name=fulfilment][value=delivery]');
  await page.waitForTimeout(200);
  ok('choosing delivery reveals the address fields', await page.isVisible('#delivery-fields'));
  await page.fill('#c-name', 'Ngozi Bello');
  await page.fill('#c-phone', '08059998877');
  await page.click('#new-submit');
  await page.waitForTimeout(500);
  ok('a delivery with no address is refused before it is sent',
    await page.isVisible('#new-error'));

  await page.check('input[name=fulfilment][value=pickup]');
  await page.check('input[name=channel][value=phone]');
  await page.waitForTimeout(200);
  await page.click('#new-submit');
  await page.waitForSelector('#new-ok:not([hidden])', { timeout: 6000 });
  const okText = await page.textContent('#new-ok');
  ok('the confirmation shows the code and the price the database calculated',
    /NM-\d{4}-\d+/.test(okText) && /₦4,000/.test(okText), okText);
  const typed = (await q(
    `select code, channel, status, total_kobo, customer_name from orders
      where customer_phone = '08059998877'`))[0];
  ok('it is recorded as a phone order, not a web one', typed.channel === 'phone', typed.channel);
  ok('and priced by the database, not by the browser', typed.total_kobo === 400000, String(typed.total_kobo));
  ok('and it is new, so the kitchen sees it', typed.status === 'new');
  ok('the basket is emptied afterwards', (await page.locator('#basket li').count()) === 0);

  console.log('\n== the menu screen ==');
  await page.click('.tab[data-view="menu"]');
  await page.waitForSelector('#v-menu:not([hidden])');
  await page.waitForTimeout(900);

  ok('the zero-fee warning is showing, because the seed ships them at zero',
    await page.isVisible('#fee-warning'),
    await page.textContent('#fee-warning'));

  // The table is ordered by sort_order, not by name, so read back the area the
  // first row is actually for rather than assuming.
  const feeRow = page.locator('#areas-body tr').first();
  const feeArea = (await feeRow.locator('td').first().textContent()).trim();
  const firstFee = feeRow.locator('input[data-field="fee"]');
  await firstFee.fill('700');
  await firstFee.dispatchEvent('change');
  await page.waitForTimeout(900);
  const feeNow = (await q('select fee_kobo from delivery_areas where name=$1', [feeArea]))[0];
  ok('a delivery fee can be set', feeNow && feeNow.fee_kobo === 70000,
    feeArea + ' = ' + (feeNow ? feeNow.fee_kobo : 'no such area'));
  await page.waitForTimeout(300);
  ok('and the zero-fee warning counts down as they are filled in',
    !/\b7 areas\b/.test(await page.textContent('#fee-warning')),
    await page.textContent('#fee-warning'));

  const priceInput = page.locator('.dish-row', { hasText: 'Egusi Soup & Swallow' })
    .locator('input[data-field="price"]');
  await priceInput.fill('2750');
  await priceInput.dispatchEvent('change');
  await page.waitForTimeout(900);
  ok('a price can be changed',
    (await q("select price_kobo from menu_items where name='Egusi Soup & Swallow'"))[0].price_kobo === 275000);
  ok('and it does not rewrite what has already been sold',
    (await q("select count(*)::int n from order_items where name_at_order='Egusi Soup & Swallow' and unit_price_kobo = 275000"))[0].n === 0);

  const availToggle = page.locator('.dish-row', { hasText: 'Egusi Soup & Swallow' })
    .locator('input[data-field="available"]');
  await availToggle.uncheck();
  await page.waitForTimeout(900);
  ok('a dish can be marked sold out',
    (await q("select is_available from menu_items where name='Egusi Soup & Swallow'"))[0].is_available === false);

  const optBox = page.locator('.opt-row', { hasText: 'Choose your protein' })
    .locator('input[data-option]').first();
  await optBox.uncheck();
  await page.waitForTimeout(900);
  ok('a single choice can be switched off',
    (await q("select count(*)::int n from menu_options where not is_available"))[0].n > 0);

  // The point of switching it off: it must stop being offerable the moment
  // somebody picks up the phone.
  await page.click('.tab[data-view="new"]');
  await page.waitForTimeout(900);
  const proteinInputs = page.locator('.pick', { hasText: 'Jollof Rice & Protein' })
    .locator('.pick-group input');
  ok('a choice switched off cannot be picked when taking an order',
    await proteinInputs.first().isDisabled());
  ok('but the others still can',
    !(await proteinInputs.nth(1).isDisabled()));
  await page.click('.tab[data-view="menu"]');
  await page.waitForTimeout(900);

  console.log('\n== pausing the website ==');
  await page.uncheck('#s-accepting');
  await page.waitForTimeout(200);
  ok('a reason is asked for when pausing', await page.isVisible('#pause-reason-field'));
  await page.fill('#s-pause-reason', 'Swamped — back in 30 minutes');
  await page.click('#s-save');
  await page.waitForTimeout(900);
  ok('the pause is saved',
    (await q('select accepting_orders, pause_reason from settings'))[0].accepting_orders === false);
  ok('and the whole dashboard says so', await page.isVisible('#paused-banner'));
  ok('the banner explains staff can still take orders',
    /phone or at the counter/.test(await page.textContent('#paused-banner')));

  // A paused website must not stop the telephone.
  await page.click('.tab[data-view="new"]');
  await page.waitForTimeout(900);
  const card2 = page.locator('.pick', { hasText: 'Jollof Rice & Protein' });
  // Not .first(): that protein was switched off a moment ago, so it is
  // deliberately unselectable.
  await card2.locator('.pick-group input:not([disabled])').first().check();
  await card2.locator('button[data-add]').click();
  await page.fill('#c-name', 'Paused Caller');
  await page.fill('#c-phone', '08051112233');
  await page.check('input[name=channel][value=phone]');
  await page.click('#new-submit');
  await page.waitForSelector('#new-ok:not([hidden])', { timeout: 6000 });
  ok('staff can still take a phone order while the website is paused',
    (await q("select count(*)::int n from orders where customer_phone='08051112233'"))[0].n === 1);

  await page.click('.tab[data-view="menu"]');
  await page.waitForTimeout(900);
  await page.check('#s-accepting');
  await page.click('#s-save');
  await page.waitForTimeout(900);
  const resumed = (await q('select accepting_orders, pause_reason from settings'))[0];
  ok('resuming clears the stale reason',
    resumed.accepting_orders === true && resumed.pause_reason === null,
    JSON.stringify(resumed));
  ok('and the banner goes away', !(await page.isVisible('#paused-banner')));

  console.log('\n== reports ==');
  await page.click('.tab[data-view="reports"]');
  await page.waitForSelector('#v-reports:not([hidden])');
  await page.waitForTimeout(1200);
  const dbTotals = (await q(
    `select count(*)::int orders, coalesce(sum(total_kobo),0)::int gross
       from orders where status='completed' and day between $1::date and $2::date`,
    [await page.inputValue('#r-from'), await page.inputValue('#r-to')]))[0];
  const shown = await page.textContent('#report-totals');
  ok('the headline order count matches the database',
    shown.indexOf(String(dbTotals.orders)) !== -1, shown.replace(/\s+/g, ' '));
  ok('cancellations are counted separately from revenue',
    /Cancelled/.test(shown));
  ok('the day breakdown draws', (await page.locator('#report-days .bar-row').count()) > 0);
  ok('best sellers draw', (await page.locator('#report-top .bar-row').count()) > 0);
  ok('and how orders arrived is broken out',
    /Phone|Website|Counter/.test(await page.textContent('#report-splits')));

  await page.click('#report-filters button[data-range="30"]');
  await page.waitForTimeout(900);
  ok('the 30-day button moves the range',
    (await page.inputValue('#r-from')) < (await page.inputValue('#r-to')));

  console.log('\n== staff ==');
  await page.click('.tab[data-view="staff"]');
  await page.waitForSelector('#v-staff:not([hidden])');
  await page.waitForTimeout(900);
  ok('both accounts are listed', (await page.locator('#staff-body tr').count()) === 2);
  ok('your own row is marked', /\(you\)/.test(await page.textContent('#staff-body')));
  ok('emails are shown', /kitchen@nicemeal.test/.test(await page.textContent('#staff-body')));

  await page.fill('#st-email', 'ghost@nicemeal.test');
  await page.fill('#st-name', 'Ghost');
  await page.click('#staff-add button[type=submit]');
  await page.waitForTimeout(900);
  ok('adding someone with no login says so, and says what to do',
    /Create the login in Supabase/.test(await page.textContent('#staff-error')),
    await page.textContent('#staff-error'));

  await page.fill('#st-email', 'nobody@nicemeal.test');
  await page.fill('#st-name', 'Second Cook');
  await page.selectOption('#st-role', 'kitchen');
  await page.click('#staff-add button[type=submit]');
  await page.waitForTimeout(900);
  ok('somebody with a login can be added',
    (await q("select count(*)::int n from staff"))[0].n === 3);
  ok('and appears in the list', (await page.locator('#staff-body tr').count()) === 3);

  // The one change that could not be undone from any screen.
  const ownRow = page.locator('#staff-body tr', { hasText: '(you)' });
  await ownRow.locator('input[data-field="active"]').uncheck();
  await page.waitForTimeout(1000);
  ok('the last administrator cannot switch themselves off',
    (await q("select is_active from staff where user_id='22222222-2222-2222-2222-222222222222'"))[0].is_active === true);
  ok('the refusal is explained', await page.isVisible('#app-error'),
    await page.textContent('#app-error'));
  ok('and the switch goes back to where it was, rather than lying',
    await ownRow.locator('input[data-field="active"]').isChecked());

  const kitchenRow = page.locator('#staff-body tr', { hasText: 'Kitchen tablet' });
  await kitchenRow.locator('select[data-field="role"]').selectOption('admin');
  await page.waitForTimeout(1000);
  ok('a kitchen account can be promoted',
    (await q("select role from staff where user_id='11111111-1111-1111-1111-111111111111'"))[0].role === 'admin');
  await kitchenRow.locator('select[data-field="role"]').selectOption('kitchen');
  await page.waitForTimeout(900);

  console.log('\n== narrow screens ==');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click('.tab[data-view="orders"]');
  await page.waitForTimeout(900);
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok('no sideways scrolling at 390px', overflow <= 0, 'overflow ' + overflow + 'px');
  await page.screenshot({ path: (process.env.SHOTS || '.') + '/shot-admin-390.png', fullPage: true });
  await page.setViewportSize({ width: 1500, height: 950 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: (process.env.SHOTS || '.') + '/shot-admin-1500.png' });
  await page.click('.tab[data-view="reports"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: (process.env.SHOTS || '.') + '/shot-admin-reports.png' });

  console.log('\n== session ==');
  await page.click('#signout');
  await page.waitForSelector('#view-signin:not([hidden])', { timeout: 5000 });
  ok('sign out returns to the sign-in screen', await page.isVisible('#signin-form'));
  ok('and clears the stored session', await page.evaluate(() => !localStorage.getItem('nm.session')));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(700);
  ok('a reload does not walk back in', await page.isVisible('#signin-form'));

  console.log('\n== console ==');
  // Deliberate: two wrong sign-ins, and several refusals the screen asks for
  // on purpose (an unknown email, the last-admin lockout).
  const unexpected = badResponses.filter(r =>
    !/^400 .*\/auth\/v1\/token\?grant_type=password$/.test(r) &&
    !/^400 .*\/rest\/v1\/rpc\/admin_(add_staff|set_staff)$/.test(r));
  ok('no unexpected failed requests', unexpected.length === 0, unexpected.join(' | '));
  const real = errors.filter(e => !/status of 400/.test(e) && !/net::ERR_/.test(e));
  ok('no unexpected console errors', real.length === 0, real.join(' | '));
  ok('nothing was blocked by the page\'s own CSP',
    !errors.some(e => /Content Security Policy/i.test(e)),
    errors.filter(e => /Content Security Policy/i.test(e)).join(' | '));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  await browser.close();
  await pool.end();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
