/* axe-core over the kitchen dashboard, in both states it is ever seen in. */
const { chromium } = require('playwright');
const fs = require('fs');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = 'http://127.0.0.1:8199';

async function place() {
  const menu = await (await fetch(BASE + '/__test/menu')).json();
  const j = menu.find(m => m.name.indexOf('Jollof') === 0);
  await fetch(BASE + '/__test/place', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ngozi Bello', phone: '08059' + Math.floor(Math.random() * 99999),
      fulfilment: 'delivery', address: '4 Aina Obembe Street', notes: 'Extra pepper, no onions',
      items: [{ item_id: j.id, quantity: 3, option_ids: [j.opts[1].id], note: 'well done' }]
    })
  });
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  let total = 0;
  for (const width of [1400, 900, 390]) {
    const ctx = await b.newContext({ viewport: { width, height: 900 }, bypassCSP: true });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'load' });

    // 1. the sign-in screen
    await p.addScriptTag({ content: AXE });
    let r = await p.evaluate(() => window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
    report(`sign in @ ${width}`, r);

    // 2. the board, with a ticket on it and the cancel sheet open
    await p.fill('#email', 'kitchen@nicemeal.test');
    await p.fill('#password', 'correct-horse');
    await p.click('#signin-submit');
    await p.waitForSelector('#view-board:not([hidden])');
    await place();
    await p.waitForSelector('.ticket', { timeout: 6000 });
    await p.addScriptTag({ content: AXE });
    r = await p.evaluate(() => window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
    report(`board @ ${width}`, r);

    // 3. hover states, one button at a time. A hover that lightens a coloured
    // fill under white text loses contrast, and it will not show up above
    // unless the pointer happens to be resting on the right control.
    for (const sel of ['.ticket .btn--go', '.ticket .btn--quiet', '.ticket .btn--ghost',
                       '#sound-test', '#signout']) {
      if (!(await p.locator(sel).count())) continue;
      await p.hover(sel);
      await p.addScriptTag({ content: AXE });
      r = await p.evaluate(() => window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
      report(`hovering ${sel} @ ${width}`, r);
    }

    // 4. the cancel sheet
    await p.click('.ticket button[data-act="cancel"]');
    await p.waitForSelector('#cancel-overlay:not([hidden])');
    await p.addScriptTag({ content: AXE });
    r = await p.evaluate(() => window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
    report(`cancel sheet @ ${width}`, r);

    await p.hover('#cancel-confirm');
    await p.addScriptTag({ content: AXE });
    r = await p.evaluate(() => window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
    report(`hovering the cancel button @ ${width}`, r);

    await ctx.close();
  }
  console.log('\ntotal violations: ' + total);
  await b.close();
  process.exit(total ? 1 : 0);

  function report(label, res) {
    console.log(`\n--- ${label} ---`);
    if (!res.violations.length) { console.log('  clean'); return; }
    for (const v of res.violations) {
      total += v.nodes.length;
      console.log(`  [${v.impact}] ${v.id}: ${v.help}  (${v.nodes.length})`);
      for (const n of v.nodes.slice(0, 3)) {
        console.log('      ' + n.html.slice(0, 150).replace(/\s+/g, ' '));
        if (n.any && n.any[0]) console.log('      -> ' + n.any[0].message);
      }
    }
  }
})().catch(e => { console.error(e); process.exit(2); });
