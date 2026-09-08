/* Nice Meal — nav state, mobile disclosure, scroll reveal.
   Loaded with `defer` on both pages; every block guards its own elements. */
(function () {
  'use strict';

  /* ── Sticky nav background ────────────────────────────────────────────── */
  var navbar = document.getElementById('navbar');
  if (navbar) {
    var setScrolled = function () {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    setScrolled();
    // Passive: this listener never calls preventDefault, so the browser
    // can keep scrolling without waiting on it.
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  /* ── Mobile menu ──────────────────────────────────────────────────────────
     A real disclosure: the button owns the state, Escape and the scrim close
     it, and focus comes back to the button so keyboard users are not stranded
     at the top of the document. */
  var toggle = document.getElementById('nav-toggle');
  var links  = document.getElementById('nav-links');
  var scrim  = document.getElementById('nav-scrim');

  if (toggle && links) {
    var isOpen = function () {
      return toggle.getAttribute('aria-expanded') === 'true';
    };

    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      links.classList.toggle('open', open);
      if (scrim) {
        scrim.hidden = !open;
        // Toggle the class on the next frame so the opacity transition runs.
        if (open) {
          requestAnimationFrame(function () { scrim.classList.add('open'); });
        } else {
          scrim.classList.remove('open');
        }
      }
      document.body.style.overflow = open ? 'hidden' : '';
    };

    var close = function (refocus) {
      if (!isOpen()) return;
      setOpen(false);
      if (refocus) toggle.focus();
    };

    toggle.addEventListener('click', function () { setOpen(!isOpen()); });

    if (scrim) scrim.addEventListener('click', function () { close(false); });

    // Following a link inside the panel should dismiss it.
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) close(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close(true);
    });

    // Back on a wide viewport the panel is a plain row again — drop the
    // open state so the scroll lock does not survive the resize.
    var wide = window.matchMedia('(min-width: 901px)');
    var onWide = function (e) { if (e.matches) close(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else if (wide.addListener) wide.addListener(onWide);
  }

  /* ── Scroll reveal ────────────────────────────────────────────────────── */
  var reveals = document.querySelectorAll('.reveal');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reveals.length && 'IntersectionObserver' in window && !reduced) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        setTimeout(function () { entry.target.classList.add('visible'); }, i * 80);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    Array.prototype.forEach.call(reveals, function (el) { observer.observe(el); });
  } else {
    // No observer, or the visitor asked for less motion: show everything.
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('visible'); });
  }

  /* ── Photographs are not draggable out of the page ────────────────────── */
  document.addEventListener('dragstart', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  });
})();
