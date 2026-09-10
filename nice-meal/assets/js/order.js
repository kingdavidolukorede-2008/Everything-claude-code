/* Nice Meal — ordering from the website.
 *
 * Three steps: choose, details, done. Loaded only by order.html, which is the
 * one page on this site that talks to a server — the marketing pages and the
 * menu stay static and work with no database at all.
 *
 * The shape of this file is set by two facts about the customer:
 *
 * They are on a phone, on Nigerian mobile data, and every round trip costs
 * them. So the whole menu, the delivery areas and the shop settings arrive in
 * one call, and nothing else is fetched until they place the order.
 *
 * They have another way to order. If anything here fails — the database is
 * unreachable, ordering is paused, the browser is too old — the page must put
 * the restaurant's phone number in front of them rather than becoming a dead
 * end. A checkout that fails silently loses the sale twice: once now, and
 * again when they decide the place looks broken.
 */
(function (global) {
  'use strict';

  var cfg = global.NM_CONFIG || {};
  var naira = global.NM.naira;

  var STORE_KEY = 'nm.orders';
  var $ = function (id) { return document.getElementById(id); };

  function elt(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text !== undefined && text !== null) { n.textContent = String(text); }
    return n;
  }

  function say(msg) { $('live').textContent = msg; }

  /* Every dish name, description and option comes from the database. It is the
     restaurant's own copy, but it is still built into the page with
     textContent throughout — the day someone types an apostrophe into a dish
     name should be uneventful. */

  var shop = null;
  var basket = [];
  var lastOrder = null;

  /* ── Money ──────────────────────────────────────────────────────────────*/

  function subtotal() {
    var t = 0;
    for (var i = 0; i < basket.length; i++) { t += basket[i].unitKobo * basket[i].qty; }
    return t;
  }

  function chosenArea() {
    var sel = $('c-area');
    if (!sel || !sel.value) { return null; }
    for (var i = 0; i < shop.areas.length; i++) {
      if (shop.areas[i].id === sel.value) { return shop.areas[i]; }
    }
    return null;
  }

  /* The same rule place_order() applies, so the figure on screen and the figure
     saved agree. The saved one is still the one that counts: it is read back
     from the database and shown on the confirmation. */
  function deliveryFee() {
    if (fulfilment() !== 'delivery') { return 0; }
    var area = chosenArea();
    if (!area) { return 0; }
    var threshold = shop.settings.free_delivery_threshold_kobo;
    if (threshold && subtotal() >= threshold) { return 0; }
    return area.fee_kobo || 0;
  }

  function fulfilment() {
    var picked = document.querySelector('input[name=fulfilment]:checked');
    return picked ? picked.value : 'pickup';
  }

  /* ── Step 1: the menu ───────────────────────────────────────────────────*/

  function drawMenu() {
    var box = $('dishes');
    box.textContent = '';
    var cats = shop.categories || [];
    for (var c = 0; c < cats.length; c++) {
      if (!cats[c].items.length) { continue; }
      var course = elt('div', 'course');
      course.appendChild(elt('h4', 'course-name', cats[c].name));
      for (var i = 0; i < cats[c].items.length; i++) {
        course.appendChild(dishCard(cats[c].items[i]));
      }
      box.appendChild(course);
    }
  }

  function dishCard(item) {
    var card = elt('div', 'dish-card' + (item.is_available ? '' : ' is-out'));
    card.setAttribute('data-item', item.id);

    var top = elt('div', 'dish-top');
    top.appendChild(elt('h5', 'dish-name', item.name));
    if (!item.is_available) { top.appendChild(elt('span', 'out-tag', 'Sold out today')); }
    top.appendChild(elt('span', 'dish-price', naira(item.price_kobo)));
    card.appendChild(top);

    if (item.description) { card.appendChild(elt('p', 'dish-desc', item.description)); }

    var hasChoices = item.groups.length > 0;

    if (hasChoices) {
      var opts = elt('div', 'dish-options');
      opts.hidden = true;
      for (var g = 0; g < item.groups.length; g++) {
        opts.appendChild(optionGroup(item.groups[g], item.id));
      }
      var noteLab = elt('label', 'fld dish-note-field');
      noteLab.appendChild(elt('span', 'fld-label', 'Anything special about this dish?'));
      var note = elt('input');
      note.type = 'text'; note.maxLength = 200; note.className = 'js-note';
      note.placeholder = 'Well done, extra pepper…';
      noteLab.appendChild(note);
      opts.appendChild(noteLab);
      card.appendChild(opts);
    }

    var actions = elt('div', 'dish-actions');
    var btn = elt('button', 'btn-secondary btn-small',
      item.is_available ? (hasChoices ? 'Choose' : 'Add to order') : 'Sold out today');
    btn.type = 'button';
    btn.disabled = !item.is_available;
    btn.setAttribute('data-add', item.id);
    actions.appendChild(btn);
    actions.appendChild(elt('span', 'dish-error'));
    card.appendChild(actions);

    return card;
  }

  function optionGroup(group, itemId) {
    // A fieldset and legend rather than a div and a label: these are radio and
    // checkbox groups, and that is the markup that tells a screen reader the
    // question the choices belong to.
    var wrap = elt('fieldset', 'opt-group');
    wrap.setAttribute('data-group', group.id);
    wrap.setAttribute('data-min', group.min_select);
    wrap.setAttribute('data-max', group.max_select);

    var single = group.max_select === 1;
    var legend = elt('legend', 'opt-group-name', group.name + ' ');
    legend.appendChild(elt('span', 'opt-group-note',
      group.min_select > 0
        ? (single ? '(choose one)' : '(choose ' + group.min_select + '–' + group.max_select + ')')
        : '(optional)'));
    wrap.appendChild(legend);

    var list = elt('div', 'opt-list');
    for (var o = 0; o < group.options.length; o++) {
      var opt = group.options[o];
      var lab = elt('label', 'opt' + (opt.is_available ? '' : ' is-out'));
      var input = elt('input');
      input.type = single ? 'radio' : 'checkbox';
      input.name = 'g' + group.id + '-' + itemId;
      input.value = opt.id;
      input.disabled = !opt.is_available;
      input.setAttribute('data-name', opt.name);
      input.setAttribute('data-delta', opt.price_delta_kobo);
      lab.appendChild(input);
      lab.appendChild(document.createTextNode(opt.name));
      if (opt.price_delta_kobo) {
        lab.appendChild(elt('span', 'opt-delta', ' +' + naira(opt.price_delta_kobo)));
      }
      if (!opt.is_available) { lab.appendChild(document.createTextNode(' — off today')); }
      list.appendChild(lab);
    }
    wrap.appendChild(list);
    return wrap;
  }

  function findItem(id) {
    for (var c = 0; c < shop.categories.length; c++) {
      var items = shop.categories[c].items;
      for (var i = 0; i < items.length; i++) { if (items[i].id === id) { return items[i]; } }
    }
    return null;
  }

  $('dishes').addEventListener('click', function (ev) {
    var id = ev.target.getAttribute && ev.target.getAttribute('data-add');
    if (!id) { return; }
    var card = ev.target.closest('.dish-card');
    var item = findItem(id);
    if (!item) { return; }
    var opts = card.querySelector('.dish-options');

    // First press on a dish with choices opens them instead of guessing.
    if (opts && opts.hidden) {
      opts.hidden = false;
      card.classList.add('is-open');
      ev.target.textContent = 'Add to order';
      var first = opts.querySelector('input:not([disabled])');
      if (first) { first.focus(); }
      return;
    }
    addToBasket(card, item);
  });

  function addToBasket(card, item) {
    var errBox = card.querySelector('.dish-error');
    errBox.textContent = '';

    var chosen = [];
    var groups = card.querySelectorAll('.opt-group');
    for (var g = 0; g < groups.length; g++) {
      var grp = groups[g];
      var checked = grp.querySelectorAll('input:checked');
      var min = Number(grp.getAttribute('data-min'));
      var max = Number(grp.getAttribute('data-max'));
      if (checked.length < min || checked.length > max) {
        // place_order() refuses this too and would reject the whole order at
        // the last step. Asking here means the question gets answered while
        // the customer is still looking at the dish.
        var name = grp.querySelector('legend').textContent.replace(/\s*\((choose|optional)[^)]*\)\s*$/, '');
        errBox.textContent = min === max
          ? 'Please choose ' + min + ' for "' + name.trim() + '".'
          : 'Please choose between ' + min + ' and ' + max + ' for "' + name.trim() + '".';
        var firstInput = grp.querySelector('input:not([disabled])');
        if (firstInput) { firstInput.focus(); }
        return;
      }
      for (var k = 0; k < checked.length; k++) {
        chosen.push({
          id: checked[k].value,
          name: checked[k].getAttribute('data-name'),
          delta: Number(checked[k].getAttribute('data-delta')) || 0
        });
      }
    }

    var noteEl = card.querySelector('.js-note');
    var note = noteEl ? noteEl.value.replace(/^\s+|\s+$/g, '') : '';
    var delta = 0;
    for (var d = 0; d < chosen.length; d++) { delta += chosen[d].delta; }

    var ids = [];
    for (var n = 0; n < chosen.length; n++) { ids.push(chosen[n].id); }
    var key = item.id + '|' + ids.slice().sort().join(',') + '|' + note;

    // Ordering the same thing twice bumps the quantity rather than adding a
    // second identical line, which is what the kitchen would rather read.
    var existing = null;
    for (var b = 0; b < basket.length; b++) { if (basket[b].key === key) { existing = basket[b]; } }
    if (existing) { existing.qty = Math.min(50, existing.qty + 1); }
    else {
      basket.push({
        key: key, itemId: item.id, name: item.name, qty: 1,
        options: chosen, note: note, unitKobo: item.price_kobo + delta
      });
    }

    // Put the card back to how it was found.
    var opts = card.querySelector('.dish-options');
    if (opts) {
      opts.hidden = true;
      card.classList.remove('is-open');
      card.querySelector('[data-add]').textContent = 'Choose';
      var inputs = opts.querySelectorAll('input[type=radio], input[type=checkbox]');
      for (var q = 0; q < inputs.length; q++) { inputs[q].checked = false; }
      if (noteEl) { noteEl.value = ''; }
    }

    say(item.name + ' added. ' + basket.length + (basket.length === 1 ? ' item' : ' items') + ' in your order.');
    drawBasket();
  }

  function drawBasket() {
    var list = $('basket');
    list.textContent = '';
    for (var i = 0; i < basket.length; i++) {
      var b = basket[i];
      var li = elt('li', 'basket-line');

      var body = elt('div', 'basket-body');
      body.appendChild(elt('span', 'basket-name', b.name));
      if (b.options.length) {
        var names = [];
        for (var j = 0; j < b.options.length; j++) { names.push(b.options[j].name); }
        body.appendChild(elt('span', 'basket-opts', names.join(' · ')));
      }
      if (b.note) { body.appendChild(elt('span', 'basket-note', b.note)); }

      var controls = elt('div', 'qty-controls');
      var minus = elt('button', 'qty-btn', '−');
      minus.type = 'button';
      minus.setAttribute('data-less', String(i));
      minus.setAttribute('aria-label', 'One fewer ' + b.name);
      var count = elt('span', 'qty-count', b.qty);
      var plus = elt('button', 'qty-btn', '+');
      plus.type = 'button';
      plus.setAttribute('data-more', String(i));
      plus.setAttribute('aria-label', 'One more ' + b.name);
      controls.appendChild(minus);
      controls.appendChild(count);
      controls.appendChild(plus);
      body.appendChild(controls);

      li.appendChild(body);
      li.appendChild(elt('span', 'basket-money', naira(b.unitKobo * b.qty)));
      list.appendChild(li);
    }

    $('basket-empty').hidden = basket.length > 0;
    drawTotals();
  }

  function drawTotals() {
    var sub = subtotal();
    var fee = deliveryFee();
    var min = (shop && shop.settings.min_order_kobo) || 0;
    var under = min > 0 && sub > 0 && sub < min;

    $('sum-subtotal').textContent = naira(sub);
    $('sum-total').textContent = naira(sub + fee);
    $('d-subtotal').textContent = naira(sub);
    $('d-fee').textContent = fee ? naira(fee) : 'Free';
    $('d-fee-row').hidden = fulfilment() !== 'delivery';
    $('d-total').textContent = naira(sub + fee);

    var warn = $('min-warning');
    if (under) {
      warn.textContent = 'Orders start at ' + naira(min) + '. Add '
        + naira(min - sub) + ' more to continue.';
      warn.hidden = false;
    } else {
      warn.hidden = true;
    }

    $('to-details').disabled = basket.length === 0 || under;

    var bar = $('cart-bar');
    if (basket.length) {
      var count = 0;
      for (var i = 0; i < basket.length; i++) { count += basket[i].qty; }
      $('cart-bar-sum').textContent = count + (count === 1 ? ' item · ' : ' items · ') + naira(sub + fee);
      bar.hidden = false;
    } else {
      bar.hidden = true;
    }
  }

  $('basket').addEventListener('click', function (ev) {
    var less = ev.target.getAttribute && ev.target.getAttribute('data-less');
    var more = ev.target.getAttribute && ev.target.getAttribute('data-more');
    if (less !== null && less !== undefined) {
      var i = Number(less);
      basket[i].qty -= 1;
      if (basket[i].qty < 1) {
        say(basket[i].name + ' removed.');
        basket.splice(i, 1);
      }
      drawBasket();
    } else if (more !== null && more !== undefined) {
      var j = Number(more);
      basket[j].qty = Math.min(50, basket[j].qty + 1);
      drawBasket();
    }
  });

  /* ── Steps ──────────────────────────────────────────────────────────────*/

  function showStep(name) {
    $('step-choose').hidden = name !== 'choose';
    $('step-details').hidden = name !== 'details';
    $('step-done').hidden = name !== 'done';
    $('cart-bar').hidden = name !== 'choose' || basket.length === 0;
    if (name !== 'choose') { global.scrollTo(0, 0); }
  }

  $('to-details').addEventListener('click', function () {
    showStep('details');
    drawTotals();
    $('c-name').focus();
    say('Step two: where your order is going.');
  });
  $('cart-bar-go').addEventListener('click', function () {
    if ($('to-details').disabled) {
      $('basket-panel').scrollIntoView({ block: 'start' });
      return;
    }
    showStep('details');
    drawTotals();
    $('c-name').focus();
  });
  $('back-to-choose').addEventListener('click', function () {
    showStep('choose');
    say('Back to the menu.');
  });

  $('step-details').addEventListener('change', function (ev) {
    if (ev.target.name === 'fulfilment') {
      $('delivery-fields').hidden = fulfilment() !== 'delivery';
    }
    drawTotals();
  });

  /* ── Placing it ─────────────────────────────────────────────────────────*/

  // The same rule the database applies, so the message comes back in the
  // customer's own words rather than as a constraint violation.
  var PHONE_OK = /^\+?[0-9][0-9 ()-]{6,19}$/;

  function fail(msg, field) {
    var box = $('details-error');
    box.textContent = msg;
    box.hidden = false;
    if (field) { field.classList.add('is-wrong'); field.focus(); }
    say(msg);
  }

  $('step-details').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var box = $('details-error');
    box.hidden = true;
    var wrong = document.querySelectorAll('.is-wrong');
    for (var w = 0; w < wrong.length; w++) { wrong[w].classList.remove('is-wrong'); }

    var name = $('c-name').value.replace(/^\s+|\s+$/g, '');
    var phone = $('c-phone').value.replace(/^\s+|\s+$/g, '');
    var how = fulfilment();
    var address = $('c-address').value.replace(/^\s+|\s+$/g, '');

    if (name.length < 2) { return fail('Please tell us your name.', $('c-name')); }
    if (!PHONE_OK.test(phone)) {
      return fail('That phone number does not look right. We need it to confirm your order.', $('c-phone'));
    }
    if (how === 'delivery') {
      if (!$('c-area').value) { return fail('Please choose the area we are delivering to.', $('c-area')); }
      if (address.length < 4) { return fail('Please give us a street address.', $('c-address')); }
    }
    if (!basket.length) { return fail('Your order is empty.'); }

    var items = [];
    for (var i = 0; i < basket.length; i++) {
      var b = basket[i];
      var ids = [];
      for (var j = 0; j < b.options.length; j++) { ids.push(b.options[j].id); }
      items.push({ item_id: b.itemId, quantity: b.qty, option_ids: ids, note: b.note || null });
    }

    var btn = $('place-order');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    client.rpc('place_order', {
      p_customer_name: name,
      p_customer_phone: phone,
      p_fulfilment: how,
      p_items: items,
      p_delivery_area_id: how === 'delivery' ? $('c-area').value : null,
      p_address: how === 'delivery' ? address : null,
      p_notes: $('c-notes').value || null
    }).then(function (out) {
      remember(out);
      lastOrder = out;
      showDone(out, how, name, phone);
      basket = [];
      drawBasket();
    }).catch(function (err) {
      // Postgres RAISE messages are already written for a customer: "Egusi
      // Soup & Swallow is sold out.", "Minimum order is ₦2000."
      fail(err.message || 'We could not send that. Please try again, or call us.');
    }).then(function () {
      btn.disabled = false;
      btn.textContent = 'Place order';
    });
  });

  function showDone(out, how, name, phone) {
    $('done-code').textContent = out.code;

    var when = how === 'delivery' ? 'be with you' : 'be ready';
    $('done-summary').textContent =
      naira(out.total_kobo) + ' to pay ' +
      (how === 'delivery' ? 'when it arrives' : 'when you collect it') +
      '. It should ' + when + ' in about ' + (out.prep_time_minutes || 30) + ' minutes.';

    $('done-call').textContent = 'We will call ' + phone + ' to confirm.';
    $('track-status').textContent = 'Status: with the kitchen';
    showStep('done');
    say('Order ' + out.code + ' placed.');
    drawRecent();
  }

  /* ── Remembering an order on this device ────────────────────────────────
     No account, no email link. The code alone is guessable — they are
     sequential — so get_order_status() needs the code and the random token
     that came back with it. Keeping the pair here is what lets somebody ask
     "where is my food" from the same phone they ordered on. */

  function readStored() {
    try {
      var raw = global.localStorage.getItem(STORE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Object.prototype.toString.call(list) === '[object Array]' ? list : [];
    } catch (e) { return []; }
  }

  function remember(out) {
    try {
      var list = readStored();
      list.unshift({ code: out.code, token: out.track_token, at: out.placed_at, total: out.total_kobo });
      global.localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(0, 5)));
    } catch (e) { /* private mode; the confirmation on screen still stands */ }
  }

  var STATE_WORDS = {
    'new': 'With the kitchen', preparing: 'Being cooked', ready: 'Ready',
    completed: 'Completed', cancelled: 'Cancelled'
  };

  function drawRecent() {
    var list = readStored();
    var box = $('recent-list');
    box.textContent = '';
    if (!list.length) { $('recent').hidden = true; return; }

    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      var li = elt('li', 'recent-item');
      li.appendChild(elt('span', 'recent-code', o.code));
      li.appendChild(elt('span', 'recent-total', naira(o.total)));
      var state = elt('span', 'recent-state');
      var pill = elt('span', 'state-pill', 'Checking…');
      pill.setAttribute('data-code', o.code);
      state.appendChild(pill);
      li.appendChild(state);
      box.appendChild(li);
      checkOne(o, pill);
    }
    $('recent').hidden = false;
  }

  function checkOne(order, pill) {
    client.rpc('get_order_status', { p_code: order.code, p_token: order.token })
      .then(function (out) {
        if (!out) { pill.textContent = 'Not found'; return; }
        pill.textContent = STATE_WORDS[out.status] || out.status;
        pill.className = 'state-pill state-pill--' + out.status;
      })
      .catch(function () { pill.textContent = 'Unknown'; });
  }

  $('track-refresh').addEventListener('click', function () {
    if (!lastOrder) { return; }
    var btn = $('track-refresh');
    btn.disabled = true;
    client.rpc('get_order_status', { p_code: lastOrder.code, p_token: lastOrder.track_token })
      .then(function (out) {
        var word = out ? (STATE_WORDS[out.status] || out.status) : 'Not found';
        $('track-status').textContent = 'Status: ' + word.toLowerCase();
        say('Status: ' + word);
      })
      .catch(function () {
        $('track-status').textContent = 'Could not check just now.';
      })
      .then(function () { btn.disabled = false; });
    drawRecent();
  });

  /* ── Boot ───────────────────────────────────────────────────────────────*/

  var client = null;

  function unavailable() {
    $('loading').hidden = true;
    $('unavailable').hidden = false;
    $('step-choose').hidden = true;
  }

  function applyPhone() {
    if (!cfg.PHONE) { return; }
    var tel = 'tel:' + (cfg.PHONE_TEL || cfg.PHONE.replace(/\s/g, ''));
    var links = [$('fallback-call'), $('paused-call')];
    for (var i = 0; i < links.length; i++) {
      if (!links[i]) { continue; }
      links[i].href = tel;
      links[i].textContent = 'Call ' + cfg.PHONE;
    }
  }

  var yearEl = $('year');
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }
  applyPhone();

  if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf('YOUR-PROJECT-REF') !== -1) {
    // Not configured yet. To a customer that is indistinguishable from an
    // outage, and the answer is the same one: the telephone.
    unavailable();
    return;
  }

  client = new global.NM.Client(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  client.rpc('public_menu', {}).then(function (out) {
    shop = out;
    $('loading').hidden = true;

    if (!shop.settings || shop.settings.accepting_orders === false) {
      $('paused').hidden = false;
      $('paused-reason').textContent = (shop.settings && shop.settings.pause_reason)
        ? shop.settings.pause_reason
        : 'We are not taking online orders at the moment.';
      drawRecent();
      return;
    }

    var sel = $('c-area');
    for (var a = 0; a < shop.areas.length; a++) {
      var opt = elt('option', null, shop.areas[a].fee_kobo
        ? shop.areas[a].name + ' — ' + naira(shop.areas[a].fee_kobo)
        : shop.areas[a].name + ' — free delivery');
      opt.value = shop.areas[a].id;
      sel.appendChild(opt);
    }

    drawMenu();
    drawBasket();
    drawRecent();
    $('step-choose').hidden = false;
  }).catch(function () {
    unavailable();
  });
}(window));
