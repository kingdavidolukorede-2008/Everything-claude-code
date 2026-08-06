/* ==========================================================================
   Omojowo Integrated Farms — site behaviour
   Plain ES2019, no dependencies. Every module fails soft.
   ========================================================================== */
(function () {
  "use strict";

  var WA = "2348000000000";
  var FREE_DELIVERY = 25000;      // ₦ threshold for free Ikorodu delivery
  var STORE_KEY = "omojowo.cart.v1";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------- catalogue */
  var PRODUCTS = [
    { id:"eggs",  arm:"Poultry",    c:"var(--maize)", name:"Table eggs",           unit:"Crate of 30",         price:5200,  note:"Collected daily" },
    { id:"broil", arm:"Poultry",    c:"var(--maize)", name:"Live broiler",         unit:"Per bird, 2.0–2.4kg", price:9500,  note:"Catch it yourself or we dress it" },
    { id:"dress", arm:"Poultry",    c:"var(--maize)", name:"Dressed chicken",      unit:"Per kg, chilled",     price:4800,  note:"From our cold room" },
    { id:"cat",   arm:"Ponds",      c:"var(--pond)",  name:"Fresh catfish",        unit:"Per kg, live",        price:4200,  note:"Harvested to order" },
    { id:"smoke", arm:"Ponds",      c:"var(--pond)",  name:"Smoked catfish",       unit:"Per kg",              price:12000, note:"Firewood smokehouse" },
    { id:"ugu",   arm:"Crops",      c:"var(--field)", name:"Ugu (fluted pumpkin)", unit:"Large bunch",         price:1200,  note:"Cut this morning" },
    { id:"corn",  arm:"Crops",      c:"var(--field)", name:"Sweet corn",           unit:"Dozen cobs",          price:3500,  note:"In season Jun–Sep", badge:"Seasonal" },
    { id:"plant", arm:"Crops",      c:"var(--field)", name:"Plantain",             unit:"Full bunch",          price:6000,  note:"Green or ripe" },
    { id:"garri", arm:"Processing", c:"var(--clay)",  name:"Garri (ijebu)",        unit:"5kg bag",             price:7500,  note:"Milled and sieved here" },
    { id:"flour", arm:"Processing", c:"var(--clay)",  name:"Cassava flour",        unit:"5kg bag",             price:8200,  note:"Odourless, sun-dried" },
    { id:"comp",  arm:"Processing", c:"var(--clay)",  name:"Composted litter",     unit:"50kg sack",           price:4000,  note:"For your own garden" },
    { id:"fing",  arm:"Ponds",      c:"var(--pond)",  name:"Catfish fingerlings",  unit:"Per 1,000",           price:35000, note:"For out-growers" }
  ];

  var naira = function (n) { return "₦" + n.toLocaleString("en-NG"); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[m];
    });
  };

  var live = $("#liveRegion");
  var announce = function (msg) { if (live) live.textContent = msg; };

  /* ---------------------------------------------------------------- cart state */
  var cart = load();

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      var clean = {};
      PRODUCTS.forEach(function (p) {
        var q = parseInt(raw[p.id], 10);
        if (q > 0) clean[p.id] = Math.min(q, 999);
      });
      return clean;
    } catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch (e) { /* private mode */ }
  }

  /* ---------------------------------------------------------------- shop grid */
  var grid = $("#shopGrid");

  if (grid) {
    grid.innerHTML = PRODUCTS.map(function (p) {
      return '' +
      '<article class="card" data-arm="' + esc(p.arm) + '" data-card="' + p.id + '" style="--c:' + p.c + '">' +
        (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '') +
        '<div class="tag"><i></i>' + esc(p.arm) + '</div>' +
        '<h3 id="n-' + p.id + '">' + esc(p.name) + '</h3>' +
        '<div class="unit">' + esc(p.unit) + ' · ' + esc(p.note) + '</div>' +
        '<div class="price">' + naira(p.price) + '<small>farm gate</small></div>' +
        '<div class="stepper">' +
          '<button type="button" data-act="-" data-id="' + p.id + '" aria-label="Remove one ' + esc(p.name) + '">−</button>' +
          '<output id="q-' + p.id + '" aria-live="off" aria-labelledby="n-' + p.id + '">0</output>' +
          '<button type="button" data-act="+" data-id="' + p.id + '" aria-label="Add one ' + esc(p.name) + '">+</button>' +
        '</div>' +
      '</article>';
    }).join("");

    grid.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-act]");
      if (!b) return;
      var id = b.dataset.id;
      var p = PRODUCTS.filter(function (x) { return x.id === id; })[0];
      var next = Math.max(0, (cart[id] || 0) + (b.dataset.act === "+" ? 1 : -1));

      if (next === 0) delete cart[id]; else cart[id] = next;
      save();
      paintCard(id);
      refresh();

      if (p) {
        announce(next === 0
          ? p.name + " removed from your order."
          : next + " × " + p.name + " in your order.");
      }
      if (b.dataset.act === "+" && !reduced) {
        var card = $('[data-card="' + id + '"]');
        if (card) { card.classList.remove("bump"); void card.offsetWidth; card.classList.add("bump"); }
      }
    });
  }

  function paintCard(id) {
    var out = $("#q-" + id);
    var card = $('[data-card="' + id + '"]');
    var q = cart[id] || 0;
    if (out) out.textContent = q;
    if (card) card.classList.toggle("in-cart", q > 0);
    var minus = $('button[data-act="-"][data-id="' + id + '"]');
    if (minus) minus.disabled = q === 0;
  }

  /* ---------------------------------------------------------------- filters */
  var filterBox = $("#filters");
  var gridEmpty = $("#gridEmpty");
  var activeFilter = "all";

  if (filterBox) {
    var arms = ["all"].concat(PRODUCTS.map(function (p) { return p.arm; })
      .filter(function (a, i, all) { return all.indexOf(a) === i; }));

    filterBox.innerHTML = arms.map(function (a) {
      var n = a === "all" ? PRODUCTS.length
        : PRODUCTS.filter(function (p) { return p.arm === a; }).length;
      return '<button type="button" class="chip" data-filter="' + esc(a) + '" aria-pressed="' +
        (a === "all") + '">' + (a === "all" ? "Everything" : esc(a)) +
        '<span class="cnt">' + n + '</span></button>';
    }).join("");

    filterBox.addEventListener("click", function (e) {
      var c = e.target.closest(".chip");
      if (c) applyFilter(c.dataset.filter);
    });
  }

  if (gridEmpty) {
    gridEmpty.addEventListener("click", function (e) {
      var b = e.target.closest("[data-filter]");
      if (b) applyFilter(b.dataset.filter);
    });
  }

  $$(".arm-link").forEach(function (link) {
    link.addEventListener("click", function () { applyFilter(link.dataset.filter); });
  });

  function applyFilter(arm) {
    activeFilter = arm || "all";
    var shown = 0;
    $$(".card", grid).forEach(function (card) {
      var match = activeFilter === "all" || card.dataset.arm === activeFilter;
      card.hidden = !match;
      if (match) shown++;
    });
    $$(".chip", filterBox).forEach(function (c) {
      c.setAttribute("aria-pressed", String(c.dataset.filter === activeFilter));
    });
    if (gridEmpty) gridEmpty.hidden = shown > 0;
    announce(shown + " product" + (shown === 1 ? "" : "s") +
      (activeFilter === "all" ? " shown." : " in " + activeFilter + "."));
  }

  /* ---------------------------------------------------------------- order bar */
  var bar = $("#orderbar");
  var obTotal = $("#obTotal");
  var obCount = $("#obCount");
  var obSend = $("#obSend");
  var obProgress = $("#obProgress");

  function refresh() {
    var lines = PRODUCTS.filter(function (p) { return cart[p.id] > 0; });
    var total = lines.reduce(function (s, p) { return s + p.price * cart[p.id]; }, 0);
    var items = lines.reduce(function (s, p) { return s + cart[p.id]; }, 0);

    if (obTotal) obTotal.textContent = naira(total);
    if (obCount) {
      var left = FREE_DELIVERY - total;
      obCount.textContent = !items ? "No items yet"
        : items + " item" + (items > 1 ? "s" : "") + " · " +
          (left > 0 ? naira(left) + " more for free Ikorodu delivery"
                    : "Free delivery in Ikorodu ✓");
    }
    if (obProgress) {
      var pct = Math.min(100, Math.round((total / FREE_DELIVERY) * 100));
      obProgress.firstElementChild.style.width = pct + "%";
      obProgress.classList.toggle("done", total >= FREE_DELIVERY);
    }

    if (bar) {
      bar.classList.toggle("up", items > 0);
      document.body.classList.toggle("bar-up", items > 0);
      if (items > 0) {
        document.body.style.setProperty("--bar-h", bar.offsetHeight + "px");
      }
    }

    if (obSend) {
      var msg = "Hello Omojowo Farms, I'd like to order:\n\n" +
        lines.map(function (p) {
          return "• " + cart[p.id] + " × " + p.name + " (" + p.unit + ") — " +
                 naira(p.price * cart[p.id]);
        }).join("\n") +
        "\n\nEstimated total: " + naira(total) +
        "\n\nMy delivery area: ";
      obSend.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
      obSend.setAttribute("aria-disabled", items ? "false" : "true");
    }
  }

  var obClear = $("#obClear");
  if (obClear) {
    obClear.addEventListener("click", function () {
      Object.keys(cart).forEach(function (id) { delete cart[id]; paintCard(id); });
      save();
      refresh();
      announce("Order cleared.");
    });
  }

  // restore persisted quantities on load
  PRODUCTS.forEach(function (p) { paintCard(p.id); });
  refresh();
  window.addEventListener("resize", function () {
    if (bar && document.body.classList.contains("bar-up")) {
      document.body.style.setProperty("--bar-h", bar.offsetHeight + "px");
    }
  });

  /* ---------------------------------------------------------------- ticker */
  var track = $("#tickTrack");
  if (track) {
    var ticks = PRODUCTS.slice(0, 9).map(function (p) {
      return '<span class="tick"><span class="dot" style="background:' + p.c + '"></span>' +
        esc(p.name.toUpperCase()) + ' <b>' + naira(p.price) + '</b> / ' + esc(p.unit.toLowerCase()) +
        '</span>';
    }).join("");
    // second copy is decorative padding for the seamless loop — hide from AT
    track.innerHTML = ticks + '<span aria-hidden="true" style="display:flex;gap:44px">' + ticks + '</span>';
  }

  /* ---------------------------------------------------------------- loop ring */
  var ARM_INFO = {
    crops:   { t:"01 · Crops",   c:"var(--field)", s:"Takes composted litter and pond water. Gives grain to the feed mill, residue to the ponds, and vegetables to the shop the morning they're cut." },
    poultry: { t:"02 · Poultry", c:"var(--maize)", s:"Takes maize and soy grown 200 metres away. Gives eggs, birds, and the litter that fertilises both the ponds and the fields." },
    fish:    { t:"03 · Ponds",   c:"var(--pond)",  s:"Takes crop residue and poultry by-product in the feed blend. Gives catfish, and nitrogen-rich water that irrigates the maize." }
  };
  var HERO_ARCS = { crops:"arc-1", poultry:"arc-2", fish:"arc-3" };
  var DEFAULT_CAP =
    '<div class="lc-title">Tap any arm to trace what it gives</div>' +
    "<p>Nothing leaves this circle as waste. Every output is somebody else's input.</p>";

  var cap = $("#loopCap");
  var nodes = $$(".node");

  function selectArm(node) {
    var wasOn = node.getAttribute("aria-pressed") === "true";
    nodes.forEach(function (n) { n.setAttribute("aria-pressed", "false"); });
    ["arc-1", "arc-2", "arc-3"].forEach(function (id) {
      var a = document.getElementById(id);
      if (a) a.classList.remove("hot");
    });

    if (wasOn) { if (cap) cap.innerHTML = DEFAULT_CAP; return; }

    node.setAttribute("aria-pressed", "true");
    var k = node.dataset.arm, d = ARM_INFO[k];
    var arc = document.getElementById(HERO_ARCS[k]);
    if (arc) arc.classList.add("hot");
    if (cap && d) {
      cap.innerHTML = '<div class="lc-title" style="color:' + d.c + '">' + d.t + "</div><p>" + d.s + "</p>";
    }
  }

  nodes.forEach(function (n) {
    n.addEventListener("click", function () { selectArm(n); });
    n.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); selectArm(n); }
      if (e.key === "Escape" && n.getAttribute("aria-pressed") === "true") selectArm(n);
    });
  });

  /* ---------------------------------------------------------------- dark flows */
  var darkPaths = $$(".dark .arc, .dark .spoke");
  var flows = $$(".flow");
  var pinned = null;

  function paintFlow(id) {
    darkPaths.forEach(function (p) { p.classList.toggle("hot", p.dataset.flow === id); });
    flows.forEach(function (f) { f.classList.toggle("on", f.dataset.flow === id); });
  }

  flows.forEach(function (f) {
    var id = f.dataset.flow;
    var enter = function () { paintFlow(id); };
    var leave = function () { paintFlow(pinned); };
    f.addEventListener("mouseenter", enter);
    f.addEventListener("focus", enter);
    f.addEventListener("mouseleave", leave);
    f.addEventListener("blur", leave);
    f.addEventListener("click", function () {
      pinned = pinned === id ? null : id;
      paintFlow(pinned);
    });
  });

  /* ---------------------------------------------------------------- reveal */
  var rvs = $$(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    rvs.forEach(function (el) { io.observe(el); });
  } else {
    rvs.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------------------------------------------------------- mobile nav */
  var burger = $("#burger");
  var navEl = $("#primaryNav");
  var scrim = $("#navScrim");

  function setMenu(open) {
    if (!burger || !navEl) return;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navEl.classList.toggle("open", open);
    if (scrim) { scrim.hidden = !open; requestAnimationFrame(function () { scrim.classList.toggle("on", open); }); }
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) {
      var first = navEl.querySelector("a");
      if (first) first.focus();
    }
  }
  function menuOpen() { return burger && burger.getAttribute("aria-expanded") === "true"; }

  if (burger) burger.addEventListener("click", function () { setMenu(!menuOpen()); });
  if (scrim) scrim.addEventListener("click", function () { setMenu(false); burger.focus(); });
  if (navEl) navEl.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });

  document.addEventListener("keydown", function (e) {
    if (!menuOpen()) return;
    if (e.key === "Escape") { setMenu(false); burger.focus(); return; }
    if (e.key !== "Tab") return;
    // keep focus inside the drawer (burger is the last stop)
    var items = $$("a", navEl).concat([burger]);
    var i = items.indexOf(document.activeElement);
    if (i === -1) return;
    var next = e.shiftKey ? i - 1 : i + 1;
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    e.preventDefault();
    items[next].focus();
  });

  var mq = window.matchMedia("(min-width: 961px)");
  var onMq = function (e) { if (e.matches && menuOpen()) setMenu(false); };
  if (mq.addEventListener) mq.addEventListener("change", onMq); else mq.addListener(onMq);

  /* ---------------------------------------------------------------- scroll state */
  var header = $("#siteHeader");
  var rail = $("#scrollRail");
  var links = $$('#primaryNav a[href^="#"]');
  var sections = links.map(function (a) { return document.getElementById(a.hash.slice(1)); })
                      .filter(Boolean);
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;
    if (header) header.classList.toggle("stuck", y > 8);

    if (rail) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      rail.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%";
    }

    // scrollspy: the last section whose top has passed the header line
    var line = y + (parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue("--header-h"), 10) || 66) + 80;
    var current = null;
    sections.forEach(function (s) { if (s.offsetTop <= line) current = s.id; });
    links.forEach(function (a) {
      if (a.hash.slice(1) === current) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------- misc */
  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
