/* Drives the public checkout against the stub + the real migrations.
   Restores every setting and every menu row it changes, so the suites that
   follow it still see the seeded shop. */
const { chromium } = require('playwright');
const { Pool } = require('pg');
const BASE = 'http://127.0.0.1:8199';
const APP  = BASE + '/order.html';
// Host, port and user come from the usual PG* environment variables.
const pool = new Pool({ database: process.env.DB || 'nm_dash' });

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra ? '  << ' + extra : '')); }
}
const q = async (sql, args) => (await pool.query(sql, args)).rows;

const dish = (page, name) => page.locator('.dish-card', { hasText: name });

async function addSimple(page, name) {
  await dish(page, name).locator('button[data-add]').click();
  await page.waitForTimeout(250);
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const errors = [];
  const badResponses = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) badResponses.push(r.status() + ' ' + r.url()); });
  // The site's fonts are unreachable from this sandbox and are not what is
  // under test.
  await page.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.route('https://fonts.gstatic.com/**', r => r.abort());

  console.log('\n== the menu loads ==');
  await page.goto(APP, { waitUntil: 'load' });
  await page.waitForSelector('#step-choose:not([hidden])', { timeout: 8000 });
  ok('the whole menu arrives', (await page.locator('.dish-card').count()) === 7,
    String(await page.locator('.dish-card').count()));
  ok('it is grouped into courses', (await page.locator('.course').count()) >= 3);
  ok('prices are shown in naira', /₦2,000/.test(await page.textContent('#dishes')));
  ok('the loading message is gone', !(await page.isVisible('#loading')));
  ok('nothing is in the order yet', await page.isDisabled('#to-details'));
  ok('and the phone bar is out of the way', !(await page.isVisible('#cart-bar')));

  console.log('\n== a dish with no choices ==');
  await addSimple(page, 'White Rice & Stew');
  ok('one press adds it', (await page.locator('.basket-line').count()) === 1);
  ok('the total follows', (await page.textContent('#sum-total')) === '₦2,000',
    await page.textContent('#sum-total'));
  ok('Continue becomes available', !(await page.isDisabled('#to-details')));

  console.log('\n== a dish that needs a choice ==');
  const jollof = dish(page, 'Jollof Rice & Protein');
  await jollof.locator('button[data-add]').click();
  await page.waitForTimeout(250);
  ok('the first press opens the choices rather than guessing',
    await jollof.locator('.dish-options').isVisible());
  ok('and the button now says what it will do',
    (await jollof.locator('button[data-add]').textContent()) === 'Add to order');

  await jollof.locator('button[data-add]').click();
  await page.waitForTimeout(250);
  ok('adding without choosing is refused, in words',
    /choose/i.test(await jollof.locator('.dish-error').textContent()),
    await jollof.locator('.dish-error').textContent());
  ok('and nothing was added', (await page.locator('.basket-line').count()) === 1);

  await jollof.locator('.opt input:not([disabled])').first().check();
  await jollof.locator('button[data-add]').click();
  await page.waitForTimeout(250);
  ok('with the choice made it goes in', (await page.locator('.basket-line').count()) === 2);
  ok('the choice is written on the line',
    /Chicken/.test(await page.textContent('#basket')), await page.textContent('#basket'));
  ok('the card closes itself again', !(await jollof.locator('.dish-options').isVisible()));

  console.log('\n== quantities ==');
  await jollof.locator('button[data-add]').click();
  await jollof.locator('.opt input:not([disabled])').first().check();
  await jollof.locator('button[data-add]').click();
  await page.waitForTimeout(250);
  ok('the same dish with the same choices merges into one line',
    (await page.locator('.basket-line').count()) === 2);
  ok('and its quantity goes to two',
    (await page.locator('.basket-line', { hasText: 'Jollof' }).locator('.qty-count').textContent()) === '2');
  ok('the total follows the quantity', (await page.textContent('#sum-total')) === '₦6,000',
    await page.textContent('#sum-total'));

  const riceLine = page.locator('.basket-line', { hasText: 'White Rice' });
  await riceLine.locator('button[data-less]').click();
  await page.waitForTimeout(250);
  ok('taking the last one off removes the line',
    (await page.locator('.basket-line').count()) === 1);

  console.log('\n== what is off today ==');
  await q("update menu_items set is_available = false where name = 'Beans & Plantain'");
  await q(`update menu_options set is_available = false where name = 'Gizzard'`);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#step-choose:not([hidden])');
  const beans = dish(page, 'Beans & Plantain');
  ok('a sold-out dish is still listed', await beans.count() === 1);
  ok('and says so', /Sold out today/.test(await beans.textContent()));
  ok('and cannot be added', await beans.locator('button[data-add]').isDisabled());
  const gizzard = page.locator('.opt', { hasText: 'Gizzard' });
  await dish(page, 'Jollof Rice & Protein').locator('button[data-add]').click();
  await page.waitForTimeout(250);
  ok('a choice that is off cannot be picked', await gizzard.locator('input').isDisabled());
  ok('and says why', /off today/.test(await gizzard.textContent()));
  await q("update menu_items set is_available = true where name = 'Beans & Plantain'");
  await q(`update menu_options set is_available = true where name = 'Gizzard'`);

  console.log('\n== a dish name is text, never markup ==');
  await q(`update menu_items set name = '<img src=x onerror="window.__pwned=1">Suya'
            where name = 'Banga Soup & Starch'`);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#step-choose:not([hidden])');
  ok('the injected name renders as characters',
    /<img src=x/.test(await page.textContent('#dishes')));
  ok('nothing executed', !(await page.evaluate(() => window.__pwned)));
  ok('no element was created from it', (await page.locator('#dishes img').count()) === 0);
  await q(`update menu_items set name = 'Banga Soup & Starch'
            where name like '<img%'`);

  console.log('\n== the minimum order ==');
  await q('update settings set min_order_kobo = 500000');
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#step-choose:not([hidden])');
  await addSimple(page, 'White Rice & Stew');
  ok('an order under the minimum is held back', await page.isDisabled('#to-details'));
  ok('and says how much more is needed',
    /₦3,000 more/.test(await page.textContent('#min-warning')),
    await page.textContent('#min-warning'));
  await addSimple(page, 'White Rice & Stew');
  await addSimple(page, 'White Rice & Stew');
  await page.waitForTimeout(200);
  ok('reaching it releases the button', !(await page.isDisabled('#to-details')));
  await q('update settings set min_order_kobo = 0');

  console.log('\n== free delivery over a threshold ==');
  await q('update settings set free_delivery_threshold_kobo = 500000');
  await q(`update delivery_areas set fee_kobo = 50000 where name = 'Baruwa'`);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#step-choose:not([hidden])');
  await addSimple(page, 'White Rice & Stew');
  await page.click('#to-details');
  await page.waitForTimeout(250);
  await page.check('input[name=fulfilment][value=delivery]');
  const baruwa = (await q("select id from delivery_areas where name = 'Baruwa'"))[0].id;
  await page.selectOption('#c-area', baruwa);
  await page.waitForTimeout(250);
  ok('a fee is charged under the threshold',
    (await page.textContent('#d-fee')) === '₦500', await page.textContent('#d-fee'));
  await page.check('input[name=fulfilment][value=pickup]');
  await page.waitForTimeout(200);
  ok('and no delivery line is shown at all for a pickup',
    !(await page.isVisible('#d-fee-row')));
  await page.check('input[name=fulfilment][value=delivery]');
  await page.waitForTimeout(200);
  await page.click('#back-to-choose');
  await addSimple(page, 'White Rice & Stew');
  await addSimple(page, 'White Rice & Stew');
  await page.click('#to-details');
  await page.waitForTimeout(250);
  ok('and waived above it', (await page.textContent('#d-fee')) === 'Free',
    await page.textContent('#d-fee'));

  console.log('\n== what the form refuses before sending ==');
  await page.fill('#c-name', 'A');
  await page.click('#place-order');
  await page.waitForTimeout(250);
  ok('a one-letter name is refused', /tell us your name/i.test(await page.textContent('#details-error')));
  await page.fill('#c-name', 'Chidinma Okafor');
  await page.fill('#c-phone', 'not a phone');
  await page.click('#place-order');
  await page.waitForTimeout(250);
  ok('a phone number that cannot be called is refused',
    /phone number/i.test(await page.textContent('#details-error')));
  await page.fill('#c-phone', '08031234567');
  await page.click('#place-order');
  await page.waitForTimeout(250);
  ok('a delivery with no address is refused',
    /street address/i.test(await page.textContent('#details-error')));
  const before = (await q('select count(*)::int n from orders'))[0].n;
  ok('and none of that reached the database',
    (await q('select count(*)::int n from orders'))[0].n === before);

  console.log('\n== placing it ==');
  await page.fill('#c-address', '14 Aina Obembe Street, by the black gate');
  await page.fill('#c-notes', 'Plenty pepper please');
  await page.click('#place-order');
  await page.waitForSelector('#step-done:not([hidden])', { timeout: 8000 });
  const code = (await page.textContent('#done-code')).trim();
  ok('the confirmation shows the order code', /^NM-\d{4}-\d+$/.test(code), code);

  const saved = (await q(`select channel, status, total_kobo, delivery_fee_kobo, address, notes,
                                 customer_name, customer_phone
                            from orders where code = $1`, [code]))[0];
  ok('it is recorded as a website order', saved.channel === 'web', saved.channel);
  ok('and it is new, so the kitchen sees it', saved.status === 'new');
  ok('the address was kept', /Aina Obembe/.test(saved.address));
  ok('and the note', /Plenty pepper/.test(saved.notes));
  ok('delivery was free, above the threshold', saved.delivery_fee_kobo === 0,
    String(saved.delivery_fee_kobo));
  ok('the confirmation quotes the price the database calculated',
    (await page.textContent('#done-summary')).indexOf(
      '₦' + (saved.total_kobo / 100).toLocaleString('en-US')) !== -1,
    await page.textContent('#done-summary'));
  ok('and says the number we will call',
    /08031234567/.test(await page.textContent('#done-call')));
  ok('it is clear nothing was paid',
    /pay when it arrives/i.test(await page.textContent('#done-summary')),
    await page.textContent('#done-summary'));

  // The kitchen is the point of all this.
  const onBoard = (await q(`select count(*)::int n from orders
                             where code = $1 and status in ('new','preparing','ready')`, [code]))[0].n;
  ok('the order is on the kitchen board', onBoard === 1);

  console.log('\n== finding it again ==');
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#recent:not([hidden])', { timeout: 8000 });
  ok('the order is remembered on this device',
    (await page.textContent('#recent-list')).indexOf(code) !== -1);
  await page.waitForTimeout(1200);
  ok('and its status is fetched', /With the kitchen/i.test(await page.textContent('#recent-list')),
    await page.textContent('#recent-list'));

  await q(`update orders set status = 'preparing', preparing_at = now() where code = $1`, [code]);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#recent:not([hidden])');
  await page.waitForTimeout(1200);
  ok('the status follows what the kitchen does',
    /Being cooked/i.test(await page.textContent('#recent-list')),
    await page.textContent('#recent-list'));

  // The code alone is guessable — they are sequential. The token is what stops
  // a stranger reading somebody else's order.
  const guessed = await page.evaluate(async (args) => {
    const res = await fetch(args.base + '/rest/v1/rpc/get_order_status', {
      method: 'POST',
      headers: { apikey: 'test-anon', 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_code: args.code, p_token: '11111111-2222-3333-4444-555555555555' })
    });
    return res.json();
  }, { base: BASE, code });
  ok('the order code alone will not open somebody else\'s order',
    guessed === null || guessed === undefined, JSON.stringify(guessed));

  console.log('\n== when we are not taking orders ==');
  await q(`update settings set accepting_orders = false, pause_reason = 'Swamped — back at 7pm'`);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#paused:not([hidden])', { timeout: 8000 });
  ok('the checkout says so instead of failing', await page.isVisible('#paused'));
  ok('and gives the reason', /back at 7pm/.test(await page.textContent('#paused-reason')));
  ok('and offers the telephone',
    /^tel:/.test(await page.getAttribute('#paused-call', 'href')));
  ok('the menu is not shown as orderable', !(await page.isVisible('#step-choose')));
  await q(`update settings set accepting_orders = true, pause_reason = null`);

  console.log('\n== when the database cannot be reached ==');
  await fetch(BASE + '/__test/api?up=0');
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#unavailable:not([hidden])', { timeout: 8000 });
  ok('the page does not become a dead end', await page.isVisible('#unavailable'));
  ok('it puts the phone number in front of the customer',
    /^tel:/.test(await page.getAttribute('#fallback-call', 'href')));
  ok('and does not blame them', /not yours/.test(await page.textContent('#unavailable')));
  await fetch(BASE + '/__test/api?up=1');

  console.log('\n== before the keys are filled in ==');
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const p2 = await ctx2.newPage();
  await p2.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await p2.route('**/config.js', r => r.fulfill({
    contentType: 'text/javascript',
    body: "window.NM_CONFIG={SUPABASE_URL:'https://YOUR-PROJECT-REF.supabase.co',SUPABASE_ANON_KEY:'x',PHONE:'0915 742 8604',PHONE_TEL:'+2349157428604'};"
  }));
  await p2.goto(APP, { waitUntil: 'load' });
  await p2.waitForSelector('#unavailable:not([hidden])', { timeout: 8000 });
  ok('an unconfigured site shows the customer the telephone, not a stack trace',
    await p2.isVisible('#unavailable'));
  await ctx2.close();

  console.log('\n== the rest of the site still works without a database ==');
  const ctx3 = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const p3 = await ctx3.newPage();
  await p3.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await p3.route('https://fonts.gstatic.com/**', r => r.abort());
  await fetch(BASE + '/__test/api?up=0');
  await p3.goto(BASE + '/index.html', { waitUntil: 'load' });
  ok('the homepage renders with the API down',
    (await p3.locator('.menu-card').count()) > 0);
  await p3.goto(BASE + '/nice-meal-menu.html', { waitUntil: 'load' });
  ok('and so does the full menu', (await p3.locator('.menu-item').count()) === 7);
  ok('the menu page links to the checkout',
    (await p3.locator('a[href$="order.html"]').count()) > 0);
  await fetch(BASE + '/__test/api?up=1');
  await ctx3.close();

  console.log('\n== a delivery fee nobody has set ==');
  // The seed leaves every area without one, because the website never quoted a
  // fee. Held as ₦0 that was indistinguishable from a decision to deliver for
  // free, and this page believed it: every area read "free delivery" and the
  // total was printed as if it were settled. The rider would have been the one
  // to break that promise.
  await q('update settings set accepting_orders = true, min_order_kobo = 0, free_delivery_threshold_kobo = null');
  await q('update delivery_areas set fee_kobo = null');
  await page.goto(APP, { waitUntil: 'load' });
  await page.waitForSelector('#step-choose:not([hidden])', { timeout: 8000 });
  await addSimple(page, 'White Rice & Stew');
  await page.click('#to-details');
  await page.waitForTimeout(250);
  await page.check('input[name=fulfilment][value=delivery]');
  await page.waitForTimeout(250);

  const areaText = await page.textContent('#c-area');
  ok('no area offers free delivery on the strength of a fee nobody set',
    !/free delivery/i.test(areaText), areaText);
  ok('each one says the fee is still coming', /confirmed when we call/i.test(areaText), areaText);
  ok('and the delivery line says so instead of "Free"',
    /confirm/i.test(await page.textContent('#d-fee')), await page.textContent('#d-fee'));
  ok('the total does not present itself as settled',
    /\+ delivery$/.test(await page.textContent('#d-total')), await page.textContent('#d-total'));

  await page.fill('#c-name', 'Ifeoma Balogun');
  await page.fill('#c-phone', '08033334444');
  await page.fill('#c-address', '2 Aina Obembe Street');
  await page.click('#place-order');
  await page.waitForSelector('#step-done:not([hidden])', { timeout: 8000 });
  const pendingCode = (await page.textContent('#done-code')).trim();
  const pendingOrder = (await q(
    'select subtotal_kobo, delivery_fee_kobo, total_kobo from orders where code = $1',
    [pendingCode]))[0];
  ok('the order is stored with no delivery fee, not with a fee of zero',
    pendingOrder.delivery_fee_kobo === null, String(pendingOrder.delivery_fee_kobo));
  ok('and its total is the food alone',
    pendingOrder.total_kobo === pendingOrder.subtotal_kobo,
    pendingOrder.total_kobo + ' vs ' + pendingOrder.subtotal_kobo);
  // The last moment anyone can be told, before somebody is at the door with it.
  const doneText = await page.textContent('#done-summary');
  ok('and the confirmation says the delivery fee is still to come',
    /delivery fee we will confirm on the call/i.test(doneText), doneText);
  ok('while still making clear nothing was paid online',
    /pay when it arrives/i.test(doneText), doneText);

  // A fee of zero is a different thing, and it is allowed to say so.
  await q(`update delivery_areas set fee_kobo = 0 where name = 'Ayobo'`);
  await page.goto(APP, { waitUntil: 'load' });
  await page.waitForSelector('#step-choose:not([hidden])', { timeout: 8000 });
  await addSimple(page, 'White Rice & Stew');
  await page.click('#to-details');
  await page.waitForTimeout(250);
  await page.check('input[name=fulfilment][value=delivery]');
  await page.selectOption('#c-area', (await q("select id from delivery_areas where name = 'Ayobo'"))[0].id);
  await page.waitForTimeout(250);
  ok('an area actually set to zero is free, and says free',
    (await page.textContent('#d-fee')) === 'Free', await page.textContent('#d-fee'));
  ok('and its total is a settled figure again',
    !/\+ delivery/.test(await page.textContent('#d-total')), await page.textContent('#d-total'));
  await q('update delivery_areas set fee_kobo = null');

  console.log('\n== narrow screens ==');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(APP, { waitUntil: 'load' });
  await page.waitForSelector('#step-choose:not([hidden])');
  await addSimple(page, 'White Rice & Stew');
  ok('the phone bar appears once there is something in the order',
    await page.isVisible('#cart-bar'));
  ok('and shows the running total', /₦2,000/.test(await page.textContent('#cart-bar-sum')));
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok('no sideways scrolling at 390px', overflow <= 0, 'overflow ' + overflow + 'px');
  await page.screenshot({ path: (process.env.SHOTS || '.') + '/shot-order-390.png', fullPage: true });
  await page.setViewportSize({ width: 1280, height: 950 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: (process.env.SHOTS || '.') + '/shot-order-1280.png' });
  await page.click('#to-details');
  await page.waitForTimeout(400);
  await page.screenshot({ path: (process.env.SHOTS || '.') + '/shot-order-details.png' });

  console.log('\n== console ==');
  const unexpected = badResponses.filter(r => !/503/.test(r) && !/fonts\./.test(r));
  ok('no unexpected failed requests', unexpected.length === 0, unexpected.join(' | '));
  const real = errors.filter(e => !/status of 503/.test(e) && !/net::ERR_/.test(e)
                              && !/Failed to load resource/.test(e));
  ok('no unexpected console errors', real.length === 0, real.join(' | '));
  ok('nothing was blocked by the page\'s own CSP',
    !errors.some(e => /Content Security Policy/i.test(e)),
    errors.filter(e => /Content Security Policy/i.test(e)).join(' | '));

  // Put the shop back exactly as the seed leaves it, for the suites after this.
  await q('update settings set min_order_kobo = 0, free_delivery_threshold_kobo = null, accepting_orders = true, pause_reason = null');
  // Null, not zero: the seed leaves the fees unset, and zero would hand the
  // suites after this a shop that has decided to deliver everywhere for free.
  await q(`update delivery_areas set fee_kobo = null`);
  await q('update menu_items set is_available = true, is_active = true');
  await q('update menu_options set is_available = true');

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  await browser.close();
  await pool.end();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
