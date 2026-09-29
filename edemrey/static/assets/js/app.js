/* ==========================================================================
   Edmery Homes and Properties — static site behaviour
   --------------------------------------------------------------------------
   Content lives in ../data/content.js. This file only renders it:
     1. Helpers           5. Carousel           9. Mobile menu + header
     2. Components        6. Inquiry form      10. Router (detail view)
     3. Home sections     7. Property detail   11. Reveal-on-scroll
     4. Listings + search 8. Map facade        12. Boot
   ========================================================================== */

import {
  BUSINESS, NAV, CATEGORIES, PROPERTY_TYPES, BUDGETS, PROPERTIES,
  SERVICES, VALUES, STEPS, TESTIMONIALS, ABOUT, TEAM, INTERESTS,
} from "../data/content.js";
import { iconSvg } from "../data/icons.js";
import {
  formatPrice, formatPriceLong, formatSize, LOCATIONS, filterProperties, getProperty,
  relatedProperties, telHref, waHref, fullAddress, validateInquiry, submitInquiry,
} from "../data/lib.js";

/* 1. Helpers --------------------------------------------------------------- */
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const IMG = (file) => `assets/img/${file}`;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const icon = iconSvg;
const initials = (name) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const announce = (msg) => { const el = $("[data-announce]"); el.textContent = ""; setTimeout(() => (el.textContent = msg), 50); };
const stars = (n) => `<span class="stars" aria-label="${n} out of 5 stars">${icon("star").repeat(Math.round(n))}</span>`;
const brandMark = `<svg class="brand__mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#C9A24B"/><path d="M9 19 20 10l11 9" stroke="#0B1F3A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 30V19h11M14 24.5h9M14 30h11" stroke="#0B1F3A" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>`;

/** Replace every <span data-icon="name"> placeholder in the static HTML with its SVG. */
function hydrateIcons(root = document) {
  $$("[data-icon]", root).forEach((el) => { el.outerHTML = icon(el.dataset.icon, el.dataset.cls || "icon"); });
}

const statusClass = (s) => ({ "For Sale": "tag--sale", "For Rent": "tag--rent" }[s] || "tag--commercial");

/* 2. Components (pure functions returning HTML strings) ------------------- */
function PropertyMeta(p) {
  const items = [];
  if (p.beds) items.push(`<li>${icon("bed")}<span>${p.beds} <span class="sr-only">bedrooms</span><span aria-hidden="true">Beds</span></span></li>`);
  if (p.baths) items.push(`<li>${icon("bath")}<span>${p.baths} <span class="sr-only">bathrooms</span><span aria-hidden="true">Baths</span></span></li>`);
  items.push(`<li>${icon("area")}<span>${formatSize(p.size)}</span></li>`);
  return `<ul class="meta">${items.join("")}</ul>`;
}

function PropertyCard(p, i = 0) {
  const href = `#/property/${p.id}`;
  return `
  <article class="card reveal" style="--d:${(i % 4) * 0.06}s">
    <div class="card__media">
      <img src="${IMG(p.images[0])}" alt="${esc(p.title)} in ${esc(p.location)}" width="1200" height="800" loading="lazy" decoding="async">
      <span class="tag card__tag ${statusClass(p.status)}">${esc(p.status)}</span>
      <span class="card__cat">${esc(p.category)}</span>
    </div>
    <div class="card__body">
      <p class="card__price"><span class="sr-only">${formatPriceLong(p.price, p.period)}</span><span aria-hidden="true">${formatPrice(p.price)}${p.period ? `<small>${p.period}</small>` : ""}</span></p>
      <h3 class="card__title"><a href="${href}">${esc(p.title)}</a></h3>
      <p class="card__loc">${icon("pin")}${esc(p.location)}</p>
      ${PropertyMeta(p)}
      <div class="card__cta"><a class="btn btn--outline btn--sm" href="${href}" tabindex="-1" aria-hidden="true">View Details ${icon("arrowRight")}</a></div>
    </div>
  </article>`;
}

const ServiceCard = (s, i) => `
  <li class="reveal" style="--d:${(i % 3) * 0.07}s"><article class="service">
    <div class="service__icon">${icon(s.icon)}</div>
    <h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>
  </article></li>`;

const ValueCard = (v, i) => `
  <li class="value reveal" style="--d:${i * 0.07}s">
    <div class="value__icon">${icon(v.icon)}</div>
    <h3>${esc(v.title)}</h3><p>${esc(v.text)}</p>
  </li>`;

const StepItem = (s, i) => `
  <li class="step reveal" style="--d:${i * 0.1}s">
    <span class="step__num" aria-hidden="true">${i + 1}</span>
    <h3><span class="sr-only">Step ${i + 1}: </span>${esc(s.title)}</h3><p>${esc(s.text)}</p>
  </li>`;

const ReviewCard = (t, i) => `
  <li class="review" id="review-${i}" aria-roledescription="slide" aria-label="${i + 1} of ${TESTIMONIALS.length}">
    <div class="review__top">${icon("quote", "icon review__quote")}${stars(t.rating)}</div>
    <blockquote><p>${esc(t.text)}</p></blockquote>
    <footer>
      <span class="avatar" aria-hidden="true">${initials(t.name)}</span>
      <span><cite>${esc(t.name)}</cite><span class="role">${esc(t.role)}</span></span>
    </footer>
  </li>`;

const MemberCard = (m) => `
  <li class="member">
    <div class="member__photo">${m.photo ? `<img src="${IMG(m.photo)}" alt="${esc(m.name)}" loading="lazy">` : icon("user")}</div>
    <div class="member__body"><h4>${esc(m.name)}</h4><p>${esc(m.role)}</p></div>
  </li>`;

/** Inquiry form. `id` keeps field ids unique when two forms exist on a page. */
function InquiryForm({ id, property = null, compact = false }) {
  const f = (name) => `${id}-${name}`;
  const preset = property ? interestFor(property) : "";
  const opts = INTERESTS.map((o) => `<option ${o === preset ? "selected" : ""}>${esc(o)}</option>`).join("");
  const field = (name, label, control, optional = false) => `
    <div class="field" data-field="${name}">
      <label for="${f(name)}">${label}${optional ? ' <span class="optional">(optional)</span>' : ""}</label>
      ${control}
      <p class="field__error" id="${f(name)}-err"></p>
    </div>`;
  return `
    <h3>${property ? "Enquire about this property" : "Send us an enquiry"}</h3>
    <p>${property ? "Ask a question or book an inspection." : "We usually reply within the hour, day or night."}</p>
    <form class="form" novalidate data-form="${id}" ${property ? `data-property="${property.id}"` : ""}>
      <div class="form__row">
        ${field("name", "Full name", `<input class="input" id="${f("name")}" name="name" autocomplete="name" required aria-describedby="${f("name")}-err">`)}
        ${field("phone", "Phone number", `<input class="input" id="${f("phone")}" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="0802 090 2599" required aria-describedby="${f("phone")}-err">`)}
      </div>
      <div class="form__row">
        ${field("email", "Email", `<input class="input" id="${f("email")}" name="email" type="email" autocomplete="email" aria-describedby="${f("email")}-err">`, true)}
        ${field("interest", "I'm interested in", `<select class="select" id="${f("interest")}" name="interest" required aria-describedby="${f("interest")}-err"><option value="">Choose one…</option>${opts}</select>`)}
      </div>
      ${field("message", "Message", `<textarea class="textarea" id="${f("message")}" name="message" rows="${compact ? 3 : 4}" placeholder="${property ? "I'd like to inspect this property on…" : "Budget, preferred area, move-in date…"}" aria-describedby="${f("message")}-err"></textarea>`, true)}
      <div class="form__alert" data-form-alert role="alert" hidden></div>
      <div class="form__foot">
        <button class="btn btn--gold btn--block" type="submit">${property ? "Request an inspection" : "Send enquiry"} ${icon("arrowRight")}</button>
        <p class="form__note">${icon("shield")}<span>Your details are only used to respond to your enquiry.</span></p>
      </div>
    </form>`;
}

function interestFor(p) {
  if (p.category !== "Residential") return "Commercial or industrial space";
  return p.status === "For Rent" ? "Renting a property" : "Buying a property";
}

/* 3. Home sections ------------------------------------------------------------ */
function renderStatic() {
  const navItem = (n) => `<li><a href="#${n.id}" data-nav-link="${n.id}">${esc(n.label)}</a></li>`;
  $("[data-nav]").innerHTML = NAV.map(navItem).join("");
  $("[data-nav-mobile]").innerHTML = NAV.map((n) => `<li><a href="#${n.id}">${esc(n.label)}${icon("arrowRight")}</a></li>`).join("");
  $$("[data-phone]").forEach((el) => (el.innerHTML = `<a href="${telHref()}">${BUSINESS.phoneDisplay}</a>`));
  $$("[data-tel]").forEach((el) => (el.href = telHref()));
  $$("[data-google]").forEach((el) => (el.href = BUSINESS.googleUrl));
  $$("[data-stars]").forEach((el) => (el.outerHTML = stars(+el.dataset.stars)));

  // search options
  $("#s-area").insertAdjacentHTML("beforeend", LOCATIONS.map((l) => `<option>${esc(l)}</option>`).join(""));
  $("#s-type").insertAdjacentHTML("beforeend", PROPERTY_TYPES.map((t) => `<option>${esc(t)}</option>`).join(""));
  $("#s-budget").innerHTML = BUDGETS.map((b) => `<option value="${b.id}">${esc(b.label)}</option>`).join("");

  // trust bar
  const trust = [
    { icon: "star", value: `${BUSINESS.rating}★`, label: "Google rating" },
    { icon: "checkCircle", value: `${BUSINESS.reviewCount}`, label: "Verified reviews" },
    { icon: "clock", value: "24/7", label: BUSINESS.hours },
    { icon: "pin", value: "Lekki", label: "Based in Lagos" },
  ];
  $("[data-trust]").innerHTML = trust.map((t) => `
    <li class="trust__item"><span class="trust__icon">${icon(t.icon)}</span>
      <span><span class="trust__value">${esc(t.value)}</span><br><span class="trust__label">${esc(t.label)}</span></span></li>`).join("");

  $("[data-services]").innerHTML = SERVICES.map(ServiceCard).join("");
  $("[data-values]").innerHTML = VALUES.map(ValueCard).join("");
  $("[data-steps]").innerHTML = STEPS.map(StepItem).join("");
  $("[data-team]").innerHTML = TEAM.map(MemberCard).join("");

  // about
  $("[data-about-img]").src = IMG(ABOUT.image);
  $("[data-about-story]").textContent = ABOUT.story;
  $("[data-about-story2]").textContent = ABOUT.story2;
  $("[data-about-mission]").textContent = ABOUT.mission;

  renderContactCard();
  renderFooter();
  $("[data-mobile-bar]").innerHTML = `
    <a class="btn btn--navy" href="${telHref()}">${icon("phone")} Call</a>
    <a class="btn btn--whatsapp" href="${waHref()}" target="_blank" rel="noopener">${icon("whatsapp")} WhatsApp</a>`;
}

function renderContactCard() {
  $("[data-contact-card]").innerHTML = `
    <div><h3>Speak to an agent now</h3><p style="color:var(--on-navy-soft);margin-top:.4rem">Calls and WhatsApp answered around the clock.</p></div>
    <div class="contact-card__actions">
      <a class="btn btn--gold" href="${telHref()}">${icon("phone")} Call ${BUSINESS.phoneDisplay}</a>
      <a class="btn btn--whatsapp" href="${waHref()}" target="_blank" rel="noopener">${icon("whatsapp")} Chat on WhatsApp</a>
    </div>
    <ul class="contact-list">
      <li>${icon("pin")}<div><strong>Office</strong><address style="font-style:normal">${esc(BUSINESS.address.line1)}<br>${esc(BUSINESS.address.line2)}, ${esc(BUSINESS.address.city)} ${esc(BUSINESS.address.postcode)}</address>
        <a class="link-arrow" style="color:var(--white);margin-top:.4rem" href="${BUSINESS.directionsUrl}" target="_blank" rel="noopener">Get directions ${icon("arrowRight")}</a></div></li>
      <li>${icon("clock")}<div><strong>Hours</strong><span class="open-now">${esc(BUSINESS.hours)}, 7 days a week</span></div></li>
      ${BUSINESS.email ? `<li>${icon("mail")}<div><strong>Email</strong><a href="mailto:${esc(BUSINESS.email)}">${esc(BUSINESS.email)}</a></div></li>` : ""}
    </ul>
    <div class="map" data-map>
      <button class="map__facade" type="button" data-map-load>
        <span class="pin">${icon("pin")}</span>
        <span>Polystar Building, Lekki</span>
        <small>Tap to load the map</small>
      </button>
    </div>`;
}

function renderFooter() {
  const soc = Object.entries(BUSINESS.social).map(([k, url]) =>
    `<a href="${esc(url || "#")}" ${url ? 'target="_blank" rel="noopener"' : ""} aria-label="Edmery Homes on ${k === "x" ? "X" : k[0].toUpperCase() + k.slice(1)}">${icon(k)}</a>`).join("");
  $("[data-footer]").innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <a class="brand" href="#home">${brandMark}<span class="brand__text"><span class="brand__name">Edmery</span><span class="brand__sub">Homes &amp; Properties</span></span></a>
          <p>Residential, commercial and industrial real estate in Lekki and across Lagos. Reliable advice, smooth transactions.</p>
          <div class="socials">${soc}</div>
        </div>
        <nav aria-label="Footer"><h2>Quick links</h2><ul>${NAV.map((n) => `<li><a href="#${n.id}">${esc(n.label)}</a></li>`).join("")}</ul></nav>
        <div><h2>Contact</h2><ul class="footer-contact">
          <li>${icon("pin")}<span>${esc(fullAddress())}</span></li>
          <li>${icon("phone")}<a href="${telHref()}">${BUSINESS.phoneDisplay}</a></li>
          <li>${icon("whatsapp")}<a href="${waHref()}" target="_blank" rel="noopener">WhatsApp us</a></li>
          <li>${icon("clock")}<span>${esc(BUSINESS.hours)}</span></li>
        </ul></div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${esc(BUSINESS.name)}. All rights reserved.</span>
        <span>Lekki, Lagos, Nigeria</span>
      </div>
    </div>`;
}

/* 4. Listings + search -------------------------------------------------------- */
const state = { category: "all", area: "", type: "", budget: "any" };

function renderChips() {
  const count = (c) => PROPERTIES.filter((p) => c === "all" || p.category === c).length;
  $("[data-chips]").innerHTML = ["all", ...CATEGORIES].map((c) => `
    <button class="chip" type="button" data-chip="${c}" aria-pressed="${state.category === c}">
      ${c === "all" ? "All" : esc(c)}<span class="chip__count">${count(c)}</span>
    </button>`).join("");
}

function renderGrid() {
  const list = filterProperties(PROPERTIES.filter((p) => p.featured), state);
  const grid = $("[data-grid]");
  grid.innerHTML = list.length
    ? list.map(PropertyCard).join("")
    : `<div class="empty" style="grid-column:1/-1"><h3>No matching properties right now</h3>
        <p>New listings arrive every week and many never reach the internet. Tell us what you need.</p>
        <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
          <button class="btn btn--outline" type="button" data-clear>Clear filters</button>
          <a class="btn btn--gold" href="#contact">Ask an agent</a></div></div>`;
  observeReveals(grid);

  const searching = state.area || state.type || state.budget !== "any";
  const bar = $("[data-results]");
  bar.hidden = !searching;
  if (searching) {
    const parts = [state.type, state.area && `in ${state.area}`, state.budget !== "any" && BUDGETS.find((b) => b.id === state.budget).label].filter(Boolean);
    bar.innerHTML = `<span><strong>${list.length}</strong> ${list.length === 1 ? "property" : "properties"} · ${esc(parts.join(" · "))}</span><button type="button" data-clear>Clear search</button>`;
  }
  return list.length;
}

function bindListings() {
  $("[data-chips]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-chip]");
    if (!b) return;
    state.category = b.dataset.chip;
    renderChips();
    const n = renderGrid();
    announce(`${n} ${state.category === "all" ? "" : state.category.toLowerCase() + " "}properties shown`);
  });
  $("#properties").addEventListener("click", (e) => {
    if (!e.target.closest("[data-clear]")) return;
    Object.assign(state, { category: "all", area: "", type: "", budget: "any" });
    $("#search").reset();
    renderChips();
    announce(`${renderGrid()} properties shown`);
  });
  $("#search").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    Object.assign(state, { area: fd.get("area"), type: fd.get("type"), budget: fd.get("budget"), category: "all" });
    renderChips();
    const n = renderGrid();
    announce(`${n} ${n === 1 ? "property matches" : "properties match"} your search`);
    $("#properties").scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
  });
}

/* 5. Carousel ------------------------------------------------------------------- */
function mountCarousel() {
  const root = $("[data-carousel]");
  const track = $("[data-track]", root);
  track.innerHTML = TESTIMONIALS.map(ReviewCard).join("");
  const slides = $$(".review", track);
  const dots = $("[data-dots]", root);
  dots.innerHTML = slides.map((_, i) => `<button class="carousel__dot" type="button" aria-controls="review-${i}"><span class="sr-only">Show review ${i + 1}</span></button>`).join("");
  const prev = $("[data-prev]", root), next = $("[data-next]", root);

  const step = () => slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16);
  const index = () => Math.round(track.scrollLeft / step());
  const go = (i) => track.scrollTo({ left: i * step(), behavior: reducedMotion() ? "auto" : "smooth" });
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    root.classList.toggle("is-static", max <= 2);
    const i = index();
    $$(".carousel__dot", dots).forEach((d, j) => d.setAttribute("aria-current", String(j === i)));
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  };
  prev.addEventListener("click", () => go(index() - 1));
  next.addEventListener("click", () => go(index() + 1));
  dots.addEventListener("click", (e) => { const d = e.target.closest(".carousel__dot"); if (d) go($$(".carousel__dot", dots).indexOf(d)); });
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(index() + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index() - 1); }
  });
  let raf;
  track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener("resize", update);
  update();
}

/* 6. Inquiry form ------------------------------------------------------------------ */
function mountForm(container, { id, property = null, compact = false }) {
  container.innerHTML = InquiryForm({ id, property, compact });
  const form = $("form", container);
  let attempted = false;

  const values = () => Object.fromEntries(new FormData(form));
  const paint = (errors) => {
    $$("[data-field]", form).forEach((wrap) => {
      const name = wrap.dataset.field;
      const msg = errors[name] || "";
      const ctl = form.elements[name];
      wrap.classList.toggle("field--invalid", !!msg);
      ctl.setAttribute("aria-invalid", String(!!msg));
      $(".field__error", wrap).innerHTML = msg ? `${icon("close")}${esc(msg)}` : "";
    });
  };

  // live re-validation after the first submit attempt
  form.addEventListener("input", () => attempted && paint(validateInquiry(values())));
  form.addEventListener("focusout", () => attempted && paint(validateInquiry(values())));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    attempted = true;
    const v = values();
    const errors = validateInquiry(v);
    paint(errors);
    const bad = Object.keys(errors);
    if (bad.length) {
      form.elements[bad[0]].focus();
      announce(`Please check ${bad.length} ${bad.length === 1 ? "field" : "fields"}.`);
      return;
    }
    const btn = $("button[type=submit]", form);
    const alertBox = $("[data-form-alert]", form);
    btn.disabled = true;
    alertBox.hidden = true;
    try {
      const res = await submitInquiry(v, property);
      if (res.via === "whatsapp") window.open(res.href, "_blank", "noopener");
      showSuccess(container, v, res, { id, property, compact });
    } catch {
      alertBox.hidden = false;
      alertBox.innerHTML = `Sorry, we couldn't send that. Please call <a href="${telHref()}">${BUSINESS.phoneDisplay}</a> or <a href="${waHref()}" target="_blank" rel="noopener">WhatsApp us</a>.`;
      btn.disabled = false;
    }
  });
}

function showSuccess(container, v, res, opts) {
  const first = esc(v.name.trim().split(/\s+/)[0]);
  const viaWa = res.via === "whatsapp";
  container.innerHTML = `
    <div class="form-success" tabindex="-1">
      <div class="form-success__icon">${icon("check")}</div>
      <h3>Thank you, ${first}!</h3>
      <p>${viaWa
        ? "Your enquiry is ready in WhatsApp. Just tap send and an agent will reply shortly. If WhatsApp didn't open, use the button below."
        : `We've received your enquiry and an agent will call you on ${esc(v.phone)} shortly.`}</p>
      <div class="actions">
        ${viaWa ? `<a class="btn btn--whatsapp" href="${res.href}" target="_blank" rel="noopener">${icon("whatsapp")} Open WhatsApp</a>` : ""}
        <a class="btn btn--outline" href="${telHref()}">${icon("phone")} Call us now</a>
      </div>
      <button class="btn btn--sm" type="button" data-again style="text-decoration:underline">Send another enquiry</button>
    </div>`;
  const box = $(".form-success", container);
  box.focus();
  announce("Enquiry ready. Thank you.");
  $("[data-again]", container).addEventListener("click", () => { mountForm(container, opts); $("input", container).focus(); });
}

/* 7. Property detail ---------------------------------------------------------------- */
function DetailView(p) {
  const facts = [
    p.beds && { icon: "bed", v: p.beds, l: "Bedrooms" },
    p.baths && { icon: "bath", v: p.baths, l: p.category === "Residential" ? "Bathrooms" : "Toilets" },
    { icon: "area", v: formatSize(p.size), l: "Size" },
    { icon: "building", v: p.type, l: "Property type" },
    { icon: "key", v: p.status, l: "Status" },
  ].filter(Boolean).slice(0, 4);
  const waText = `Hello Edmery Homes, I'm interested in "${p.title}" (${p.location}). Is it still available?`;
  return `
  <article class="detail view-enter">
    <div class="container">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#properties">${icon("arrowLeft")} Back to properties</a></nav>
      <header class="detail__head">
        <div>
          <span class="tag ${statusClass(p.status)}">${esc(p.status)}</span>
          <h1 tabindex="-1" data-detail-title>${esc(p.title)}</h1>
          <p class="detail__loc">${icon("pin")}${esc(p.location)}</p>
        </div>
        <p class="detail__price">${formatPrice(p.price, p.period)}<small>${formatPriceLong(p.price, p.period)}</small></p>
      </header>
      <div class="detail__layout">
        <div>
          <div class="gallery" data-gallery>
            <div class="gallery__main" tabindex="0" aria-roledescription="carousel" aria-label="Photos of ${esc(p.title)}. Use arrow keys to browse.">
              <img data-gallery-img src="${IMG(p.images[0])}" alt="${esc(p.title)}, photo 1 of ${p.images.length}" width="1200" height="800" decoding="async">
              ${p.images.length > 1 ? `
              <button class="gallery__nav gallery__nav--prev" type="button" data-g-prev><span class="sr-only">Previous photo</span>${icon("chevronLeft")}</button>
              <button class="gallery__nav gallery__nav--next" type="button" data-g-next><span class="sr-only">Next photo</span>${icon("chevronRight")}</button>` : ""}
              <span class="gallery__count" data-g-count aria-hidden="true">1 / ${p.images.length}</span>
            </div>
            ${p.images.length > 1 ? `<ul class="gallery__thumbs">${p.images.map((img, i) => `
              <li><button class="gallery__thumb" type="button" data-g-thumb="${i}" aria-current="${i === 0}"><img src="${IMG(img)}" alt="" loading="lazy" decoding="async"><span class="sr-only">Show photo ${i + 1}</span></button></li>`).join("")}</ul>` : ""}
          </div>
          <ul class="facts">${facts.map((f) => `<li>${icon(f.icon)}<strong>${esc(f.v)}</strong><span>${esc(f.l)}</span></li>`).join("")}</ul>
          <section class="detail__section"><h2>About this property</h2><p>${esc(p.description)}</p></section>
          <section class="detail__section"><h2>Features</h2><ul class="features">${p.features.map((x) => `<li>${icon("checkCircle")}<span>${esc(x)}</span></li>`).join("")}</ul></section>
        </div>
        <aside class="detail__aside" aria-label="Contact an agent">
          <div class="agent">
            <div class="agent__head">${brandMark}<div><strong>Edmery Homes agent</strong><span>Lekki office · replies fast</span></div></div>
            <div class="agent__actions">
              <a class="btn btn--gold btn--sm" href="${telHref()}">${icon("phone")} Call</a>
              <a class="btn btn--whatsapp btn--sm" href="${waHref(waText)}" target="_blank" rel="noopener">${icon("whatsapp")} WhatsApp</a>
            </div>
            <small>${icon("clock")} ${esc(BUSINESS.hours)} · ${BUSINESS.phoneDisplay}</small>
          </div>
          <div class="form-card" data-form-mount="detail"></div>
        </aside>
      </div>
      <section class="related" aria-labelledby="related-title">
        <h2 id="related-title">You may also like</h2>
        <div class="grid-props grid-props--3">${relatedProperties(p).map(PropertyCard).join("")}</div>
      </section>
    </div>
  </article>`;
}

function NotFound() {
  return `<div class="detail"><div class="container not-found"><h1 tabindex="-1" data-detail-title>That listing is no longer available</h1>
    <p>It may have been sold or let. Browse our current properties, or tell us what you need.</p>
    <a class="btn btn--gold" href="#properties">Browse properties</a></div></div>`;
}

function mountGallery(root, p) {
  let i = 0;
  const img = $("[data-gallery-img]", root);
  const show = (n) => {
    i = (n + p.images.length) % p.images.length;
    img.src = IMG(p.images[i]);
    img.alt = `${p.title}, photo ${i + 1} of ${p.images.length}`;
    const c = $("[data-g-count]", root); if (c) c.textContent = `${i + 1} / ${p.images.length}`;
    $$("[data-g-thumb]", root).forEach((t, j) => t.setAttribute("aria-current", String(j === i)));
  };
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-g-prev]")) show(i - 1);
    else if (e.target.closest("[data-g-next]")) show(i + 1);
    else { const t = e.target.closest("[data-g-thumb]"); if (t) show(+t.dataset.gThumb); }
  });
  const main = $(".gallery__main", root);
  main.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(i + 1);
    if (e.key === "ArrowLeft") show(i - 1);
  });
  // swipe
  let x0 = null;
  main.addEventListener("pointerdown", (e) => { x0 = e.clientX; });
  main.addEventListener("pointerup", (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
  });
}

/* 8. Map facade: only loads Google Maps (~1MB) when asked ------------------------ */
function bindMap() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-map-load]");
    if (!btn) return;
    btn.outerHTML = `<iframe src="${BUSINESS.mapEmbed}" title="Map showing Edmery Homes at Polystar Building, Lekki" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
  });
}

/* 9. Mobile menu + header ------------------------------------------------------------- */
function bindHeader() {
  const header = $("#site-header");
  const menu = $("#mobile-menu");
  const openBtn = $("[data-menu-open]");
  let lastFocus = null;

  const onScroll = () => header.classList.toggle("is-solid", scrollY > 24 || !$("#detail-view").hidden);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const focusables = () => $$("a[href], button:not([disabled])", menu);
  const open = () => {
    lastFocus = document.activeElement;
    menu.classList.add("is-open");
    document.body.classList.add("menu-open");
    openBtn.setAttribute("aria-expanded", "true");
    setTimeout(() => focusables()[1]?.focus(), 50);
  };
  const close = (restore = true) => {
    if (!menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    openBtn.setAttribute("aria-expanded", "false");
    if (restore) lastFocus?.focus();
  };
  openBtn.addEventListener("click", open);
  $("[data-menu-close]").addEventListener("click", () => close());
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) close(false); });
  document.addEventListener("keydown", (e) => {
    if (!menu.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") { // focus trap
      const f = focusables(), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  matchMedia("(min-width: 1024px)").addEventListener("change", (m) => m.matches && close(false));

  // skip link: focus <main> without changing the hash (which would leave a detail page)
  $(".skip-link").addEventListener("click", (e) => { e.preventDefault(); $("#main").focus(); });

  // "Book a Viewing" preselects the interest on the contact form
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-book]")) return;
    const sel = $('[data-form="contact"] select[name="interest"]');
    if (sel && !sel.value) sel.value = "Buying a property";
  });

  // highlight the nav link for the section in view
  const links = $$("[data-nav-link]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((l) => l.setAttribute("aria-current", String(l.dataset.navLink === en.target.id)));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  NAV.forEach((n) => { const s = document.getElementById(n.id); if (s) io.observe(s); });
}

/* 10. Router ---------------------------------------------------------------------------- */
const HOME_TITLE = document.title;
let homeScroll = 0;

function route() {
  const m = location.hash.match(/^#\/property\/([\w-]+)/);
  const home = $("#home-view"), detail = $("#detail-view");
  if (m) {
    if (detail.hidden) homeScroll = scrollY;
    const p = getProperty(m[1]);
    detail.innerHTML = p ? DetailView(p) : NotFound();
    hydrateIcons(detail);
    home.hidden = true;
    detail.hidden = false;
    $$("[data-nav-link]").forEach((l) => l.setAttribute("aria-current", "false"));
    document.title = p ? `${p.title}, ${p.location} | Edmery Homes` : `Listing not found | Edmery Homes`;
    if (p) {
      mountGallery($("[data-gallery]", detail), p);
      mountForm($("[data-form-mount='detail']", detail), { id: "detail", property: p, compact: true });
    }
    observeReveals(detail);
    scrollTo({ top: 0, behavior: "instant" });
    $("[data-detail-title]", detail)?.focus({ preventScroll: true });
  } else {
    const wasDetail = !detail.hidden;
    detail.hidden = true;
    detail.innerHTML = "";
    home.hidden = false;
    document.title = HOME_TITLE;
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (wasDetail) {
      if (target) target.scrollIntoView({ behavior: "instant" });
      else scrollTo({ top: homeScroll, behavior: "instant" });
    }
  }
  dispatchEvent(new Event("scroll"));
}

/* 11. Reveal-on-scroll --------------------------------------------------------------------- */
let revealIO;
function observeReveals(root = document) {
  const els = $$(".reveal:not(.is-in)", root);
  if (!("IntersectionObserver" in window) || reducedMotion()) { els.forEach((el) => el.classList.add("is-in")); return; }
  revealIO ??= new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); revealIO.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  els.forEach((el) => revealIO.observe(el));
}

/* 12. Boot -------------------------------------------------------------------------------- */
renderStatic();
renderChips();
renderGrid();
bindListings();
mountCarousel();
mountForm($("[data-form-mount='contact']"), { id: "contact" });
bindMap();
hydrateIcons();
bindHeader();
observeReveals();
addEventListener("hashchange", route);
route();
