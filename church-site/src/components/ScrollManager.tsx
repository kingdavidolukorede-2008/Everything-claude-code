import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Route- and hash-aware scrolling.
 *
 * Keyed on the full location (including `key`) so a link to a section works
 * every time it is clicked, not only on first load — and so navigating to a
 * new route always starts at the top.
 */
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash, key]);

  return null;
}
