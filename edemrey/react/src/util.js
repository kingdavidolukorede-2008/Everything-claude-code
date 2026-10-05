/* Small React-side helpers. Shared logic lives in @data/lib.js. */
export const IMG = (file) => `${import.meta.env.BASE_URL}${file}`;
export const initials = (name) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
export const statusClass = (s) => ({ "For Sale": "tag--sale", "For Rent": "tag--rent" }[s] || "tag--commercial");
export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Announces a message to screen readers via the global live region. */
export function announce(msg) {
  const el = document.querySelector("[data-announce]");
  if (!el) return;
  el.textContent = "";
  setTimeout(() => (el.textContent = msg), 50);
}
