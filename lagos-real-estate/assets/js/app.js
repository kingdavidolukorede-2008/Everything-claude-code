/* ==========================================================================
   Havenmark Properties — site behaviour
   Plain ES2019, no dependencies, no build step. Content comes from data.js.
   ========================================================================== */
(function () {
  "use strict";

  var SITE = window.SITE, LISTINGS = window.LISTINGS || [], TESTIMONIALS = window.TESTIMONIALS || [];
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  };
  var icon = function (id) { return '<svg class="ic" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; };
  var naira = function (n) { return "₦" + Number(n).toLocaleString("en-NG"); };
  var byId = function (id) { return LISTINGS.filter(function (l) { return l.id === id; })[0]; };
  var fullLocation = function (l) { return l.location + ", " + SITE.area; };
  var priceHTML = function (l) { return naira(l.price) + (l.deal === "rent" ? "<small>/year</small>" : ""); };
  var priceText = function (l) { return naira(l.price) + (l.deal === "rent" ? "/year" : ""); };
  var fill = function (tpl) { return tpl.replace(/\{name\}/g, SITE.name).replace(/\{area\}/g, SITE.area); };
  var waLink = function (msg) { return "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(msg); };
  var pageURL = function (l) { return new URL("property.html?id=" + l.id, location.href).href; };
  var initials = function (name) { return name.replace(/^(Mrs?\.|Chief|Dr\.)\s+/i, "").split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase(); };

  /* Responsive Unsplash image. Non-Unsplash sources are used as-is. */
  function img(src, alt, sizes, eager) {
    var isU = /images\.unsplash\.com/.test(src);
    var at = function (w) { return src + (src.indexOf("?") > -1 ? "&" : "?") + "w=" + w + "&q=65&auto=format&fit=crop"; };
    return '<img src="' + esc(isU ? at(800) : src) + '"' +
      (isU ? ' srcset="' + [480, 800, 1200, 1800].map(function (w) { return esc(at(w)) + " " + w + "w"; }).join(", ") + '" sizes="' + sizes + '"' : "") +
      ' alt="' + esc(alt) + '" width="1200" height="900" decoding="async"' + (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ">";
  }

  var toastTimer;
  function toast(msg) {
    var t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 2600);
  }

  /* ---------------------------------------------------------------- site details */
  function applySite() {
    $$("[data-site]").forEach(function (el) { var v = SITE[el.getAttribute("data-site")]; if (v != null) el.textContent = v; });
    $$("[data-count]").forEach(function (el) {
      var v = SITE[el.getAttribute("data-count")]; if (v == null) return;
      el.textContent = Number(v).toLocaleString("en-NG") + (el.getAttribute("data-suffix") || "");
    });
    $$("[data-social]").forEach(function (a) { var u = SITE.social[a.getAttribute("data-social")]; if (u) a.href = u; else a.remove(); });
    $$("[data-tel]").forEach(function (a) { a.href = "tel:+" + SITE.whatsapp; });
    $$("[data-mail]").forEach(function (a) { a.href = "mailto:" + SITE.email; });
    $$("[data-maps]").forEach(function (a) { a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(SITE.address); });
    $$("[data-wa]").forEach(function (a) { a.href = waLink(fill(a.getAttribute("data-wa"))); });
    var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------- header + menu */
  function initHeader() {
    var header = $("#siteHeader"), btn = $("#menuBtn"), nav = $("#nav");
    if (header && header.hasAttribute("data-transparent")) {
      var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 24 || nav.classList.contains("is-open")); };
      window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    }
    if (!btn || !nav) return;
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      btn.innerHTML = icon(open ? "close" : "menu");
      if (header.hasAttribute("data-transparent")) header.classList.toggle("is-scrolled", open || window.scrollY > 24);
    };
    btn.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); btn.focus(); } });
    window.matchMedia("(min-width: 960px)").addEventListener("change", function () { setOpen(false); });
  }

  /* ---------------------------------------------------------------- reveal on scroll */
  function initReveal() {
    var els = $$(".section-head, .step, .card, .stat, .quote, .card-panel, .ll-points li, .feature, .map-ph");
    if (reduced || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el, i) {
      if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen: no fade
      el.classList.add("reveal"); el.style.transitionDelay = (i % 3) * 70 + "ms"; io.observe(el);
    });
  }

  /* ---------------------------------------------------------------- listing card */
  function card(l) {
    return '<article class="card">' +
      '<div class="media">' + img(l.photos[0][0], l.photos[0][1], "(min-width:1100px) 380px, (min-width:680px) 50vw, 100vw") +
        '<span class="card-photos">' + l.photos.length + " photos</span></div>" +
      '<div class="card-tags"><span class="tag tag-' + l.deal + '">' + (l.deal === "rent" ? "Rent" : "Sale") + "</span>" +
        '<span class="tag tag-verified">' + icon("verified") + "Verified</span></div>" +
      '<div class="card-body">' +
        '<p class="card-price">' + priceHTML(l) + "</p>" +
        '<h3 class="card-title"><a href="property.html?id=' + l.id + '">' + esc(l.title) + "</a></h3>" +
        '<p class="card-loc">' + icon("pin") + esc(fullLocation(l)) + "</p>" +
        '<ul class="specs" aria-label="Key details">' +
          "<li>" + icon("bed") + l.beds + " bed" + (l.beds > 1 ? "s" : "") + "</li>" +
          "<li>" + icon("bath") + l.baths + " bath" + (l.baths > 1 ? "s" : "") + "</li>" +
          (l.size ? "<li>" + icon("area") + l.size + " m²</li>" : "") +
        "</ul>" +
        '<p class="card-cta">View details' + icon("arrow") + "</p>" +
      "</div></article>";
  }

  /* ---------------------------------------------------------------- select options */
  var BUDGETS = {
    rent: [["0-3000000", "Under ₦3M / yr"], ["3000000-6000000", "₦3M – ₦6M / yr"], ["6000000-10000000", "₦6M – ₦10M / yr"], ["10000000-", "Above ₦10M / yr"]],
    sale: [["0-100000000", "Under ₦100M"], ["100000000-250000000", "₦100M – ₦250M"], ["250000000-500000000", "₦250M – ₦500M"], ["500000000-", "Above ₦500M"]]
  };
  var uniq = function (key) { return LISTINGS.map(function (l) { return l[key]; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(); };
  var opt = function (v, label) { return '<option value="' + esc(v) + '">' + esc(label) + "</option>"; };

  function fillSelect(sel, kind, deal) {
    var first = sel.options[0].outerHTML, keep = sel.value, html = "";
    if (kind === "locations") html = uniq("location").map(function (v) { return opt(v, v); }).join("");
    if (kind === "types") html = uniq("type").map(function (v) { return opt(v, v); }).join("");
    if (kind === "budgets") {
      var group = function (d, label) { return '<optgroup label="' + label + '">' + BUDGETS[d].map(function (b) { return opt(d + ":" + b[0], b[1]); }).join("") + "</optgroup>"; };
      html = deal ? BUDGETS[deal].map(function (b) { return opt(deal + ":" + b[0], b[1]); }).join("") : group("rent", "To rent (per year)") + group("sale", "To buy");
    }
    sel.innerHTML = first + html;
    sel.value = keep; if (sel.value !== keep) sel.value = "";
  }

  function inBudget(l, budget) {
    if (!budget) return true;
    var parts = budget.split(":"), range = parts[1].split("-");
    if (parts[0] !== l.deal) return false;
    return l.price >= Number(range[0]) && (range[1] === "" || l.price <= Number(range[1]));
  }

  /* ---------------------------------------------------------------- home: filters */
  function initListings() {
    var form = $("#filters"), grid = $("#listingGrid"); if (!form || !grid) return;
    var empty = $("#emptyState"), count = $("#resultCount"), reset = $("#resetFilters");
    var more = $("#filterMore"), toggle = $("#filtersToggle"), badge = $("#filterCount");

    $$("select[data-options]").forEach(function (s) { fillSelect(s, s.getAttribute("data-options"), s.closest("#heroSearch") ? "rent" : ""); });

    var state = function () {
      var f = new FormData(form);
      return { deal: f.get("deal") || "", location: f.get("location") || "", type: f.get("type") || "", budget: f.get("budget") || "", beds: f.get("beds") || "" };
    };
    var setState = function (s) {
      ["deal", "beds"].forEach(function (k) { var r = form.querySelector('input[name="' + k + '"][value="' + (s[k] || "") + '"]'); if (r) r.checked = true; });
      fillSelect(form.elements.budget, "budgets", s.deal || "");
      ["location", "type", "budget"].forEach(function (k) { form.elements[k].value = s[k] || ""; if (form.elements[k].value !== (s[k] || "")) form.elements[k].value = ""; });
    };

    function render(fromUser) {
      var s = state();
      var list = LISTINGS.filter(function (l) {
        return (!s.deal || l.deal === s.deal) && (!s.location || l.location === s.location) && (!s.type || l.type === s.type) &&
          (!s.beds || l.beds >= Number(s.beds)) && inBudget(l, s.budget);
      });
      grid.innerHTML = list.map(card).join("");
      empty.hidden = list.length > 0;
      grid.hidden = list.length === 0;
      var active = ["location", "type", "budget", "beds"].filter(function (k) { return s[k]; }).length;
      badge.hidden = !active; badge.textContent = active;
      reset.hidden = !(active || s.deal);
      var what = s.deal === "rent" ? "to rent" : s.deal === "sale" ? "for sale" : "";
      count.innerHTML = list.length === LISTINGS.length && !s.deal
        ? "Showing all <strong>" + list.length + "</strong> homes"
        : "<strong>" + list.length + "</strong> home" + (list.length === 1 ? "" : "s") + (what ? " " + what : "") + " match";
      var q = new URLSearchParams(); Object.keys(s).forEach(function (k) { if (s[k]) q.set(k, s[k]); });
      if (fromUser) history.replaceState(null, "", (q.toString() ? "?" + q : location.pathname) + location.hash);
    }

    form.addEventListener("change", function (e) {
      if (e.target.name === "deal") fillSelect(form.elements.budget, "budgets", e.target.value);
      render(true);
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    var clear = function () { setState({}); render(true); toast("Filters cleared"); };
    reset.addEventListener("click", clear);
    $$("[data-reset]").forEach(function (b) { b.addEventListener("click", clear); });
    toggle.addEventListener("click", function () {
      var open = !more.classList.contains("is-open");
      more.classList.toggle("is-open", open); toggle.setAttribute("aria-expanded", String(open));
    });

    /* hero search feeds the same filters */
    var hero = $("#heroSearch");
    if (hero) {
      hero.addEventListener("change", function (e) { if (e.target.name === "deal") fillSelect(hero.elements.budget, "budgets", e.target.value); });
      hero.addEventListener("submit", function (e) {
        e.preventDefault();
        var f = new FormData(hero);
        setState({ deal: f.get("deal"), location: f.get("location"), type: f.get("type"), budget: f.get("budget"), beds: "" });
        render(true);
        $("#listings").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      });
    }

    var p = new URLSearchParams(location.search);
    if (["deal", "location", "type", "budget", "beds"].some(function (k) { return p.get(k); })) {
      setState({ deal: p.get("deal"), location: p.get("location"), type: p.get("type"), budget: p.get("budget"), beds: p.get("beds") });
      if (p.get("location") || p.get("type") || p.get("budget") || p.get("beds")) { more.classList.add("is-open"); toggle.setAttribute("aria-expanded", "true"); }
    }
    render(false);
  }

  function initQuotes() {
    var box = $("#quotes"); if (!box) return;
    box.innerHTML = TESTIMONIALS.map(function (t) {
      return '<figure class="quote"><blockquote>' + esc(t.quote) + "</blockquote>" +
        '<figcaption><span class="avatar" aria-hidden="true">' + esc(initials(t.name)) + "</span><div><strong>" + esc(t.name) + "</strong><span>" + esc(t.role) + "</span></div></figcaption></figure>";
    }).join("");
  }

  /* ---------------------------------------------------------------- forms */
  var PHONE = /^(?:\+?234|0)[789][01]\d{8}$/;
  var cleanPhone = function (v) { return v.replace(/[\s\-().]/g, ""); };
  var SLOTS = ["9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM", "4:30 PM"];
  var iso = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  var niceDate = function (s) { var p = s.split("-"); return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); };

  function setError(field, msg) {
    var wrap = field.closest(".field, .slots-field"); if (!wrap) return;
    wrap.classList.toggle("has-error", !!msg);
    var e = $(".err", wrap); if (e) e.textContent = msg || "";
    if (field.setAttribute) field.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function bookingForm(preselect, uid) {
    var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1);
    var max = new Date(); max.setDate(max.getDate() + 60);
    return '<form class="form" novalidate data-booking>' +
      (uid === "home" ? '<h3 class="form-title">Request a viewing</h3><p class="form-sub">Takes under a minute. No inspection fee.</p>' : "") +
      '<div class="form-row">' +
        '<label class="field"><span class="field-label">Full name</span><input name="name" autocomplete="name" required placeholder="e.g. Adaeze Okafor"><span class="err" aria-live="polite"></span></label>' +
        '<label class="field"><span class="field-label">Phone / WhatsApp</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="0803 123 4567"><span class="err" aria-live="polite"></span></label>' +
      "</div>" +
      '<label class="field"><span class="field-label">Property of interest</span><select name="property" required><option value="">Choose a property…</option>' +
        LISTINGS.map(function (l) { return '<option value="' + l.id + '"' + (l.id === preselect ? " selected" : "") + ">" + esc(l.title + " — " + l.location + " (" + priceText(l) + ")") + "</option>"; }).join("") +
        '<option value="other">Something else — help me find one</option></select><span class="err" aria-live="polite"></span></label>' +
      '<label class="field"><span class="field-label">Preferred date</span><input name="date" type="date" required min="' + iso(tomorrow) + '" max="' + iso(max) + '"><span class="err" aria-live="polite"></span></label>' +
      '<fieldset class="slots-field"><legend class="field-label">Preferred time</legend><div class="slots">' +
        SLOTS.map(function (t, i) { return '<label><input type="radio" name="time" value="' + t + '"' + (i === 1 ? " checked" : "") + "><span>" + t + "</span></label>"; }).join("") +
      '</div><span class="err" aria-live="polite"></span></fieldset>' +
      HONEYPOT +
      '<button class="btn btn-gold btn-block btn-lg" type="submit">' + icon("cal") + "Book inspection</button>" +
      '<p class="form-foot">We\'ll call to confirm within 2 working hours. Your details are only used to arrange this viewing.</p>' +
      "</form>";
  }

  /* Sends a lead to Formspree when SITE.formspree is set; otherwise succeeds
     at once so the site still works as a demo. On failure the form stays
     filled in and offers a retry plus a WhatsApp fallback. */
  var HONEYPOT = '<input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">';
  var endpoint = function () {
    var f = (SITE.formspree || "").trim();
    return !f ? "" : /^https?:\/\//.test(f) ? f : "https://formspree.io/f/" + f;
  };
  function sendLead(form, data, waMsg, onSent) {
    var url = endpoint(), btn = $('button[type="submit"]', form), alert = $(".form-alert", form);
    if (alert) alert.remove();
    if (!url) { onSent(false); return; }
    if (form.elements._gotcha && form.elements._gotcha.value) { onSent(true); return; } // bot: pretend it worked
    var label = btn.innerHTML;
    btn.disabled = true; btn.classList.add("is-loading"); btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Sending…';
    data._subject = data._subject + " — " + SITE.name + " website";
    data.page = location.href;
    fetch(url, { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) {
        if (r.ok) return onSent(true);
        return r.json().catch(function () { return {}; }).then(function (j) {
          throw new Error((j.errors || []).map(function (x) { return x.message; }).join(" ") || "HTTP " + r.status);
        });
      })
      .catch(function (err) {
        if (window.console) console.warn("Form not sent:", err.message);
        btn.disabled = false; btn.classList.remove("is-loading"); btn.innerHTML = label;
        btn.insertAdjacentHTML("beforebegin", '<div class="form-alert" role="alert"><strong>That didn\'t go through.</strong> ' +
          'Check your connection and try again, or <a href="' + esc(waLink(waMsg)) + '" target="_blank" rel="noopener">send it to us on WhatsApp</a>.</div>');
      });
  }

  function mountBooking(mount, preselect) {
    mount.innerHTML = bookingForm(preselect, mount.closest("dialog") ? "modal" : "home");
    var form = $("form", mount);
    form.addEventListener("input", function (e) { if (e.target.name) setError(e.target, ""); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var el = form.elements, bad = [];
      var name = el.name.value.trim(), phone = cleanPhone(el.phone.value), date = el.date.value, prop = el.property.value;
      var time = (form.querySelector('input[name="time"]:checked') || {}).value;
      var check = function (field, msg) { setError(field, msg); if (msg) bad.push(field); };
      check(el.name, name.length < 2 ? "Please enter your name." : "");
      check(el.phone, !phone ? "We need a number to confirm your slot." : !PHONE.test(phone) ? "Enter a Nigerian number, e.g. 0803 123 4567." : "");
      check(el.property, !prop ? "Choose the property you'd like to see." : "");
      var dErr = "";
      if (!date) dErr = "Pick a date.";
      else if (date < el.date.min) dErr = "Please choose a date from tomorrow onwards.";
      else if (date > el.date.max) dErr = "We book up to 60 days ahead.";
      else { var p = date.split("-"); if (new Date(p[0], p[1] - 1, p[2]).getDay() === 0) dErr = "We don't inspect on Sundays — try Saturday or Monday."; }
      check(el.date, dErr);
      var slotsField = $(".slots-field", form);
      slotsField.classList.toggle("has-error", !time); $(".err", slotsField).textContent = time ? "" : "Pick a time.";
      if (bad.length) { bad[0].focus(); return; }

      var l = byId(prop), what = l ? l.title + ", " + l.location : "a property that fits my needs";
      var msg = "Hello " + SITE.name + ", I just booked an inspection on your website.\n\n" +
        "Name: " + name + "\nPhone: " + el.phone.value.trim() + "\nProperty: " + what + (l ? " (ref " + l.id.toUpperCase() + ")" : "") +
        "\nDate: " + niceDate(date) + "\nTime: " + time;
      var first = name.split(/\s+/)[0];
      var lead = { _subject: "Inspection request: " + (l ? l.title + " (" + l.id.toUpperCase() + ")" : "help me find a property"),
        form: "Inspection booking", name: name, phone: el.phone.value.trim(), property: what + (l ? " — " + priceText(l) + ", ref " + l.id.toUpperCase() : ""),
        date: niceDate(date), time: time, _gotcha: el._gotcha.value };
      sendLead(form, lead, msg, function (sent) {
      mount.innerHTML = '<div class="success" tabindex="-1">' +
        '<div class="success-ic">' + icon("check") + "</div>" +
        "<h3>You're booked in, " + esc(first) + "!</h3>" +
        "<p>We'll call <strong>" + esc(el.phone.value.trim()) + "</strong> within two working hours to confirm, then send the address and your agent's number on WhatsApp.</p>" +
        '<ul class="summary">' +
          "<li><span>Property</span><span>" + esc(l ? l.title : "Help me find one") + "</span></li>" +
          (l ? "<li><span>Location</span><span>" + esc(fullLocation(l)) + "</span></li>" : "") +
          "<li><span>Date</span><span>" + esc(niceDate(date)) + "</span></li>" +
          "<li><span>Time</span><span>" + esc(time) + "</span></li>" +
        "</ul>" +
        '<div class="success-actions">' +
          '<a class="btn ' + (sent ? "btn-outline" : "btn-wa") + ' btn-block" href="' + esc(waLink(msg)) + '" target="_blank" rel="noopener">' + icon("wa") + (sent ? "Also send on WhatsApp" : "Send details on WhatsApp") + "</a>" +
          '<button type="button" class="btn btn-outline btn-block" data-again>Book another viewing</button>' +
        "</div></div>";
      var box = $(".success", mount); box.focus({ preventScroll: true });
      if (!mount.closest("dialog")) box.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      $("[data-again]", mount).addEventListener("click", function () { mountBooking(mount, preselect); });
      });
    });
  }

  function initLandlordForm() {
    var form = $("#landlordForm"); if (!form) return;
    var panel = form.parentNode, original = panel.innerHTML;
    form.addEventListener("input", function (e) { if (e.target.name) setError(e.target, ""); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var el = form.elements, bad = [];
      var check = function (field, msg) { setError(field, msg); if (msg) bad.push(field); };
      check(el.name, el.name.value.trim().length < 2 ? "Please enter your name." : "");
      var ph = cleanPhone(el.phone.value);
      check(el.phone, !ph ? "Add a number we can call." : !PHONE.test(ph) ? "Enter a Nigerian number, e.g. 0803 123 4567." : "");
      check(el.location, el.location.value.trim().length < 3 ? "Where is the property?" : "");
      check(el.type, !el.type.value ? "Choose a property type." : "");
      if (bad.length) { bad[0].focus(); return; }
      var msg = "Hello " + SITE.name + ", I'd like to list my property with you.\n\nName: " + el.name.value.trim() + "\nPhone: " + el.phone.value.trim() +
        "\nLocation: " + el.location.value.trim() + "\nType: " + el.type.value + "\nI want to: " + el.intent.value + (el.note.value.trim() ? "\nNotes: " + el.note.value.trim() : "");
      var lead = { _subject: "New landlord enquiry: " + el.type.value + " in " + el.location.value.trim(),
        form: "Landlord listing", name: el.name.value.trim(), phone: el.phone.value.trim(), location: el.location.value.trim(),
        type: el.type.value, intent: el.intent.value, note: el.note.value.trim(), _gotcha: el._gotcha.value };
      sendLead(form, lead, msg, function () {
      panel.innerHTML = '<div class="success" tabindex="-1">' +
        '<div class="success-ic">' + icon("check") + "</div>" +
        "<h3>Thank you, " + esc(el.name.value.trim().split(/\s+/)[0]) + ".</h3>" +
        "<p>A property manager will call you within one working day to talk through your " + esc(el.type.value.toLowerCase()) + " in " + esc(el.location.value.trim()) + ".</p>" +
        '<div class="success-actions" style="margin-top:20px">' +
          '<a class="btn btn-wa btn-block" href="' + esc(waLink(msg)) + '" target="_blank" rel="noopener">' + icon("wa") + "Can't wait? Message us now</a>" +
          '<button type="button" class="btn btn-outline btn-block" data-again>Submit another property</button>' +
        "</div></div>";
      $(".success", panel).focus({ preventScroll: true });
      $("[data-again]", panel).addEventListener("click", function () { panel.innerHTML = original; initLandlordForm(); });
      });
    });
  }

  /* ---------------------------------------------------------------- property page */
  function initProperty() {
    var mount = $("[data-property-mount]"); if (!mount) return;
    var id = new URLSearchParams(location.search).get("id"), l = byId(id);

    if (!l) {
      mount.innerHTML = '<div class="wrap not-found"><h1>This listing has moved on</h1><p>It may have been let or sold. Browse what\'s available now, or tell us what you need on WhatsApp.</p>' +
        '<div class="empty-actions"><a class="btn btn-navy" href="index.html#listings">See available homes</a><a class="btn btn-wa" href="' + esc(waLink("Hello " + SITE.name + ", I'm looking for a property in " + SITE.area + ".")) + '" target="_blank" rel="noopener">' + icon("wa") + "Chat on WhatsApp</a></div></div>";
      return;
    }

    var ask = "Hello " + SITE.name + ", I'm interested in the " + l.title + " in " + fullLocation(l) + " (" + priceText(l) + ", ref " + l.id.toUpperCase() + "). Is it still available?\n\n" + pageURL(l);
    var tourAsk = "Hello " + SITE.name + ", could I get a live video walkthrough of the " + l.title + " in " + fullLocation(l) + " (ref " + l.id.toUpperCase() + ")?";
    var FEAT = [["parking", "car", "Parking"], ["security", "shield", "Security"], ["water", "drop", "Water"], ["power", "bolt", "Power supply"]];
    var total = l.fees ? Object.keys(l.fees).reduce(function (sum, k) { return sum + l.fees[k]; }, l.price) : 0;
    var similar = LISTINGS.filter(function (o) { return o.id !== l.id && o.deal === l.deal; }).concat(LISTINGS.filter(function (o) { return o.id !== l.id && o.deal !== l.deal; })).slice(0, 3);

    document.title = l.title + " in " + l.location + " — " + priceText(l) + " | " + SITE.name;
    var md = $('meta[name="description"]'); if (md) md.content = l.summary;
    var og = $('meta[property="og:title"]'); if (og) og.content = l.title + " — " + priceText(l);

    mount.innerHTML = '<div class="wrap">' +
      '<nav aria-label="Breadcrumb"><ol class="crumbs"><li><a href="index.html">Home</a></li><li><a href="index.html?deal=' + l.deal + '#listings">' + (l.deal === "rent" ? "For rent" : "For sale") + "</a></li><li aria-current=\"page\">" + esc(l.location) + "</li></ol></nav>" +

      '<section class="gallery" aria-label="Photos">' +
        '<div class="gallery-track" id="galleryTrack">' +
          l.photos.map(function (p, i) {
            return '<button type="button" class="gallery-item media" data-index="' + i + '" aria-label="Open photo ' + (i + 1) + " of " + l.photos.length + ": " + esc(p[1]) + '">' +
              img(p[0], p[1], i === 0 ? "(min-width:820px) 66vw, 100vw" : "(min-width:820px) 22vw, 100vw", i === 0) + "</button>";
          }).join("") +
        "</div>" +
        '<div class="card-tags"><span class="tag tag-' + l.deal + '">' + (l.deal === "rent" ? "For rent" : "For sale") + '</span></div>' +
        '<span class="gallery-count" id="galleryCount">1 / ' + l.photos.length + "</span>" +
        '<button type="button" class="btn gallery-all" data-index="0">View all ' + l.photos.length + " photos</button>" +
      "</section>" +
      '<div class="gallery-dots" aria-hidden="true">' + l.photos.map(function (_, i) { return "<span" + (i ? "" : ' class="is-on"') + "></span>"; }).join("") + "</div>" +

      '<div class="detail-grid"><div>' +
        '<header class="detail-head">' +
          '<p class="eyebrow">' + icon("verified") + "Verified listing · Ref " + l.id.toUpperCase() + "</p>" +
          "<h1>" + esc(l.title) + "</h1>" +
          '<p class="detail-loc">' + icon("pin") + esc(fullLocation(l)) + ", Lagos</p>" +
          '<p class="detail-price">' + priceHTML(l) + "</p>" +
          '<ul class="facts">' +
            "<li>" + icon("bed") + "<strong>" + l.beds + "</strong><span>Bedroom" + (l.beds > 1 ? "s" : "") + "</span></li>" +
            "<li>" + icon("bath") + "<strong>" + l.baths + "</strong><span>Bathroom" + (l.baths > 1 ? "s" : "") + "</span></li>" +
            "<li>" + icon("area") + "<strong>" + (l.size || "—") + "</strong><span>m²</span></li>" +
          "</ul>" +
        "</header>" +

        '<section class="block prose" aria-labelledby="dAbout"><h2 id="dAbout">About this home</h2>' + l.description.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</section>" +

        '<section class="block" aria-labelledby="dFeat"><h2 id="dFeat">Features</h2><div class="features">' +
          FEAT.map(function (f) { return '<div class="feature">' + icon(f[1]) + "<div><strong>" + f[2] + "</strong><span>" + esc(l.features[f[0]]) + "</span></div></div>"; }).join("") +
        '</div><ul class="amenities">' + l.amenities.map(function (a) { return "<li>" + icon("check") + esc(a) + "</li>"; }).join("") + "</ul></section>" +

        '<section class="block" aria-labelledby="dTour"><h2 id="dTour">Video tour</h2><div class="video" id="video">' +
          '<button type="button" class="video-poster media">' + img((l.photos[1] || l.photos[0])[0], "", "(min-width:1000px) 760px, 100vw") +
            '<span class="video-play">' + icon("play") + "</span>" +
            '<span class="video-cap"><strong>' + (l.video ? "Watch the walkthrough" : "Get a live video walkthrough") + "</strong><span>" +
              (l.video ? "A full room-by-room tour of the property" : "An agent will call you on WhatsApp video from inside the property") + "</span></span>" +
          "</button></div></section>" +

        (l.fees ? '<section class="block" aria-labelledby="dCost"><h2 id="dCost">Total move-in cost</h2><ul class="costs">' +
            "<li><span>Annual rent</span><span>" + naira(l.price) + "</span></li>" +
            Object.keys(l.fees).map(function (k) { return "<li><span>" + esc(k) + "</span><span>" + naira(l.fees[k]) + "</span></li>"; }).join("") +
            '<li class="total"><span>Total to move in</span><span>' + naira(total) + "</span></li></ul>" +
            '<p class="costs-note">No other charges. The caution deposit is refundable at the end of your tenancy, less any agreed repairs.</p></section>'
          : l.title_doc ? '<section class="block" aria-labelledby="dTitle"><h2 id="dTitle">Title &amp; documents</h2><div class="feature">' + icon("doc") +
            "<div><strong>Title</strong><span>" + esc(l.title_doc) + "</span></div></div>" +
            '<p class="costs-note">We arrange lawyer-to-lawyer verification of every document before you pay anything.</p></section>' : "") +

        '<section class="block" aria-labelledby="dMap"><h2 id="dMap">Location</h2>' +
          '<div class="map-ph" role="img" aria-label="Map placeholder for ' + esc(fullLocation(l)) + '"><div class="map-grid" aria-hidden="true"></div><div class="map-pin" aria-hidden="true">' + icon("pin") + "</div>" +
          '<div class="map-card"><strong>' + esc(fullLocation(l)) + "</strong><span>Exact address shared after booking an inspection</span>" +
          '<a class="link-arrow" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(l.location + ", " + SITE.area + ", Lagos") + '" target="_blank" rel="noopener">Open area in Google Maps' + icon("arrow") + "</a></div></div></section>" +
      "</div>" +

      '<aside class="aside" aria-label="Contact about this property">' +
        '<div class="aside-card">' +
          "<h2>Interested in this home?</h2>" +
          "<p>Ask a question or book a time to see it. We usually reply on WhatsApp in under 15 minutes.</p>" +
          '<div class="agent"><span class="avatar" aria-hidden="true">' + esc(initials(SITE.name)) + "</span><div><strong>" + esc(SITE.name) + "</strong><span>Managing agent · " + esc(SITE.phoneDisplay) + "</span></div></div>" +
          '<a class="btn btn-wa btn-lg btn-block" href="' + esc(waLink(ask)) + '" target="_blank" rel="noopener">' + icon("wa") + "Chat on WhatsApp</a>" +
          '<button type="button" class="btn btn-navy btn-lg btn-block" data-open-booking>' + icon("cal") + "Book Inspection</button>" +
          '<p class="ref">REF ' + l.id.toUpperCase() + "</p>" +
        "</div>" +
        '<div class="aside-trust">' + icon("verified") + "<div><strong>Inspected by our team</strong>Pay only into our corporate account — never a personal one.</div></div>" +
      "</aside></div>" +

      '<section class="similar" aria-labelledby="dSim"><h2 id="dSim">You may also like</h2><div class="grid">' + similar.map(card).join("") + "</div></section>" +
      "</div>" +

      '<div class="actionbar">' +
        '<a class="btn btn-wa" href="' + esc(waLink(ask)) + '" target="_blank" rel="noopener">' + icon("wa") + "WhatsApp</a>" +
        '<button type="button" class="btn btn-navy" data-open-booking>' + icon("cal") + "Book Inspection</button>" +
      "</div>";
    document.body.classList.add("has-actionbar");

    /* gallery: counter + dots follow the swipe position */
    var track = $("#galleryTrack"), counter = $("#galleryCount"), dots = $$(".gallery-dots span");
    track.addEventListener("scroll", function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      counter.textContent = (i + 1) + " / " + l.photos.length;
      dots.forEach(function (d, j) { d.classList.toggle("is-on", i === j); });
    }, { passive: true });

    /* lightbox */
    var lb = $("#lightbox"), lbTrack = $("#lbTrack"), lbCount = $("#lbCount");
    lbTrack.innerHTML = l.photos.map(function (p) { return '<figure class="lb-slide"><div class="media">' + img(p[0], p[1], "100vw") + "</div><figcaption>" + esc(p[1]) + "</figcaption></figure>"; }).join("");
    var lbIndex = function () { return Math.round(lbTrack.scrollLeft / lbTrack.clientWidth); };
    var lbGo = function (i) { i = (i + l.photos.length) % l.photos.length; lbTrack.scrollTo({ left: i * lbTrack.clientWidth, behavior: reduced ? "auto" : "smooth" }); };
    lbTrack.addEventListener("scroll", function () { lbCount.textContent = (lbIndex() + 1) + " / " + l.photos.length; }, { passive: true });
    $$("[data-index]", mount).forEach(function (b) {
      b.addEventListener("click", function () {
        lb.showModal();
        lbTrack.scrollLeft = Number(b.getAttribute("data-index")) * lbTrack.clientWidth;
        lbCount.textContent = (Number(b.getAttribute("data-index")) + 1) + " / " + l.photos.length;
      });
    });
    $(".lb-prev", lb).addEventListener("click", function () { lbGo(lbIndex() - 1); });
    $(".lb-next", lb).addEventListener("click", function () { lbGo(lbIndex() + 1); });
    lb.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") lbGo(lbIndex() - 1); if (e.key === "ArrowRight") lbGo(lbIndex() + 1); });

    /* video: load the player only on request, keeping the page light */
    $(".video-poster", mount).addEventListener("click", function () {
      if (!l.video) { window.open(waLink(tourAsk), "_blank", "noopener"); return; }
      $("#video").innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(l.video) + '?autoplay=1&rel=0" title="Video tour of ' + esc(l.title) + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    });

    /* booking modal */
    var modal = $("#bookingModal"), modalMount = $("[data-booking-mount]", modal);
    $$("[data-open-booking]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); mountBooking(modalMount, l.id); modal.showModal(); var f = $("input", modalMount); if (f) f.focus(); });
    });
  }

  function initDialogs() {
    $$("dialog").forEach(function (d) {
      $$("[data-close]", d).forEach(function (b) { b.addEventListener("click", function () { d.close(); }); });
      d.addEventListener("click", function (e) { if (e.target === d && !d.classList.contains("lightbox")) d.close(); });
    });
  }

  /* ---------------------------------------------------------------- boot */
  applySite();
  initHeader();
  initDialogs();
  if (document.body.getAttribute("data-page") === "home") {
    initListings();
    initQuotes();
    var bm = $("[data-booking-mount]"); if (bm) mountBooking(bm, new URLSearchParams(location.search).get("property"));
    initLandlordForm();
  } else {
    initProperty();
  }
  initReveal();
})();
