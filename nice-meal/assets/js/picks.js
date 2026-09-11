/* Nice Meal — picking dishes from the marketing pages.
 *
 * The homepage and the full menu are static HTML with no keys and no requests,
 * and they stay that way: this file talks to localStorage and nothing else.
 * What it collects is deliberately thin — a dish name and how many — because
 * the static menu is a second copy of the kitchen's menu and the two can drift.
 * They already have: this page lists "Fried chicken / Grilled chicken" where
 * the database's own options are "Fried" and "Grilled".
 *
 * So a pick records WHICH DISH, never which choice and never a price. The
 * checkout loads the real menu from the database and asks the questions there,
 * against options that are certain to be current. A dish that was renamed,
 * withdrawn or sold out in the meantime is reported to the customer at the
 * checkout rather than carried over as a line the kitchen cannot cook.
 *
 * The controls are built here rather than written into both pages' markup:
 * a button that does nothing is worse than no button, so if this script never
 * arrives the menu is simply a menu, which is what it is for.
 */
(function (global) {
  'use strict';

  var doc = global.document;
  var KEY = 'nm.picks';
  var picks = [];
  var live = null;

  /* localStorage throws in a private window and can come back empty after the
     browser clears site data, so every touch is guarded and the page has to be
     correct without it. Losing the list costs a customer the picks, never the
     page. */
  function read() {
    var raw;
    try { raw = global.localStorage.getItem(KEY); } catch (e) { return []; }
    if (!raw) { return []; }
    var saved;
    try { saved = JSON.parse(raw); } catch (e) { return []; }
    if (Object.prototype.toString.call(saved) !== '[object Array]') { return []; }
    var out = [];
    for (var i = 0; i < saved.length; i++) {
      var p = saved[i];
      if (!p || typeof p.name !== 'string') { continue; }
      var qty = Math.max(1, Math.min(50, parseInt(p.qty, 10) || 1));
      out.push({ name: p.name, qty: qty });
    }
    return out;
  }

  function write() {
    try { global.localStorage.setItem(KEY, JSON.stringify(picks)); } catch (e) {}
  }

  function find(name) {
    for (var i = 0; i < picks.length; i++) { if (picks[i].name === name) { return picks[i]; } }
    return null;
  }

  function total() {
    var n = 0;
    for (var i = 0; i < picks.length; i++) { n += picks[i].qty; }
    return n;
  }

  function say(msg) { if (live) { live.textContent = msg; } }

  function elt(tag, cls, text) {
    var el = doc.createElement(tag);
    if (cls) { el.className = cls; }
    if (text !== undefined) { el.textContent = text; }
    return el;
  }

  /* ── The bar ─────────────────────────────────────────────────────────────
     It carries a count and no money. The static prices on these pages are the
     ones the copywriter typed; the ones the customer pays come from the
     database at the checkout. Quoting a running total here would be quoting
     the wrong source, and the customer would notice at exactly the wrong
     moment. */
  var bar = null;
  var countEl = null;

  function buildBar() {
    // An <aside> around it, because the bar is fixed to the viewport and would
    // otherwise be page content sitting outside every landmark — which is how
    // a screen reader user loses track of it. The region stays in the document
    // even when the bar is empty, so the live region inside it can still
    // announce the pick that empties it.
    var region = elt('aside', 'pick-region');
    region.setAttribute('aria-label', 'Your order so far');

    live = elt('p', 'visually-hidden');
    live.id = 'pick-live';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    region.appendChild(live);

    bar = elt('div', 'pick-bar');
    bar.id = 'pick-bar';
    bar.hidden = true;

    var inner = elt('div', 'pick-bar-inner');
    var sum = elt('p', 'pick-bar-sum');
    countEl = elt('strong', null, '');
    countEl.id = 'pick-count';
    sum.appendChild(countEl);
    sum.appendChild(elt('span', null, 'Prices and choices come next — nothing is paid online'));
    inner.appendChild(sum);

    var actions = elt('div', 'pick-bar-actions');
    var clear = elt('button', 'btn-secondary btn-small', 'Clear');
    clear.type = 'button';
    clear.addEventListener('click', function () {
      picks = [];
      write();
      draw();
      say('Your picks were cleared.');
    });
    var go = elt('a', 'btn-primary btn-small', 'Go to checkout');
    go.href = './order.html';
    actions.appendChild(clear);
    actions.appendChild(go);
    inner.appendChild(actions);

    bar.appendChild(inner);
    region.appendChild(bar);
    doc.body.appendChild(region);
  }

  /* ── The control on each dish ────────────────────────────────────────────
     Nothing until it is wanted, then a stepper. Being able to add three and
     not take one back off is the kind of small cruelty that sends people to
     the phone instead. */
  function buildControl(article) {
    var name = article.getAttribute('data-dish');
    var box = elt('div', 'pick-add');

    var add = elt('button', 'pick-add-btn', 'Add to order');
    add.type = 'button';
    add.setAttribute('aria-label', 'Add ' + name + ' to your order');
    add.addEventListener('click', function () { bump(name, 1); });

    var step = elt('div', 'pick-step');
    step.hidden = true;

    var minus = elt('button', 'pick-step-btn', '−');
    minus.type = 'button';
    minus.setAttribute('aria-label', 'One fewer ' + name);
    minus.addEventListener('click', function () { bump(name, -1); });

    var qty = elt('span', 'pick-qty', '0');

    var plus = elt('button', 'pick-step-btn', '+');
    plus.type = 'button';
    plus.setAttribute('aria-label', 'One more ' + name);
    plus.addEventListener('click', function () { bump(name, 1); });

    step.appendChild(minus);
    step.appendChild(qty);
    step.appendChild(plus);

    box.appendChild(add);
    box.appendChild(step);
    box.appendChild(elt('span', 'pick-said', 'In your order'));

    // The homepage card keeps its controls inside the block that sits above
    // the photo scrim; the menu row is a grid, so the control is its own row.
    var host = article.querySelector('.menu-card-content') || article;
    host.appendChild(box);
    return box;
  }

  function bump(name, by) {
    var p = find(name);
    if (!p && by > 0) {
      p = { name: name, qty: 0 };
      picks.push(p);
    }
    if (!p) { return; }
    p.qty = Math.max(0, Math.min(50, p.qty + by));
    if (p.qty === 0) { picks.splice(picks.indexOf(p), 1); }
    write();
    draw();

    var n = p.qty;
    say(n === 0 ? name + ' removed.' : name + ' — ' + n + ' in your order.');

    // Keep the pressed control under the finger: when a dish drops to nothing
    // its stepper is put away, so focus has to land on the button replacing it.
    var art = doc.querySelector('[data-dish="' + cssEscape(name) + '"]');
    if (n === 0 && art) {
      var btn = art.querySelector('.pick-add-btn');
      if (btn && doc.activeElement && art.contains(doc.activeElement)) { btn.focus(); }
    }
  }

  function cssEscape(s) { return s.replace(/"/g, '\\"'); }

  function draw() {
    var n = total();
    if (bar) {
      bar.hidden = n === 0;
      doc.body.classList.toggle('has-picks', n > 0);
      countEl.textContent = n + (n === 1 ? ' dish' : ' dishes') + ' picked';
    }
    var boxes = doc.querySelectorAll('[data-dish] .pick-add');
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      var p = find(box.closest('[data-dish]').getAttribute('data-dish'));
      var qty = p ? p.qty : 0;
      box.querySelector('.pick-add-btn').hidden = qty > 0;
      box.querySelector('.pick-step').hidden = qty === 0;
      box.querySelector('.pick-said').hidden = qty === 0;
      box.querySelector('.pick-qty').textContent = qty;
    }
  }

  function start() {
    var dishes = doc.querySelectorAll('[data-dish]');
    if (!dishes.length) { return; }
    picks = read();
    buildBar();
    for (var i = 0; i < dishes.length; i++) { buildControl(dishes[i]); }
    draw();
  }

  if (doc.readyState === 'loading') { doc.addEventListener('DOMContentLoaded', start); }
  else { start(); }
})(window);
