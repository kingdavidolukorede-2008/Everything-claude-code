import { useEffect, useRef, useState } from "react";
import { BUSINESS, NAV } from "@data/content.js";
import { telHref } from "@data/lib.js";
import Brand from "./Brand.jsx";
import Icon from "./Icon.jsx";

/** Sticky header with desktop links, gold CTA and an accessible mobile menu. */
export default function Navbar({ solid, active, onBook }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const on = () => setScrolled(scrollY > 24);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  // body scroll lock, Escape, focus trap, close on desktop resize
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;
    const menu = menuRef.current;
    const focusables = () => [...menu.querySelectorAll("a[href], button:not([disabled])")];
    setTimeout(() => focusables()[1]?.focus(), 50);
    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); toggleRef.current?.focus(); }
      if (e.key === "Tab") {
        const f = focusables(), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    const mq = matchMedia("(min-width: 1024px)");
    const onMq = (m) => m.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => { document.removeEventListener("keydown", onKey); mq.removeEventListener("change", onMq); };
  }, [open]);

  const close = () => setOpen(false);
  const book = () => { onBook?.(); close(); };

  return (
    <>
      <header className={`site-header${scrolled || solid ? " is-solid" : ""}`}>
        <div className="container">
          <Brand />
          <nav aria-label="Main">
            <ul className="nav-links">
              {NAV.map((n) => <li key={n.id}><a href={`#${n.id}`} aria-current={String(active === n.id)}>{n.label}</a></li>)}
            </ul>
          </nav>
          <a className="btn btn--gold btn--sm nav-cta" href="#contact" onClick={book}>Book a Viewing</a>
          <button ref={toggleRef} className="nav-toggle" type="button" aria-controls="mobile-menu" aria-expanded={open} onClick={() => setOpen(true)}>
            <span className="sr-only">Open menu</span><Icon name="menu" />
          </button>
        </div>
      </header>

      <div ref={menuRef} className={`mobile-menu${open ? " is-open" : ""}`} id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="mobile-menu__top">
          <Brand as="span" />
          <button className="nav-toggle" type="button" onClick={() => { close(); toggleRef.current?.focus(); }}><span className="sr-only">Close menu</span><Icon name="close" /></button>
        </div>
        <nav aria-label="Mobile">
          <ul>{NAV.map((n) => <li key={n.id}><a href={`#${n.id}`} onClick={close}>{n.label}<Icon name="arrowRight" /></a></li>)}</ul>
        </nav>
        <div className="mobile-menu__foot">
          <a className="btn btn--gold btn--block" href="#contact" onClick={book}>Book a Viewing</a>
          <p><Icon name="clock" /> {BUSINESS.hours} · <a href={telHref()}>{BUSINESS.phoneDisplay}</a></p>
        </div>
      </div>
    </>
  );
}
