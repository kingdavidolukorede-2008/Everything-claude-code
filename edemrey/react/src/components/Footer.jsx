import { BUSINESS, NAV } from "@data/content.js";
import { fullAddress, telHref, waHref } from "@data/lib.js";
import Brand from "./Brand.jsx";
import Icon from "./Icon.jsx";

const label = (k) => (k === "x" ? "X" : k[0].toUpperCase() + k.slice(1));

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Brand />
            <p>Residential, commercial and industrial real estate in Lekki and across Lagos. Reliable advice, smooth transactions.</p>
            <div className="socials">
              {Object.entries(BUSINESS.social).map(([k, url]) => (
                <a key={k} href={url || "#"} {...(url ? { target: "_blank", rel: "noopener" } : {})} aria-label={`Edmery Homes on ${label(k)}`}><Icon name={k} /></a>
              ))}
            </div>
          </div>
          <nav aria-label="Footer"><h2>Quick links</h2><ul>{NAV.map((n) => <li key={n.id}><a href={`#${n.id}`}>{n.label}</a></li>)}</ul></nav>
          <div><h2>Contact</h2>
            <ul className="footer-contact">
              <li><Icon name="pin" /><span>{fullAddress()}</span></li>
              <li><Icon name="phone" /><a href={telHref()}>{BUSINESS.phoneDisplay}</a></li>
              <li><Icon name="whatsapp" /><a href={waHref()} target="_blank" rel="noopener">WhatsApp us</a></li>
              <li><Icon name="clock" /><span>{BUSINESS.hours}</span></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</span>
          <span>Lekki, Lagos, Nigeria</span>
        </div>
      </div>
    </footer>
  );
}

/** Sticky one-tap Call / WhatsApp bar (CSS shows it below 768px only). */
export function MobileContactBar() {
  return (
    <div className="mobile-bar" aria-label="Quick contact">
      <a className="btn btn--navy" href={telHref()}><Icon name="phone" /> Call</a>
      <a className="btn btn--whatsapp" href={waHref()} target="_blank" rel="noopener"><Icon name="whatsapp" /> WhatsApp</a>
    </div>
  );
}
