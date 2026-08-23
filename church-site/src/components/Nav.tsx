import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import Logo from "./Logo";
import { CHURCH, NAV } from "@/lib/site";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState<string | null>(null);
  const location = useLocation();
  const dropRef = useRef<HTMLDivElement>(null);

  // Any navigation closes everything.
  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(null);
  }, [location.pathname, location.hash, location.key]);

  // Escape closes; body scroll locks while the mobile sheet is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setDropOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // Click outside the open dropdown closes it.
  useEffect(() => {
    if (!dropOpen) return;
    const onDown = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [dropOpen]);

  const linkClass = "text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors";

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-ink text-white">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-6 px-5 sm:px-8 lg:px-12">
        {/* Brand */}
        <Link
          to="/"
          className="mr-auto flex items-center gap-3 text-white"
          aria-label={`${CHURCH.name} — home`}
        >
          <Logo className="h-9 w-9 shrink-0" />
          <span className="hidden flex-col leading-[1.2] sm:flex">
            <span className="font-display text-[0.95rem] font-semibold tracking-[0.01em]">
              Ever Increasing Grace
            </span>
            <span className="text-[0.53rem] uppercase tracking-[0.24em] text-white/50">
              and Revival Fire Assembly
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-7 xl:flex" ref={dropRef}>
          {NAV.map((item) =>
            item.children ? (
              <div key={item.label} className="relative">
                <button
                  type="button"
                  onClick={() => setDropOpen(dropOpen === item.label ? null : item.label)}
                  aria-expanded={dropOpen === item.label}
                  className={`${linkClass} flex items-center gap-1.5 ${
                    dropOpen === item.label ? "text-flame" : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      dropOpen === item.label ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {dropOpen === item.label && (
                  <div className="absolute left-1/2 top-full z-10 mt-4 w-64 -translate-x-1/2 border border-white/10 bg-ink-2 py-2 shadow-2xl">
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        className="block px-5 py-3 text-[0.8rem] text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : item.label === "Give" ? (
              <Link key={item.to} to={item.to} className={`${linkClass} text-flame hover:text-white`}>
                {item.label}
              </Link>
            ) : item.to.includes("#") ? (
              <Link key={item.to} to={item.to} className={`${linkClass} text-white/70 hover:text-white`}>
                {item.label}
              </Link>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? "text-flame" : "text-white/70 hover:text-white"}`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <a
          href={CHURCH.phoneHref}
          className="hidden items-center gap-2 border border-white/25 px-5 py-2.5 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-flame hover:bg-flame md:inline-flex"
        >
          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
          {CHURCH.phoneDisplay}
        </a>

        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-white transition-colors hover:text-flame xl:hidden"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile sheet */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-white/10 bg-ink xl:hidden"
      >
        <nav aria-label="Mobile" className="flex flex-col px-5 py-4 sm:px-8">
          {NAV.map((item) => (
            <div key={item.label} className="border-b border-white/10 last:border-b-0">
              <Link
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`block py-4 font-display text-xl font-medium ${
                  item.label === "Give" ? "text-flame" : "text-white"
                }`}
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="-mt-1 flex flex-col pb-4 pl-4">
                  {item.children.map((child) => (
                    <Link
                      key={child.to}
                      to={child.to}
                      onClick={() => setMenuOpen(false)}
                      className="py-2 text-[0.86rem] text-white/55"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <a href={CHURCH.phoneHref} className="btn btn--flame mt-6">
            <Phone className="h-4 w-4" aria-hidden="true" />
            {CHURCH.phoneDisplay}
          </a>
        </nav>
      </div>
    </header>
  );
}
