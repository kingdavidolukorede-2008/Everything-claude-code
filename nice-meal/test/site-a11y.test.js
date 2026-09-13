/* axe-core over the three public pages, including the checkout in each state
   a customer can land in. WCAG 2.0 A/AA and 2.1 A/AA, plus axe's own
   best-practice rules on the marketing pages. */
const { chromium } = require('playwright');
const fs = require('fs');
const { Pool } = require('pg');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = 'http://127.0.0.1:8199';
// Host, port and user come from the usual PG* environment variables.
const pool = new Pool({ database: process.env.DB || 'nm_dash' });

const AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const AA_PLUS = AA.concat(['best-practice']);

let total = 0;
const q = async (sql, args) => (await pool.query(sql, args)).rows;

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });

  for (const width of [1280, 900, 390]) {
    const ctx = await b.newContext({ viewport: { width, height: 900 }, bypassCSP: true });
    const p = await ctx.newPage();
    // Google Fonts is unreachable from the sandbox and is not what is under
    // test; stub the stylesheet so the pages finish loading.
    await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await p.route('https://fonts.gstatic.com/**', r => r.abort());

    for (const path of ['/index.html', '/nice-meal-menu.html']) {
      await p.goto(BASE + path, { waitUntil: 'load' });
      await p.evaluate(() => { try { localStorage.removeItem('nm.picks'); } catch (e) {} });
      await p.reload({ waitUntil: 'load' });
      await settle(p);
      await run(p, `${path} @ ${width}`, AA_PLUS);

      // Picking a dish puts a stepper on it and a fixed bar over the page —
      // new foreground/background pairs on both the cream rows and the dark
      // photo cards.
      await p.locator('.pick-add-btn').first().click();
      await p.waitForTimeout(200);
      await settle(p);
      await run(p, `${path} with a dish picked @ ${width}`, AA_PLUS);

      // A hover that fills a button flips its foreground and background, and
      // that is where this project has lost contrast before.
      await p.locator('.pick-step-btn').first().hover();
      await p.waitForTimeout(150);
      await run(p, `${path} hovering the stepper @ ${width}`, AA_PLUS);

      await p.locator('#pick-bar .btn-secondary').hover();
      await p.waitForTimeout(150);
      await run(p, `${path} hovering the bar @ ${width}`, AA_PLUS);
    }

    // ── The checkout, in order ──────────────────────────────────────────
    await p.goto(BASE + '/order.html', { waitUntil: 'load' });
    await p.waitForSelector('#step-choose:not([hidden])', { timeout: 8000 });
    await settle(p);
    await run(p, `order.html choosing @ ${width}`, AA_PLUS);

    // A dish with its choices open — radio groups, a legend, a note field.
    await p.locator('.dish-card', { hasText: 'Jollof Rice & Protein' })
      .locator('button[data-add]').click();
    await p.waitForTimeout(250);
    await run(p, `order.html with choices open @ ${width}`, AA);

    // An error message attached to a dish.
    await p.locator('.dish-card', { hasText: 'Jollof Rice & Protein' })
      .locator('button[data-add]').click();
    await p.waitForTimeout(250);
    await run(p, `order.html with a choice missing @ ${width}`, AA);

    await p.locator('.dish-card', { hasText: 'White Rice & Stew' })
      .locator('button[data-add]').click();
    await p.waitForTimeout(250);
    await run(p, `order.html with a basket @ ${width}`, AA);

    await p.click('#to-details');
    await p.waitForTimeout(300);
    await run(p, `order.html details @ ${width}`, AA);

    await p.check('input[name=fulfilment][value=delivery]');
    await p.waitForTimeout(250);
    await run(p, `order.html delivery details @ ${width}`, AA);

    // A rejected form, so the error styling is measured too.
    await p.fill('#c-name', 'A');
    await p.click('#place-order');
    await p.waitForTimeout(300);
    await run(p, `order.html with a form error @ ${width}`, AA);

    // Arriving with dishes carried over from the menu pages: the notice that
    // says what came through, and a dish opened because it still needs a
    // choice.
    await p.evaluate(() => localStorage.setItem('nm.picks', JSON.stringify(
      [{ name: 'Beans & Plantain', qty: 2 }, { name: 'Egusi Soup & Swallow', qty: 1 }])));
    await p.goto(BASE + '/order.html', { waitUntil: 'load' });
    await p.waitForSelector('#carried:not([hidden])', { timeout: 8000 });
    await settle(p);
    await run(p, `order.html with dishes carried over @ ${width}`, AA);

    // ── The two states that are not the happy path ──────────────────────
    await q("update settings set accepting_orders = false, pause_reason = 'Swamped — back at 7pm'");
    await p.goto(BASE + '/order.html', { waitUntil: 'load' });
    await p.waitForSelector('#paused:not([hidden])', { timeout: 8000 });
    await run(p, `order.html paused @ ${width}`, AA);
    await q('update settings set accepting_orders = true, pause_reason = null');

    await fetch(BASE + '/__test/api?up=0');
    await p.goto(BASE + '/order.html', { waitUntil: 'load' });
    await p.waitForSelector('#unavailable:not([hidden])', { timeout: 8000 });
    await run(p, `order.html unreachable @ ${width}`, AA);
    await fetch(BASE + '/__test/api?up=1');

    await ctx.close();
  }

  console.log('\ntotal violations: ' + total);
  await b.close();
  await pool.end();
  process.exit(total ? 1 : 0);

  /* The marketing sections arrive on a scroll-driven CSS animation, so
     anything below the fold is mid-animation and partly transparent when axe
     looks at it. Turning animation off drops each one back to its base rule,
     which is the fully visible state. */
  async function settle(p) {
    await p.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
    await p.waitForTimeout(400);
  }

  async function run(p, label, tags) {
    await p.addScriptTag({ content: AXE });
    const res = await p.evaluate((t) => window.axe.run(document, {
      runOnly: { type: 'tag', values: t } }), tags);
    console.log(`\n--- ${label} ---`);
    if (!res.violations.length) { console.log('  clean'); return; }
    for (const v of res.violations) {
      total += v.nodes.length;
      console.log(`  [${v.impact}] ${v.id}: ${v.help}  (${v.nodes.length})`);
      for (const n of v.nodes.slice(0, 3)) {
        console.log('      ' + n.html.slice(0, 160).replace(/\s+/g, ' '));
        if (n.any && n.any[0]) console.log('      -> ' + n.any[0].message);
      }
    }
  }
})().catch(e => { console.error(e); process.exit(2); });
