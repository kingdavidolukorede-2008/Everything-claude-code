import { useEffect, useRef, useState } from "react";
import { BUSINESS } from "@data/content.js";
import { formatPrice, formatPriceLong, formatSize, relatedProperties, telHref, waHref } from "@data/lib.js";
import { useReveal } from "../hooks/useReveal.js";
import { IMG, statusClass } from "../util.js";
import { BrandMark } from "./Brand.jsx";
import ContactForm from "./ContactForm.jsx";
import Icon from "./Icon.jsx";
import PropertyCard from "./PropertyCard.jsx";

/** Image gallery: arrows, thumbnails, keyboard (←/→) and swipe. */
function Gallery({ p }) {
  const [i, setI] = useState(0);
  const n = p.images.length;
  const show = (k) => setI((k + n) % n);
  const x0 = useRef(null);
  return (
    <div className="gallery">
      <div className="gallery__main" tabIndex={0} aria-roledescription="carousel" aria-label={`Photos of ${p.title}. Use arrow keys to browse.`}
        onKeyDown={(e) => { if (e.key === "ArrowRight") show(i + 1); if (e.key === "ArrowLeft") show(i - 1); }}
        onPointerDown={(e) => (x0.current = e.clientX)}
        onPointerUp={(e) => { if (x0.current === null) return; const dx = e.clientX - x0.current; x0.current = null; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); }}>
        <img src={IMG(p.images[i])} alt={`${p.title}, photo ${i + 1} of ${n}`} width="1200" height="800" decoding="async" />
        {n > 1 && <>
          <button className="gallery__nav gallery__nav--prev" type="button" onClick={() => show(i - 1)}><span className="sr-only">Previous photo</span><Icon name="chevronLeft" /></button>
          <button className="gallery__nav gallery__nav--next" type="button" onClick={() => show(i + 1)}><span className="sr-only">Next photo</span><Icon name="chevronRight" /></button>
        </>}
        <span className="gallery__count" aria-hidden="true">{i + 1} / {n}</span>
      </div>
      {n > 1 && (
        <ul className="gallery__thumbs">
          {p.images.map((img, k) => (
            <li key={k}><button className="gallery__thumb" type="button" aria-current={String(k === i)} onClick={() => show(k)}>
              <img src={IMG(img)} alt="" loading="lazy" decoding="async" /><span className="sr-only">Show photo {k + 1}</span>
            </button></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PropertyDetail({ p }) {
  const titleRef = useRef(null);
  const rootRef = useRef(null);
  useReveal(rootRef, [p?.id]);

  useEffect(() => {
    document.title = p ? `${p.title}, ${p.location} | Edmery Homes` : "Listing not found | Edmery Homes";
    scrollTo({ top: 0, behavior: "instant" });
    titleRef.current?.focus({ preventScroll: true });
  }, [p]);

  if (!p) {
    return (
      <div className="detail"><div className="container not-found">
        <h1 tabIndex={-1} ref={titleRef}>That listing is no longer available</h1>
        <p>It may have been sold or let. Browse our current properties, or tell us what you need.</p>
        <a className="btn btn--gold" href="#properties">Browse properties</a>
      </div></div>
    );
  }

  const facts = [
    p.beds && { icon: "bed", v: p.beds, l: "Bedrooms" },
    p.baths && { icon: "bath", v: p.baths, l: p.category === "Residential" ? "Bathrooms" : "Toilets" },
    { icon: "area", v: formatSize(p.size), l: "Size" },
    { icon: "building", v: p.type, l: "Property type" },
    { icon: "key", v: p.status, l: "Status" },
  ].filter(Boolean).slice(0, 4);
  const waText = `Hello Edmery Homes, I'm interested in "${p.title}" (${p.location}). Is it still available?`;

  return (
    <article className="detail view-enter" ref={rootRef}>
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb"><a href="#properties"><Icon name="arrowLeft" /> Back to properties</a></nav>
        <header className="detail__head">
          <div>
            <span className={`tag ${statusClass(p.status)}`}>{p.status}</span>
            <h1 tabIndex={-1} ref={titleRef}>{p.title}</h1>
            <p className="detail__loc"><Icon name="pin" />{p.location}</p>
          </div>
          <p className="detail__price">{formatPrice(p.price, p.period)}<small>{formatPriceLong(p.price, p.period)}</small></p>
        </header>
        <div className="detail__layout">
          <div>
            <Gallery p={p} key={p.id} />
            <ul className="facts">{facts.map((f) => <li key={f.l}><Icon name={f.icon} /><strong>{f.v}</strong><span>{f.l}</span></li>)}</ul>
            <section className="detail__section"><h2>About this property</h2><p>{p.description}</p></section>
            <section className="detail__section"><h2>Features</h2>
              <ul className="features">{p.features.map((x) => <li key={x}><Icon name="checkCircle" /><span>{x}</span></li>)}</ul>
            </section>
          </div>
          <aside className="detail__aside" aria-label="Contact an agent">
            <div className="agent">
              <div className="agent__head"><BrandMark /><div><strong>Edmery Homes agent</strong><span>Lekki office · replies fast</span></div></div>
              <div className="agent__actions">
                <a className="btn btn--gold btn--sm" href={telHref()}><Icon name="phone" /> Call</a>
                <a className="btn btn--whatsapp btn--sm" href={waHref(waText)} target="_blank" rel="noopener"><Icon name="whatsapp" /> WhatsApp</a>
              </div>
              <small><Icon name="clock" /> {BUSINESS.hours} · {BUSINESS.phoneDisplay}</small>
            </div>
            <div className="form-card"><ContactForm key={p.id} property={p} compact /></div>
          </aside>
        </div>
        <section className="related" aria-labelledby="related-title">
          <h2 id="related-title">You may also like</h2>
          <div className="grid-props grid-props--3">{relatedProperties(p).map((r, i) => <PropertyCard key={r.id} p={r} i={i} />)}</div>
        </section>
      </div>
    </article>
  );
}
