/* Nice Meal — admin: the menu and shop switches, the reports, and staff. */
(function (global) {
  'use strict';

  var A = global.NM.admin;
  var el = A.el, elt = A.elt, naira = A.naira;

  /* ════════════════════════════════════════════════════════════════════════
     Menu and shop
     ═══════════════════════════════════════════════════════════════════════*/

  function loadShop() {
    return A.call('admin_menu').then(function (out) {
      A.setShop(out);
      drawSettings(out.settings);
      drawAreas(out.areas);
      drawMenu(out.categories);
      A.refreshPausedBanner();
    }).catch(function (err) { A.fail(err.message); });
  }

  function drawSettings(s) {
    if (!s) { return; }
    el('s-accepting').checked = !!s.accepting_orders;
    el('s-pause-reason').value = s.pause_reason || '';
    el('pause-reason-field').hidden = !!s.accepting_orders;
    el('s-min').value = (s.min_order_kobo || 0) / 100;
    el('s-free').value = s.free_delivery_threshold_kobo
      ? s.free_delivery_threshold_kobo / 100 : 0;
    el('s-prep').value = s.prep_time_minutes || 30;
  }

  el('s-accepting').addEventListener('change', function () {
    el('pause-reason-field').hidden = el('s-accepting').checked;
  });

  el('s-save').addEventListener('click', function () {
    A.begin();
    var accepting = el('s-accepting').checked;
    var freeNaira = Number(el('s-free').value);
    A.call('admin_set_settings', {
      p_accepting_orders: accepting,
      p_pause_reason: accepting ? null : (el('s-pause-reason').value || null),
      p_min_order_kobo: A.kobo(el('s-min').value),
      // 0 clears the threshold entirely; -1 would mean "leave it alone", which
      // is not what a form submit means.
      p_free_delivery_threshold_kobo: freeNaira > 0 ? A.kobo(freeNaira) : 0,
      p_prep_time_minutes: Number(el('s-prep').value) || 30
    }).then(function (s) {
      drawSettings(s);
      A.refreshPausedBanner();
      A.toast('Settings saved.');
    }).catch(function (err) { A.fail(err.message); });
  });

  function drawAreas(areas) {
    var body = el('areas-body');
    body.textContent = '';
    var missing = 0;
    for (var i = 0; i < areas.length; i++) {
      var a = areas[i];
      if (a.is_active && !a.fee_kobo) { missing++; }
      var tr = elt('tr');
      tr.appendChild(elt('td', null, a.name));

      var feeCell = elt('td', 'num');
      var fee = elt('input');
      fee.type = 'number'; fee.min = '0'; fee.step = '50';
      fee.value = (a.fee_kobo || 0) / 100;
      fee.setAttribute('data-area', a.id);
      fee.setAttribute('data-field', 'fee');
      // The column heading is not a label as far as a screen reader is
      // concerned: seven identical spinners need seven names.
      fee.setAttribute('aria-label', 'Delivery fee for ' + a.name + ', in naira');
      feeCell.appendChild(fee);
      tr.appendChild(feeCell);

      var onCell = elt('td');
      var on = elt('input');
      on.type = 'checkbox';
      on.checked = !!a.is_active;
      on.setAttribute('data-area', a.id);
      on.setAttribute('data-field', 'active');
      on.setAttribute('aria-label', 'Deliver to ' + a.name);
      onCell.appendChild(on);
      tr.appendChild(onCell);

      body.appendChild(tr);
    }

    // The seed ships every area at zero, because the website never quoted a
    // fee. Saying so here is the difference between noticing and finding out
    // from a driver.
    var warn = el('fee-warning');
    if (missing) {
      warn.textContent = missing + (missing === 1 ? ' area has' : ' areas have')
        + ' no delivery fee set, so delivery there is currently free.';
      warn.hidden = false;
    } else {
      warn.hidden = true;
    }
  }

  el('areas-body').addEventListener('change', function (ev) {
    var id = ev.target.getAttribute('data-area');
    if (!id) { return; }
    A.begin();
    var field = ev.target.getAttribute('data-field');
    var args = { p_area_id: id };
    if (field === 'fee') { args.p_fee_kobo = A.kobo(ev.target.value); }
    else { args.p_is_active = ev.target.checked; }
    A.call('admin_set_area', args).then(function () {
      A.toast('Delivery areas updated.');
      return loadShop();
    }).catch(function (err) { A.fail(err.message); loadShop(); });
  });

  function drawMenu(categories) {
    var box = el('menu-tree');
    box.textContent = '';
    for (var c = 0; c < categories.length; c++) {
      var cat = categories[c];
      var card = elt('div', 'card card--wide');
      card.appendChild(elt('h3', 'sub', cat.name));

      for (var i = 0; i < cat.items.length; i++) {
        var item = cat.items[i];
        var row = elt('div', 'dish-row');

        var name = elt('div', 'dish-name', item.name);
        if (item.description) { name.appendChild(elt('span', null, item.description)); }
        row.appendChild(name);

        var priceLab = elt('label', 'field field--inline dish-price');
        priceLab.appendChild(elt('span', 'field-label', 'Price (₦)'));
        var price = elt('input');
        price.type = 'number'; price.min = '1'; price.step = '50';
        price.value = item.price_kobo / 100;
        price.setAttribute('data-item', item.id);
        price.setAttribute('data-field', 'price');
        priceLab.appendChild(price);
        row.appendChild(priceLab);

        row.appendChild(toggle(item.id, 'available', item.is_available,
          'On today', 'Available today: ' + item.name));
        row.appendChild(toggle(item.id, 'active', item.is_active,
          'On the menu', 'On the menu at all: ' + item.name));

        card.appendChild(row);

        for (var g = 0; g < item.groups.length; g++) {
          var grp = item.groups[g];
          var optRow = elt('div', 'opt-row');
          optRow.appendChild(elt('span', 'field-label', grp.name));
          for (var o = 0; o < grp.options.length; o++) {
            var opt = grp.options[o];
            var lab = elt('label', 'opt-chip');
            var input = elt('input');
            input.type = 'checkbox';
            input.checked = !!opt.is_available;
            input.setAttribute('data-option', opt.id);
            lab.appendChild(input);
            lab.appendChild(document.createTextNode(opt.name));
            optRow.appendChild(lab);
          }
          card.appendChild(optRow);
        }
      }
      box.appendChild(card);
    }
  }

  function toggle(itemId, field, on, text, aria) {
    var lab = elt('label', 'switch');
    var input = elt('input');
    input.type = 'checkbox';
    input.checked = !!on;
    input.setAttribute('data-item', itemId);
    input.setAttribute('data-field', field);
    input.setAttribute('aria-label', aria);
    lab.appendChild(input);
    lab.appendChild(elt('span', 'small', text));
    return lab;
  }

  el('menu-tree').addEventListener('change', function (ev) {
    A.begin();
    var optId = ev.target.getAttribute('data-option');
    if (optId) {
      A.call('admin_set_option', { p_option_id: optId, p_is_available: ev.target.checked })
        .then(function () { A.toast('Choice updated.'); })
        .catch(function (err) { A.fail(err.message); loadShop(); });
      return;
    }
    var id = ev.target.getAttribute('data-item');
    if (!id) { return; }
    var field = ev.target.getAttribute('data-field');
    var args = { p_item_id: id };
    if (field === 'price')          { args.p_price_kobo = A.kobo(ev.target.value); }
    else if (field === 'available') { args.p_is_available = ev.target.checked; }
    else                            { args.p_is_active = ev.target.checked; }
    A.call('admin_set_item', args).then(function (item) {
      // Renaming or repricing does not touch what has already been sold:
      // order_items keeps its own copy of the name and the price.
      A.toast(item.name + ' updated.');
    }).catch(function (err) { A.fail(err.message); loadShop(); });
  });

  A.views.menu = { enter: loadShop, refresh: loadShop };

  /* ════════════════════════════════════════════════════════════════════════
     Reports
     ═══════════════════════════════════════════════════════════════════════*/

  function runReport() {
    var from = el('r-from').value, to = el('r-to').value;
    if (!from || !to) { return Promise.resolve(); }
    return A.call('admin_report', { p_from: from, p_to: to })
      .then(drawReport)
      .catch(function (err) { A.fail(err.message); });
  }

  function stat(label, value) {
    var box = elt('div', 'stat');
    box.appendChild(elt('span', 'stat-label', label));
    box.appendChild(elt('span', 'stat-value', value));
    return box;
  }

  function bars(rowsIn, labelOf, valueOf, format) {
    var wrap = elt('div', 'bars');
    var max = 0;
    for (var i = 0; i < rowsIn.length; i++) { max = Math.max(max, Number(valueOf(rowsIn[i])) || 0); }
    for (var j = 0; j < rowsIn.length; j++) {
      var r = rowsIn[j];
      var v = Number(valueOf(r)) || 0;
      var row = elt('div', 'bar-row');
      var lab = elt('span', 'bar-label', labelOf(r));
      // A long dish name still ellipsises at the narrowest widths; the title
      // is how you read the rest of it.
      lab.title = labelOf(r);
      row.appendChild(lab);
      var track = elt('div', 'bar-track');
      var fill = elt('div', 'bar-fill');
      fill.style.width = (max ? Math.round(v / max * 100) : 0) + '%';
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(elt('span', 'bar-value', format(v, r)));
      wrap.appendChild(row);
    }
    if (!rowsIn.length) { wrap.appendChild(elt('p', 'empty', 'Nothing in this range.')); }
    return wrap;
  }

  function drawReport(rep) {
    var t = rep.totals || {};
    var totals = el('report-totals');
    totals.textContent = '';
    totals.appendChild(stat('Completed orders', t.orders || 0));
    totals.appendChild(stat('Taken', naira(t.gross_kobo)));
    totals.appendChild(stat('Average order', naira(t.avg_kobo)));
    totals.appendChild(stat('Delivery fees', naira(t.delivery_kobo)));
    totals.appendChild(stat('Cancelled', rep.cancelled || 0));

    var days = el('report-days');
    days.textContent = '';
    days.appendChild(bars(rep.days || [],
      function (d) { return String(d.day).slice(5); },
      function (d) { return d.gross_kobo; },
      function (v, d) { return naira(v) + '  (' + d.orders_count + ')'; }));

    var top = el('report-top');
    top.textContent = '';
    top.appendChild(bars(rep.top || [],
      function (d) { return d.name; },
      function (d) { return d.sold; },
      function (v, d) { return v + ' sold · ' + naira(d.revenue_kobo); }));

    var splits = el('report-splits');
    splits.textContent = '';
    splits.appendChild(elt('p', 'field-label', 'By how it arrived'));
    splits.appendChild(bars(rep.by_channel || [],
      function (d) { return A.label('channel', d.key); },
      function (d) { return d.orders; },
      function (v, d) { return v + ' · ' + naira(d.gross_kobo); }));
    splits.appendChild(elt('p', 'field-label', 'By how it left'));
    splits.appendChild(bars(rep.by_fulfilment || [],
      function (d) { return A.label('fulfilment', d.key); },
      function (d) { return d.orders; },
      function (v, d) { return v + ' · ' + naira(d.gross_kobo); }));
  }

  el('report-filters').addEventListener('submit', function (ev) {
    ev.preventDefault();
    A.begin();
    runReport();
  });
  el('report-filters').addEventListener('click', function (ev) {
    var days = ev.target.getAttribute && ev.target.getAttribute('data-range');
    if (!days) { return; }
    el('r-from').value = A.daysAgo(Number(days) - 1);
    el('r-to').value = A.lagosDay();
    runReport();
  });

  A.views.reports = {
    enter: function () {
      if (!el('r-from').value) {
        el('r-from').value = A.daysAgo(6);
        el('r-to').value = A.lagosDay();
      }
      return runReport();
    },
    refresh: runReport
  };

  /* ════════════════════════════════════════════════════════════════════════
     Staff
     ═══════════════════════════════════════════════════════════════════════*/

  function loadStaff() {
    return A.call('admin_staff').then(drawStaff)
      .catch(function (err) { A.fail(err.message); });
  }

  function drawStaff(list) {
    var body = el('staff-body');
    body.textContent = '';
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var tr = elt('tr');

      var name = elt('td');
      name.appendChild(document.createTextNode(s.display_name));
      if (s.is_you) { name.appendChild(elt('span', 'muted small', '  (you)')); }
      tr.appendChild(name);

      tr.appendChild(elt('td', 'muted', s.email));

      var roleCell = elt('td');
      var role = elt('select');
      role.setAttribute('data-user', s.user_id);
      role.setAttribute('data-field', 'role');
      role.setAttribute('aria-label', 'Role for ' + s.display_name);
      var k = elt('option', null, 'Kitchen'); k.value = 'kitchen';
      var a = elt('option', null, 'Admin');   a.value = 'admin';
      role.appendChild(k); role.appendChild(a);
      role.value = s.role;
      roleCell.appendChild(role);
      tr.appendChild(roleCell);

      var onCell = elt('td');
      var on = elt('input');
      on.type = 'checkbox';
      on.checked = !!s.is_active;
      on.setAttribute('data-user', s.user_id);
      on.setAttribute('data-field', 'active');
      on.setAttribute('aria-label', 'Active: ' + s.display_name);
      onCell.appendChild(on);
      tr.appendChild(onCell);

      body.appendChild(tr);
    }
  }

  el('staff-body').addEventListener('change', function (ev) {
    var id = ev.target.getAttribute('data-user');
    if (!id) { return; }
    A.begin();
    var field = ev.target.getAttribute('data-field');
    var args = { p_user_id: id };
    if (field === 'role') { args.p_role = ev.target.value; }
    else { args.p_is_active = ev.target.checked; }
    A.call('admin_set_staff', args).then(function () {
      A.toast('Staff updated.');
      return loadStaff();
    }).catch(function (err) {
      // The database refuses to leave the shop with no administrator. Put the
      // control back where it was rather than leaving the screen lying.
      A.fail(err.message);
      loadStaff();
    });
  });

  el('staff-add').addEventListener('submit', function (ev) {
    ev.preventDefault();
    A.begin();
    A.hide(el('staff-error'));
    A.call('admin_add_staff', {
      p_email: el('st-email').value,
      p_role: el('st-role').value,
      p_display_name: el('st-name').value
    }).then(function () {
      el('st-email').value = ''; el('st-name').value = '';
      A.toast('Added.');
      return loadStaff();
    }).catch(function (err) { A.show(el('staff-error'), err.message); });
  });

  A.views.staff = { enter: loadStaff, refresh: loadStaff };
}(window));
