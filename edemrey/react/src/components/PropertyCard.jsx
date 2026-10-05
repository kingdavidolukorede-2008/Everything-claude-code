import { formatPrice, formatPriceLong, formatSize } from "@data/lib.js";
import { IMG, statusClass } from "../util.js";
import Icon from "./Icon.jsx";

export function PropertyMeta({ p }) {
  return (
    <ul className="meta">
      {p.beds ? <li><Icon name="bed" /><span>{p.beds} <span className="sr-only">bedrooms</span><span aria-hidden="true">Beds</span></span></li> : null}
      {p.baths ? <li><Icon name="bath" /><span>{p.baths} <span className="sr-only">bathrooms</span><span aria-hidden="true">Baths</span></span></li> : null}
      <li><Icon name="area" /><span>{formatSize(p.size)}</span></li>
    </ul>
  );
}

/** Listing card. The title link is stretched so the whole card is clickable. */
export default function PropertyCard({ p, i = 0 }) {
  const href = `#/property/${p.id}`;
  return (
    <article className="card reveal" style={{ "--d": `${(i % 4) * 0.06}s` }}>
      <div className="card__media">
        <img src={IMG(p.images[0])} alt={`${p.title} in ${p.location}`} width="1200" height="800" loading="lazy" decoding="async" />
        <span className={`tag card__tag ${statusClass(p.status)}`}>{p.status}</span>
        <span className="card__cat">{p.category}</span>
      </div>
      <div className="card__body">
        <p className="card__price">
          <span className="sr-only">{formatPriceLong(p.price, p.period)}</span>
          <span aria-hidden="true">{formatPrice(p.price)}{p.period && <small>{p.period}</small>}</span>
        </p>
        <h3 className="card__title"><a href={href}>{p.title}</a></h3>
        <p className="card__loc"><Icon name="pin" />{p.location}</p>
        <PropertyMeta p={p} />
        <div className="card__cta"><a className="btn btn--outline btn--sm" href={href} tabIndex={-1} aria-hidden="true">View Details <Icon name="arrowRight" /></a></div>
      </div>
    </article>
  );
}
