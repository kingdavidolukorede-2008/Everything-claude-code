/* Nice Meal — admin: the orders list, one order in detail, and taking an
   order over the counter or the phone. */
(function (global) {
  'use strict';

  var A = global.NM.admin;
  var el = A.el, elt = A.elt, naira = A.naira;

  /* ════════════════════════════════════════════════════════════════════════
     Orders
     ═══════════════════════════════════════════════════════════════════════*/

  var page = { limit: 25, offset: 0, total: 0 };
  var rows = [];
  var picked = null;

  function filters() {
    var status = el('f-status').value;
    return {
      p_from:   el('f-from').value || null,
      p_to:     el('f-to').value || null,
      p_status: status ? [status] : null,
      p_search: el('f-search').value || null,
      p_limit:  page.limit,
      p_offset: page.offset
    };
  }

  function loadOrders() {
    return A.call('admin_orders', filters()).then(function (out) {
      rows = (out && out.rows) || [];
      page.total = (out && out.total) || 0;
      drawTable();
      // The order that was open may have moved off the page; only keep the
      // detail panel if it is still one of the rows in front of us.
      if (picked && !byId(picked)) { picked = null; drawDetail(null); }
      else if (picked) { drawDetail(byId(picked)); }
    }).catch(function (err) { A.fail(err.message); });
  }

  function byId(id) {
    for (var i = 0; i < rows.length; i++) { if (rows[i].id === id) { return rows[i]; } }
    return null;
  }

  function drawTable() {
    var body = el('orders-body');
    body.textContent = '';
    for (var i = 0; i < rows.length; i++) {
      var o = rows[i];
      var tr = elt('tr');
      tr.setAttribute('data-id', o.id);
      tr.tabIndex = 0;
      if (o.id === picked) { tr.className = 'is-picked'; }

      tr.appendChild(elt('td', 'code', o.code));
      tr.appendChild(elt('td', null, A.whenText(o.placed_at)));

      var who = elt('td');
      who.appendChild(elt('div', null, o.customer_name));
      who.appendChild(elt('div', 'muted small', o.customer_phone));
      tr.appendChild(who);

      var type = elt('td');
      type.appendChild(elt('div', null, A.label('fulfilment', o.fulfilment)));
      type.appendChild(elt('div', 'muted small', A.label('channel', o.channel)));
      tr.appendChild(type);

      var st = elt('td');
      st.appendChild(elt('span', 'status status--' + o.status, A.label('status', o.status)));
      tr.appendChild(st);

      tr.appendChild(elt('td', 'num', naira(o.total_kobo)));
      body.appendChild(tr);
    }

    el('orders-empty').hidden = rows.length > 0;
    var from = page.total ? page.offset + 1 : 0;
    var to = Math.min(page.offset + page.limit, page.total);
    el('page-label').textContent = page.total
      ? 'Showing ' + from + '–' + to + ' of ' + page.total
      : '';
    el('orders-count').textContent = page.total
      ? page.total + (page.total === 1 ? ' order' : ' orders')
      : '';
    el('page-prev').disabled = page.offset <= 0;
    el('page-next').disabled = page.offset + page.limit >= page.total;
  }

  var NEXT = { 'new': 'preparing', preparing: 'ready', ready: 'completed' };
  var NEXT_LABEL = { 'new': 'Start cooking', preparing: 'Mark ready', ready: 'Mark handed over' };

  function drawDetail(o) {
    var box = el('order-detail');
    box.textContent = '';
    if (!o) {
      box.appendChild(elt('p', 'empty',
        'Pick an order to see the address, the lines and the money.'));
      return;
    }

    var head = elt('div');
    head.appendChild(elt('h3', null, o.code));
    head.appendChild(elt('span', 'status status--' + o.status, A.label('status', o.status)));
    box.appendChild(head);

    var dl = elt('dl');
    function pair(k, v) {
      if (v === null || v === undefined || v === '') { return; }
      dl.appendChild(elt('dt', null, k));
      dl.appendChild(elt('dd', null, v));
    }
    pair('Placed', A.whenText(o.placed_at));
    pair('Arrived by', A.label('channel', o.channel));
    pair('Customer', o.customer_name);
    pair('Phone', o.customer_phone);
    pair('Leaving as', A.label('fulfilment', o.fulfilment));
    pair('Area', o.area);
    pair('Address', o.address);
    if (o.acknowledged_by) { pair('Taken by', o.acknowledged_by); }
    if (o.ready_at)     { pair('Ready at', A.whenText(o.ready_at)); }
    if (o.completed_at) { pair('Completed', A.whenText(o.completed_at)); }
    if (o.cancelled_at) { pair('Cancelled', A.whenText(o.cancelled_at)); }
    if (o.cancel_reason){ pair('Reason', o.cancel_reason); }
    box.appendChild(dl);

    if (o.notes) {
      var note = elt('p', 'note-block');
      note.appendChild(elt('strong', null, 'Note: '));
      note.appendChild(document.createTextNode(o.notes));
      box.appendChild(note);
    }

    var list = elt('ul', 'lines');
    var items = o.items || [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var li = elt('li');
      li.appendChild(elt('span', 'qty', '×' + it.quantity));
      var mid = elt('div', 'line-body');
      mid.appendChild(elt('span', 'dish', it.name));
      var opts = it.options || [];
      if (opts.length) {
        var names = [];
        for (var j = 0; j < opts.length; j++) {
          names.push(typeof opts[j] === 'string' ? opts[j] : opts[j].name);
        }
        mid.appendChild(elt('span', 'opts', names.join(' · ')));
      }
      if (it.note) { mid.appendChild(elt('div', 'muted small', it.note)); }
      li.appendChild(mid);
      li.appendChild(elt('span', 'line-money', naira(it.line_kobo)));
      list.appendChild(li);
    }
    box.appendChild(list);

    var money = elt('div');
    var sub = elt('p', 'total-line');
    sub.appendChild(elt('span', null, 'Subtotal'));
    sub.appendChild(elt('span', null, naira(o.subtotal_kobo)));
    money.appendChild(sub);
    if (o.delivery_fee_kobo) {
      var fee = elt('p', 'total-line');
      fee.appendChild(elt('span', null, 'Delivery'));
      fee.appendChild(elt('span', null, naira(o.delivery_fee_kobo)));
      money.appendChild(fee);
    }
    var tot = elt('p', 'total-line total-line--big');
    tot.appendChild(elt('span', null, 'Total'));
    tot.appendChild(elt('span', null, naira(o.total_kobo)));
    money.appendChild(tot);
    box.appendChild(money);

    // Finished orders are final: set_order_status refuses to reopen one, so
    // there is nothing to offer here but a record of what happened.
    if (o.status !== 'completed' && o.status !== 'cancelled') {
      var actions = elt('div', 'actions');
      if (NEXT[o.status]) {
        var go = elt('button', 'btn btn--go btn--sm', NEXT_LABEL[o.status]);
        go.type = 'button';
        go.setAttribute('data-advance', NEXT[o.status]);
        actions.appendChild(go);
      }
      var cancel = elt('button', 'btn btn--quiet btn--sm', 'Cancel order');
      cancel.type = 'button';
      cancel.setAttribute('data-cancel', '1');
      actions.appendChild(cancel);
      box.appendChild(actions);

      var reason = elt('div');
      reason.hidden = true;
      reason.id = 'cancel-box';
      var lab = elt('label', 'field');
      lab.appendChild(elt('span', 'field-label',
        'Why? The customer will be told this, and the database requires it.'));
      var input = elt('input');
      input.type = 'text'; input.id = 'cancel-why'; input.maxLength = 200;
      lab.appendChild(input);
      reason.appendChild(lab);
      var confirm = elt('button', 'btn btn--danger btn--sm', 'Cancel this order');
      confirm.type = 'button';
      confirm.setAttribute('data-cancel-confirm', '1');
      reason.appendChild(confirm);
      box.appendChild(reason);
    }
  }

  function advance(id, status, reason) {
    return A.call('set_order_status', {
      p_order_id: id, p_status: status, p_cancel_reason: reason || null
    }).then(function () {
      A.toast('Order updated.');
      return loadOrders();
    }).catch(function (err) { A.fail(err.message); });
  }

  /* ── Wiring ─────────────────────────────────────────────────────────────*/

  el('orders-body').addEventListener('click', function (ev) {
    var tr = ev.target.closest ? ev.target.closest('tr[data-id]') : null;
    if (!tr) { return; }
    picked = tr.getAttribute('data-id');
    A.clearConfirm();
    drawTable();
    drawDetail(byId(picked));
  });
  // The rows are focusable, so they have to work from the keyboard too.
  el('orders-body').addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter' && ev.key !== ' ') { return; }
    var tr = ev.target.closest ? ev.target.closest('tr[data-id]') : null;
    if (!tr) { return; }
    ev.preventDefault();
    picked = tr.getAttribute('data-id');
    A.clearConfirm();
    drawTable();
    drawDetail(byId(picked));
  });

  el('order-detail').addEventListener('click', function (ev) {
    var t = ev.target;
    if (t.getAttribute && (t.getAttribute('data-advance') || t.getAttribute('data-cancel')
        || t.getAttribute('data-cancel-confirm'))) { A.begin(); }
    if (t.getAttribute && t.getAttribute('data-advance')) {
      var status = t.getAttribute('data-advance');
      // Handing over cannot be walked back, so that one asks twice.
      if (status === 'completed') { A.confirmTap(t, function () { advance(picked, status); }); }
      else { advance(picked, status); }
      return;
    }
    if (t.getAttribute && t.getAttribute('data-cancel')) {
      el('cancel-box').hidden = false;
      el('cancel-why').focus();
      return;
    }
    if (t.getAttribute && t.getAttribute('data-cancel-confirm')) {
      var why = el('cancel-why').value.replace(/^\s+|\s+$/g, '');
      if (!why) { A.fail('Give a reason for the cancellation.'); el('cancel-why').focus(); return; }
      A.confirmTap(t, function () { advance(picked, 'cancelled', why); });
    }
  });

  el('order-filters').addEventListener('submit', function (ev) {
    ev.preventDefault();
    A.begin();
    page.offset = 0;
    loadOrders();
  });
  el('f-today').addEventListener('click', function () {
    A.begin();
    el('f-from').value = A.lagosDay();
    el('f-to').value = A.lagosDay();
    page.offset = 0;
    loadOrders();
  });
  el('f-clear').addEventListener('click', function () {
    A.begin();
    el('f-from').value = ''; el('f-to').value = '';
    el('f-status').value = ''; el('f-search').value = '';
    page.offset = 0;
    loadOrders();
  });
  el('page-prev').addEventListener('click', function () {
    page.offset = Math.max(0, page.offset - page.limit);
    loadOrders();
  });
  el('page-next').addEventListener('click', function () {
    if (page.offset + page.limit < page.total) { page.offset += page.limit; loadOrders(); }
  });

  A.views.orders = {
    enter: function () {
      if (!el('f-from').value && !el('f-to').value && !el('f-search').value) {
        el('f-from').value = A.daysAgo(7);
        el('f-to').value = A.lagosDay();
      }
      loadOrders();
    },
    refresh: loadOrders
  };

  /* ════════════════════════════════════════════════════════════════════════
     Taking an order
     ═══════════════════════════════════════════════════════════════════════*/

  var shop = null;     // the menu tree, as admin_menu() returns it
  var basket = [];

  function activeItems() {
    var out = [];
    if (!shop) { return out; }
    for (var c = 0; c < shop.categories.length; c++) {
      var cat = shop.categories[c];
      if (!cat.is_active) { continue; }
      for (var i = 0; i < cat.items.length; i++) {
        if (cat.items[i].is_active) { out.push(cat.items[i]); }
      }
    }
    return out;
  }

  function drawPicker() {
    var box = el('new-menu');
    box.textContent = '';
    var items = activeItems();
    for (var i = 0; i < items.length; i++) {
      box.appendChild(pickCard(items[i]));
    }
    if (!items.length) { box.appendChild(elt('p', 'empty', 'No dishes are on the menu.')); }

    var sel = el('c-area');
    sel.textContent = '';
    var areas = (shop && shop.areas) || [];
    for (var a = 0; a < areas.length; a++) {
      if (!areas[a].is_active) { continue; }
      var opt = elt('option', null,
        areas[a].name + ' — ' + (areas[a].fee_kobo ? naira(areas[a].fee_kobo) : 'no fee set'));
      opt.value = areas[a].id;
      opt.setAttribute('data-fee', areas[a].fee_kobo);
      sel.appendChild(opt);
    }
  }

  function pickCard(item) {
    var card = elt('div', 'pick' + (item.is_available ? '' : ' is-off'));
    card.setAttribute('data-item', item.id);

    var head = elt('div', 'pick-head');
    head.appendChild(elt('span', 'pick-name', item.name));
    if (!item.is_available) { head.appendChild(elt('span', 'sold-out', 'Sold out')); }
    head.appendChild(elt('span', 'pick-price', naira(item.price_kobo)));
    card.appendChild(head);

    var groups = elt('div', 'pick-groups');
    for (var g = 0; g < item.groups.length; g++) {
      var grp = item.groups[g];
      var wrap = elt('fieldset', 'pick-group');
      wrap.setAttribute('data-group', grp.id);
      wrap.setAttribute('data-min', grp.min_select);
      wrap.setAttribute('data-max', grp.max_select);
      var legend = elt('legend', 'pick-group-name',
        grp.name + (grp.min_select > 0 ? ' (required)' : ' (optional)'));
      wrap.appendChild(legend);

      var single = grp.max_select === 1;
      for (var o = 0; o < grp.options.length; o++) {
        var opt = grp.options[o];
        var lab = elt('label', 'opt-chip');
        var input = elt('input');
        input.type = single ? 'radio' : 'checkbox';
        input.name = 'g-' + grp.id + '-' + item.id;
        input.value = opt.id;
        input.setAttribute('data-name', opt.name);
        input.setAttribute('data-delta', opt.price_delta_kobo);
        if (!opt.is_available) { input.disabled = true; }
        lab.appendChild(input);
        lab.appendChild(document.createTextNode(
          opt.name
          + (opt.price_delta_kobo ? ' (+' + naira(opt.price_delta_kobo) + ')' : '')
          + (opt.is_available ? '' : ' — off')));
        wrap.appendChild(lab);
      }
      groups.appendChild(wrap);
    }
    card.appendChild(groups);

    var row = elt('div', 'pick-row');
    var qtyLab = elt('label', 'field field--inline pick-qty');
    qtyLab.appendChild(elt('span', 'field-label', 'Qty'));
    var qty = elt('input');
    qty.type = 'number'; qty.min = '1'; qty.max = '50'; qty.value = '1';
    qty.className = 'js-qty';
    qtyLab.appendChild(qty);
    row.appendChild(qtyLab);

    var noteLab = elt('label', 'field field--inline field--grow');
    noteLab.appendChild(elt('span', 'field-label', 'Line note'));
    var note = elt('input');
    note.type = 'text'; note.maxLength = 200; note.className = 'js-note';
    noteLab.appendChild(note);
    row.appendChild(noteLab);

    var add = elt('button', 'btn btn--go btn--sm', 'Add');
    add.type = 'button';
    add.disabled = !item.is_available;
    add.setAttribute('data-add', item.id);
    row.appendChild(add);
    card.appendChild(row);

    return card;
  }

  function addToBasket(card, item) {
    var chosen = [];
    var groups = card.querySelectorAll('.pick-group');
    for (var g = 0; g < groups.length; g++) {
      var grp = groups[g];
      var checked = grp.querySelectorAll('input:checked');
      var min = Number(grp.getAttribute('data-min'));
      var max = Number(grp.getAttribute('data-max'));
      if (checked.length < min || checked.length > max) {
        // The database enforces this too and would refuse the whole order;
        // saying it here means the kitchen never gets a half-specified ticket
        // and the person on the phone gets asked the question.
        A.show(el('new-error'), 'Choose ' +
          (min === max ? min : min + ' to ' + max) + ' for "' +
          grp.querySelector('legend').textContent.replace(/ \((required|optional)\)$/, '') +
          '" on ' + item.name + '.');
        return;
      }
      for (var c = 0; c < checked.length; c++) {
        chosen.push({
          id: checked[c].value,
          name: checked[c].getAttribute('data-name'),
          delta: Number(checked[c].getAttribute('data-delta')) || 0
        });
      }
    }

    var qty = Math.max(1, Math.min(50, Number(card.querySelector('.js-qty').value) || 1));
    var note = card.querySelector('.js-note').value.replace(/^\s+|\s+$/g, '');
    var delta = 0;
    for (var i = 0; i < chosen.length; i++) { delta += chosen[i].delta; }

    basket.push({
      itemId: item.id, name: item.name, qty: qty, note: note,
      options: chosen, unitKobo: item.price_kobo + delta
    });

    A.hide(el('new-error'));
    // Reset the card so the next dish starts clean.
    card.querySelector('.js-qty').value = '1';
    card.querySelector('.js-note').value = '';
    var inputs = card.querySelectorAll('.pick-group input');
    for (var k = 0; k < inputs.length; k++) { inputs[k].checked = false; }
    drawBasket();
  }

  function drawBasket() {
    var list = el('basket');
    list.textContent = '';
    for (var i = 0; i < basket.length; i++) {
      var b = basket[i];
      var li = elt('li');
      li.appendChild(elt('span', 'qty', '×' + b.qty));
      var mid = elt('div', 'line-body');
      mid.appendChild(elt('span', null, b.name));
      if (b.options.length) {
        var names = [];
        for (var j = 0; j < b.options.length; j++) { names.push(b.options[j].name); }
        mid.appendChild(elt('span', 'opts', names.join(' · ')));
      }
      if (b.note) { mid.appendChild(elt('div', 'muted small', b.note)); }
      li.appendChild(mid);
      li.appendChild(elt('span', 'line-money', naira(b.unitKobo * b.qty)));
      var rm = elt('button', 'btn btn--quiet btn--sm', 'Remove');
      rm.type = 'button';
      rm.setAttribute('data-remove', String(i));
      li.appendChild(rm);
      list.appendChild(li);
    }
    el('basket-empty').hidden = basket.length > 0;
    drawTotals();
  }

  /* A preview, not the price. place_order() reads every figure from the
     database again when it saves, and that is the number the customer pays —
     it is shown on the confirmation. The two agree because they use the same
     rules; this one exists so the person on the phone can say a total. */
  function drawTotals() {
    var subtotal = 0;
    for (var i = 0; i < basket.length; i++) { subtotal += basket[i].unitKobo * basket[i].qty; }

    var fulfilment = document.querySelector('input[name=fulfilment]:checked').value;
    var fee = 0;
    if (fulfilment === 'delivery') {
      var opt = el('c-area').selectedOptions && el('c-area').selectedOptions[0];
      fee = opt ? Number(opt.getAttribute('data-fee')) || 0 : 0;
      var threshold = shop && shop.settings && shop.settings.free_delivery_threshold_kobo;
      if (threshold && subtotal >= threshold) { fee = 0; }
    }

    el('sum-subtotal').textContent = naira(subtotal);
    el('sum-fee').textContent = naira(fee);
    el('fee-line').hidden = fulfilment !== 'delivery';
    el('sum-total').textContent = naira(subtotal + fee);
  }

  el('new-menu').addEventListener('click', function (ev) {
    var id = ev.target.getAttribute && ev.target.getAttribute('data-add');
    if (!id) { return; }
    var card = ev.target.closest('.pick');
    var items = activeItems();
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) { addToBasket(card, items[i]); return; }
    }
  });

  el('basket').addEventListener('click', function (ev) {
    var idx = ev.target.getAttribute && ev.target.getAttribute('data-remove');
    if (idx === null || idx === undefined) { return; }
    basket.splice(Number(idx), 1);
    drawBasket();
  });

  el('fulfilment-row').addEventListener('change', function () {
    var f = document.querySelector('input[name=fulfilment]:checked').value;
    el('delivery-fields').hidden = f !== 'delivery';
    drawTotals();
  });
  el('c-area').addEventListener('change', drawTotals);

  el('new-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    A.begin();
    A.hide(el('new-error'));
    A.hide(el('new-ok'));

    if (!basket.length) { A.show(el('new-error'), 'Add at least one dish.'); return; }

    var fulfilment = document.querySelector('input[name=fulfilment]:checked').value;
    var channel = document.querySelector('input[name=channel]:checked').value;
    var areaId = fulfilment === 'delivery' ? el('c-area').value : null;
    var address = fulfilment === 'delivery'
      ? el('c-address').value.replace(/^\s+|\s+$/g, '') : null;

    if (fulfilment === 'delivery' && (!areaId || !address)) {
      A.show(el('new-error'), 'A delivery needs an area and an address.');
      return;
    }

    var items = [];
    for (var i = 0; i < basket.length; i++) {
      var b = basket[i];
      var ids = [];
      for (var j = 0; j < b.options.length; j++) { ids.push(b.options[j].id); }
      items.push({ item_id: b.itemId, quantity: b.qty, option_ids: ids, note: b.note || null });
    }

    var btn = el('new-submit');
    btn.disabled = true;
    btn.textContent = 'Saving…';

    A.call('place_order', {
      p_customer_name: el('c-name').value,
      p_customer_phone: el('c-phone').value,
      p_fulfilment: fulfilment,
      p_items: items,
      p_delivery_area_id: areaId,
      p_address: address,
      p_notes: el('c-notes').value || null,
      p_channel: channel
    }).then(function (out) {
      // The total shown here is the database's, not the preview's.
      A.show(el('new-ok'), out.code + ' saved — ' + naira(out.total_kobo)
        + '. It is on the kitchen screen now.');
      basket = [];
      drawBasket();
      el('c-name').value = ''; el('c-phone').value = '';
      el('c-address').value = ''; el('c-notes').value = '';
      el('c-name').focus();
    }).catch(function (err) {
      A.show(el('new-error'), err.message);
    }).then(function () {
      btn.disabled = false;
      btn.textContent = 'Save order';
    });
  });

  A.views['new'] = {
    enter: function () {
      // Always refetch: a dish may have sold out since this tab was last open,
      // and offering it to a customer on the phone is worse than useless.
      return A.call('admin_menu').then(function (out) {
        shop = out;
        drawPicker();
        drawBasket();
        el('delivery-fields').hidden =
          document.querySelector('input[name=fulfilment]:checked').value !== 'delivery';
      }).catch(function (err) { A.fail(err.message); });
    }
  };

  // Shared with the menu screen, which edits the same tree.
  A.setShop = function (s) { shop = s; };
  A.getShop = function () { return shop; };
}(window));
