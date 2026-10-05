import { useCallback, useEffect, useRef, useState } from "react";
import { BUSINESS, TESTIMONIALS } from "@data/content.js";
import { initials, reducedMotion } from "../util.js";
import Icon, { Stars } from "./Icon.jsx";

/** Scroll-snap carousel: native swipe on touch, buttons + dots otherwise. */
export default function Testimonials() {
  const track = useRef(null);
  const [st, setSt] = useState({ i: 0, atStart: true, atEnd: false, isStatic: false });

  const step = () => {
    const t = track.current, first = t.firstElementChild;
    return first.getBoundingClientRect().width + parseFloat(getComputedStyle(t).columnGap || 16);
  };
  const update = useCallback(() => {
    const t = track.current; if (!t) return;
    const max = t.scrollWidth - t.clientWidth;
    setSt({ i: Math.round(t.scrollLeft / step()), atStart: t.scrollLeft <= 2, atEnd: t.scrollLeft >= max - 2, isStatic: max <= 2 });
  }, []);
  const go = (i) => track.current.scrollTo({ left: i * step(), behavior: reducedMotion() ? "auto" : "smooth" });

  useEffect(() => {
    update();
    addEventListener("resize", update);
    return () => removeEventListener("resize", update);
  }, [update]);

  const onKey = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(st.i + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(st.i - 1); }
  };

  return (
    <section className="section section--alt" id="testimonials" aria-labelledby="reviews-title">
      <div className="container">
        <div className="reviews-head">
          <div className="section-head">
            <p className="eyebrow">Testimonials</p>
            <h2 id="reviews-title">Trusted by buyers, sellers and businesses</h2>
          </div>
          <a className="gbadge" href={BUSINESS.googleUrl} target="_blank" rel="noopener">
            <Icon name="google" className="icon g" />
            <span className="gbadge__score">{BUSINESS.rating}</span>
            <span className="gbadge__meta"><Stars n={5} /><span>{BUSINESS.reviewCount} Google reviews</span></span>
          </a>
        </div>
        <div className={`carousel${st.isStatic ? " is-static" : ""}`}>
          <ul className="carousel__track" ref={track} onScroll={update} onKeyDown={onKey} aria-label="Client reviews" tabIndex={0}>
            {TESTIMONIALS.map((t, i) => (
              <li className="review" id={`review-${i}`} key={t.name} aria-roledescription="slide" aria-label={`${i + 1} of ${TESTIMONIALS.length}`}>
                <div className="review__top"><Icon name="quote" className="icon review__quote" /><Stars n={t.rating} /></div>
                <blockquote><p>{t.text}</p></blockquote>
                <footer>
                  <span className="avatar" aria-hidden="true">{initials(t.name)}</span>
                  <span><cite>{t.name}</cite><span className="role">{t.role}</span></span>
                </footer>
              </li>
            ))}
          </ul>
          <div className="carousel__controls">
            <button className="carousel__btn" type="button" disabled={st.atStart} onClick={() => go(st.i - 1)}><span className="sr-only">Previous review</span><Icon name="chevronLeft" /></button>
            <div className="carousel__dots">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} className="carousel__dot" type="button" aria-controls={`review-${i}`} aria-current={String(i === st.i)} onClick={() => go(i)}><span className="sr-only">Show review {i + 1}</span></button>
              ))}
            </div>
            <button className="carousel__btn" type="button" disabled={st.atEnd} onClick={() => go(st.i + 1)}><span className="sr-only">Next review</span><Icon name="chevronRight" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
