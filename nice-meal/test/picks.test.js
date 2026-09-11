/* Picking dishes on the marketing pages, and the handover to the checkout.
 *
 * The interesting part is not the buttons — it is the seam. index.html and
 * nice-meal-menu.html carry a static copy of the menu and the database carries
 * the real one, so these checks are mostly about what happens when the two
 * disagree: a dish sold out, withdrawn, or needing a choice the static page
 * never knew about.
 *
 * Restores every menu row it changes, so the suites after it see the seeded
 * shop.
 */
const { chromium } = require('playwright');
const { Pool } = require('pg');
const BASE = 'http://127.0.0.1:8199';
const pool = new Pool({ database: process.env.DB || 'nm_dash' });

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra ? '  << ' + extra : '')); }
}
const q = async (sql, args) => (await pool.query(sql, args)).rows;

const card = (page, name) => page.locator('[data-dish]', { hasText: name }).first();

/* The sections arrive on a scroll-driven animation, so a control can still be
   moving when the click lands. Turning animation off is not hiding a problem:
   it is the same thing the accessibility suite does, for the same reason. */
async function settle(page) {
  await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
  await page.waitForTimeout(200);
}

/* The nav is sticky and the picks bar is fixed, so scrolling a control to the
   nearest edge can park it under one of them. A customer scrolls past that;
   a test has to aim for the middle of the viewport instead. */
async function tap(locator) {
  await locator.evaluate(el => el.scrollIntoView({ block: 'center' }));
  await locator.click();
}

async function add(page, name, times = 1) {
  const c = card(page, name);
  await tap(c.locator('.pick-add-btn'));
  for (let i = 1; i < times; i++) { await tap(c.locator('.pick-step-btn').nth(1)); }
  await page.waitForTimeout(150);
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const errors = [];
  const requests = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('request', r => requests.push(r.url()));
  await page.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.route('https://fonts.gstatic.com/**', r => r.abort());

  console.log('\n== the homepage ==');
  await page.goto(BASE + '/index.html', { waitUntil: 'load' });
  await page.waitForSelector('.pick-add-btn', { timeout: 8000 });
  await settle(page);
  ok('every card can be ordered from', (await page.locator('.menu-card .pick-add-btn').count()) === 7,
    String(await page.locator('.menu-card .pick-add-btn').count()));
  ok('the bar stays out of the way until something is picked',
    !(await page.isVisible('#pick-bar')));

  await add(page, 'Jollof Rice & Protein');
  ok('one press picks it', await page.isVisible('#pick-bar'));
  ok('the bar counts it', (await page.textContent('#pick-count')) === '1 dish picked',
    await page.textContent('#pick-count'));
  ok('the card swaps to a stepper', await card(page, 'Jollof Rice & Protein').locator('.pick-step').isVisible());
  ok('and hides the add button', !(await card(page, 'Jollof Rice & Protein').locator('.pick-add-btn').isVisible()));

  // The whole reason for a stepper: adding three and being stuck with three
  // sends people to the phone.
  const jollof = card(page, 'Jollof Rice & Protein');
  await tap(jollof.locator('.pick-step-btn').nth(1));
  await page.waitForTimeout(120);
  ok('the plus adds another', (await jollof.locator('.pick-qty').textContent()) === '2');
  await tap(jollof.locator('.pick-step-btn').nth(0));
  await page.waitForTimeout(120);
  ok('the minus takes one back off', (await jollof.locator('.pick-qty').textContent()) === '1');
  await tap(jollof.locator('.pick-step-btn').nth(0));
  await page.waitForTimeout(120);
  ok('taking the last one off removes it', !(await page.isVisible('#pick-bar')));
  ok('and the add button comes back', await jollof.locator('.pick-add-btn').isVisible());

  console.log('\n== no page on this site starts talking to a server ==');
  // The marketing pages hold no keys and make no requests. That is enforced by
  // their own CSP (connect-src 'none'), so a regression here would show up as a
  // silent CSP violation rather than a failed feature.
  requests.length = 0;
  await add(page, 'Egusi Soup & Swallow');
  await page.waitForTimeout(300);
  ok('picking a dish sends nothing anywhere', requests.length === 0, requests.join(' | '));
  ok('nothing was blocked by the page\'s CSP',
    !errors.some(e => /Content Security Policy/i.test(e)),
    errors.filter(e => /Content Security Policy/i.test(e)).join(' | '));

  console.log('\n== it survives moving between pages ==');
  await page.goto(BASE + '/nice-meal-menu.html', { waitUntil: 'load' });
  await page.waitForSelector('.pick-add-btn', { timeout: 8000 });
  await settle(page);
  ok('the pick is still there on the full menu', await page.isVisible('#pick-bar'));
  ok('shown on the right dish',
    (await card(page, 'Egusi Soup & Swallow').locator('.pick-qty').textContent()) === '1');
  // One control per row. Each holds both an add button and a stepper, with
  // whichever does not apply hidden, so count the rows rather than the buttons.
  ok('every menu row can be ordered from too',
    (await page.locator('.menu-item .pick-add').count()) === 7,
    String(await page.locator('.menu-item .pick-add').count()));

  console.log('\n== the printed choices are the kitchen\'s own ==');
  // This page is a second copy of the kitchen's menu, and a copy drifts: it
  // once offered "Fried chicken" and "Grilled chicken" where the database's
  // options for that dish were "Fried" and "Grilled". Nothing broke — the
  // checkout asks with the database's own wording — but the customer read one
  // menu and was then asked another.
  //
  // Compared against public_menu() itself rather than against a list retyped
  // here, because that is the exact payload the checkout is served: question
  // text, option names, and the order of both. Editing either menu alone fails
  // this, which is the point.
  const served = (await q('select public.public_menu() as menu'))[0].menu;
  const fromDb = {};
  served.categories.forEach(c => c.items.forEach(i => {
    fromDb[i.name] = i.groups.map(g => ({ question: g.name, options: g.options.map(o => o.name) }));
  }));

  const printed = await page.$$eval('[data-dish]', arts => arts.map(a => ({
    dish: a.getAttribute('data-dish'),
    groups: [].slice.call(a.querySelectorAll('.menu-item-choice')).map(box => ({
      question: box.querySelector('.menu-item-choice-q').textContent.trim(),
      options: [].slice.call(box.querySelectorAll('.menu-item-options li')).map(li => li.textContent.trim())
    }))
  })));

  printed.forEach(row => {
    const want = fromDb[row.dish] || [];
    ok('the page asks of ' + row.dish + ' exactly what the checkout asks',
      JSON.stringify(row.groups) === JSON.stringify(want),
      'page ' + JSON.stringify(row.groups) + '   database ' + JSON.stringify(want));
  });
  const missing = Object.keys(fromDb).filter(n => !printed.some(p => p.dish === n));
  ok('and nothing the kitchen sells is left off the page', missing.length === 0, missing.join(', '));

  // A bare list of "Fried, Grilled" read aloud without its question is the same
  // gap all over again, for someone who cannot see the heading above it.
  ok('each printed list of choices is named by its question',
    await page.$$eval('.menu-item-options', uls => uls.every(ul => {
      const heading = document.getElementById(ul.getAttribute('aria-labelledby') || '');
      return !!heading && heading.closest('.menu-item-choice') === ul.closest('.menu-item-choice');
    })));

  await add(page, 'Beans & Plantain', 2);
  ok('the bar counts across both pages', (await page.textContent('#pick-count')) === '3 dishes picked',
    await page.textContent('#pick-count'));

  console.log('\n== the handover to the checkout ==');
  await page.click('#pick-bar a');
  await page.waitForSelector('#step-choose:not([hidden])', { timeout: 8000 });

  // Beans has no choices, so it lands in the basket priced by the database.
  // Egusi needs a swallow, so it must NOT be guessed at.
  ok('what needed no choice is already in the order',
    (await page.locator('.basket-line').count()) === 1,
    String(await page.locator('.basket-line').count()));
  ok('with the quantity that was picked',
    (await page.locator('.basket-line .qty-count').first().textContent()) === '2',
    await page.locator('.basket-line .qty-count').first().textContent());
  ok('priced by the database, not by the page it came from',
    (await page.textContent('#sum-total')) === '₦3,000', await page.textContent('#sum-total'));

  const said = await page.textContent('#carried-said');
  ok('the customer is told what came over', /brought over 2 dishes/i.test(said), said);
  ok('and what still needs an answer', /Egusi Soup & Swallow needs a choice/i.test(said), said);
  ok('the dish that needs a choice is opened, not guessed at',
    await page.locator('.dish-card', { hasText: 'Egusi Soup & Swallow' }).locator('.dish-options').isVisible());
  ok('showing the database\'s own options',
    /Pounded yam/.test(await page.locator('.dish-card', { hasText: 'Egusi Soup & Swallow' }).textContent()));

  console.log('\n== the picks are spent, not repeated ==');
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#step-choose:not([hidden])', { timeout: 8000 });
  ok('a reload does not re-stock the basket', (await page.locator('.basket-line').count()) === 0,
    String(await page.locator('.basket-line').count()));
  ok('and says nothing about a handover that already happened',
    !(await page.isVisible('#carried')));

  console.log('\n== when the two menus disagree ==');
  await q(`update menu_items set is_available = false where name = 'Banga Soup & Starch'`);
  await q(`update menu_items set is_active = false where name = 'White Rice & Stew'`);

  await page.goto(BASE + '/nice-meal-menu.html', { waitUntil: 'load' });
  await page.waitForSelector('.pick-add-btn', { timeout: 8000 });
  await settle(page);
  await add(page, 'Banga Soup & Starch');
  await add(page, 'White Rice & Stew');
  await add(page, 'Beans & Plantain');
  await page.click('#pick-bar a');
  await page.waitForSelector('#step-choose:not([hidden])', { timeout: 8000 });

  const said2 = await page.textContent('#carried-said');
  ok('a dish sold out today is named, not dropped', /Banga Soup & Starch is sold out/i.test(said2), said2);
  ok('a dish no longer on the menu is named too',
    /White Rice & Stew is not on today's menu/i.test(said2), said2);
  ok('and the rest of the order still came through', (await page.locator('.basket-line').count()) === 1,
    String(await page.locator('.basket-line').count()));
  ok('neither one reached the basket',
    !/Banga|White Rice/.test(await page.textContent('#basket')),
    await page.textContent('#basket'));

  console.log('\n== the menu still reads with the ordering broken ==');
  await q('update menu_items set is_available = true, is_active = true');
  const offline = await ctx.newPage();
  await offline.route('**/rest/v1/**', r => r.abort());
  await offline.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await offline.goto(BASE + '/nice-meal-menu.html', { waitUntil: 'load' });
  await offline.waitForSelector('.pick-add-btn', { timeout: 8000 });
  await settle(offline);
  ok('the full menu still lists every dish', (await offline.locator('.menu-item').count()) === 7);
  ok('and can still take a pick', await offline.locator('.pick-add-btn').first().isEnabled());
  await offline.close();

  const real = errors.filter(e => !/net::ERR_/.test(e) && !/Failed to load resource/.test(e));
  ok('no unexpected console errors', real.length === 0, real.join(' | '));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  await browser.close();
  await pool.end();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
