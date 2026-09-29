import { useState } from "react";
import { BUSINESS } from "@data/content.js";
import { telHref, waHref } from "@data/lib.js";
import ContactForm from "./ContactForm.jsx";
import Icon from "./Icon.jsx";

/** Loads the Google Maps iframe (~1MB) only when tapped, to save mobile data. */
function MapFacade() {
  const [load, setLoad] = useState(false);
  return (
    <div className="map">
      {load ? (
        <iframe src={BUSINESS.mapEmbed} title="Map showing Edemrey Homes at Polystar Building, Lekki" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      ) : (
        <button className="map__facade" type="button" onClick={() => setLoad(true)}>
          <span className="pin"><Icon name="pin" /></span>
          <span>Polystar Building, Lekki</span>
          <small>Tap to load the map</small>
        </button>
      )}
    </div>
  );
}

export default function Contact({ defaultInterest }) {
  const a = BUSINESS.address;
  return (
    <section className="section section--alt" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <div className="section-head section-head--center">
          <p className="eyebrow">Contact</p>
          <h2 id="contact-title">Let's find your next property</h2>
          <p>Tell us what you're looking for and an agent will get back to you quickly. We're open 24 hours.</p>
        </div>
        <div className="contact">
          <div className="contact-card">
            <div><h3>Speak to an agent now</h3><p style={{ color: "var(--on-navy-soft)", marginTop: ".4rem" }}>Calls and WhatsApp answered around the clock.</p></div>
            <div className="contact-card__actions">
              <a className="btn btn--gold" href={telHref()}><Icon name="phone" /> Call {BUSINESS.phoneDisplay}</a>
              <a className="btn btn--whatsapp" href={waHref()} target="_blank" rel="noopener"><Icon name="whatsapp" /> Chat on WhatsApp</a>
            </div>
            <ul className="contact-list">
              <li><Icon name="pin" /><div><strong>Office</strong>
                <address style={{ fontStyle: "normal" }}>{a.line1}<br />{a.line2}, {a.city} {a.postcode}</address>
                <a className="link-arrow" style={{ color: "var(--white)", marginTop: ".4rem" }} href={BUSINESS.directionsUrl} target="_blank" rel="noopener">Get directions <Icon name="arrowRight" /></a>
              </div></li>
              <li><Icon name="clock" /><div><strong>Hours</strong><span className="open-now">{BUSINESS.hours}, 7 days a week</span></div></li>
              {BUSINESS.email && <li><Icon name="mail" /><div><strong>Email</strong><a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></div></li>}
            </ul>
            <MapFacade />
          </div>
          <div className="form-card"><ContactForm defaultInterest={defaultInterest} /></div>
        </div>
      </div>
    </section>
  );
}
