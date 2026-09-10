/* axe-core over every admin tab, at three widths, including hover states. */
const { chromium } = require('playwright');
const fs = require('fs');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = 'http://127.0.0.1:8199';
const APP  = BASE + '/admin/';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function place() {
  const menu = await (await fetch(BASE + '/__test/menu')).json();
  const j = menu.find(m => m.name.indexOf('Jollof') === 0);
  await fetch(BASE + '/__test/place', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ngozi Bello', phone: '0807' + Math.floor(100000 + Math.random() * 899999),
      fulfilment: 'delivery', address: '4 Aina Obembe Street', notes: 'Extra pepper',
      items: [{ item_id: j.id, quantity: 2, option_ids: [j.opts[1].id], note: 'well done' }]
    })
  });
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  let total = 0;

  for (const width of [1500, 900, 390]) {
    const ctx = await b.newContext({ viewport: { width, height: 950 }, bypassCSP: true });
    const p = await ctx.newPage();
    await p.goto(APP, { waitUntil: 'load' });

    await run(p, `sign in @ ${width}`);

    await p.fill('#email', 'admin@nicemeal.test');
    await p.fill('#password', 'correct-horse');
    await p.click('#signin-submit');
    await p.waitForSelector('#view-app:not([hidden])', { timeout: 8000 });

    await place();
    await p.click('#f-clear');
    await p.waitForTimeout(1200);
    await run(p, `orders @ ${width}`);

    // With one open, so the detail panel and its buttons are in the pass too.
    if (await p.locator('#orders-body tr').count()) {
      await p.locator('#orders-body tr').first().click();
      await p.waitForTimeout(400);
      await run(p, `an order open @ ${width}`);
      await p.locator('#order-detail button[data-cancel]').click();
      await p.waitForTimeout(200);
      await run(p, `cancelling @ ${width}`);
      // Hover the two coloured buttons: a lighter fill under white text is the
      // contrast failure that only shows up under a pointer.
      for (const sel of ['#order-detail .btn--go', '#order-detail .btn--danger']) {
        if (!(await p.locator(sel).count())) continue;
        await p.hover(sel);
        await run(p, `hovering ${sel} @ ${width}`);
      }
    }

    for (const view of ['new', 'menu', 'reports', 'staff']) {
      await p.click(`.tab[data-view="${view}"]`);
      await p.waitForSelector(`#v-${view}:not([hidden])`);
      await p.waitForTimeout(1200);
      await run(p, `${view} @ ${width}`);
    }

    await ctx.close();
  }

  console.log('\ntotal violations: ' + total);
  await b.close();
  process.exit(total ? 1 : 0);

  async function run(p, labelText) {
    await p.addScriptTag({ content: AXE });
    const res = await p.evaluate((tags) => window.axe.run(document, {
      runOnly: { type: 'tag', values: tags } }), TAGS);
    console.log(`\n--- ${labelText} ---`);
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
