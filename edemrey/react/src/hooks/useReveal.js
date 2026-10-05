import { useEffect } from "react";
import { reducedMotion } from "../util.js";

/**
 * Adds .is-in to every .reveal element inside `ref` as it scrolls into view.
 * Re-runs whenever `deps` change (e.g. the filtered listing grid re-renders).
 */
export function useReveal(ref, deps = []) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = [...root.querySelectorAll(".reveal:not(.is-in)")];
    if (!("IntersectionObserver" in window) || reducedMotion()) { els.forEach((el) => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
