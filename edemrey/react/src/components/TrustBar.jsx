import { BUSINESS } from "@data/content.js";
import Icon from "./Icon.jsx";

const ITEMS = [
  { icon: "star", value: `${BUSINESS.rating}★`, label: "Google rating" },
  { icon: "checkCircle", value: `${BUSINESS.reviewCount}`, label: "Verified reviews" },
  { icon: "clock", value: "24/7", label: BUSINESS.hours },
  { icon: "pin", value: "Lekki", label: "Based in Lagos" },
];

export default function TrustBar() {
  return (
    <section className="trust" aria-label="Why clients trust us">
      <div className="container">
        <ul className="trust__list">
          {ITEMS.map((t) => (
            <li className="trust__item" key={t.label}>
              <span className="trust__icon"><Icon name={t.icon} /></span>
              <span><span className="trust__value">{t.value}</span><br /><span className="trust__label">{t.label}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
