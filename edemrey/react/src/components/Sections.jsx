/* Content sections that are pure presentation of data: Services, WhyUs,
   HowItWorks, About (+ Team). */
import { ABOUT, SERVICES, STEPS, TEAM, VALUES } from "@data/content.js";
import { telHref } from "@data/lib.js";
import { IMG } from "../util.js";
import Icon from "./Icon.jsx";

export function Services() {
  return (
    <section className="section section--alt" id="services" aria-labelledby="services-title">
      <div className="container">
        <div className="section-head section-head--center">
          <p className="eyebrow">What we do</p>
          <h2 id="services-title">Every property need, one trusted team</h2>
          <p>Residential, commercial and industrial. Whether you are buying, selling, renting or investing, we handle it end to end.</p>
        </div>
        <ul className="grid-services">
          {SERVICES.map((s, i) => (
            <li key={s.title} className="reveal" style={{ "--d": `${(i % 3) * 0.07}s` }}>
              <article className="service">
                <div className="service__icon"><Icon name={s.icon} /></div>
                <h3>{s.title}</h3><p>{s.text}</p>
              </article>
            </li>
          ))}
        </ul>
        <div className="services-cta"><p>Not sure where to start?</p><a className="btn btn--gold" href="#contact">Get free advice</a></div>
      </div>
    </section>
  );
}

export function WhyUs() {
  return (
    <section className="section section--dark" id="why" aria-labelledby="why-title">
      <div className="container why">
        <div className="section-head">
          <p className="eyebrow">Why choose Edmery</p>
          <h2 id="why-title">What our clients say, in four words</h2>
          <p>We didn't write these values. We took them from our Google reviews, where clients keep describing the same things.</p>
          <a className="btn btn--gold" href={telHref()}><Icon name="phone" /> Talk to an agent</a>
        </div>
        <ul className="grid-values">
          {VALUES.map((v, i) => (
            <li key={v.title} className="value reveal" style={{ "--d": `${i * 0.07}s` }}>
              <div className="value__icon"><Icon name={v.icon} /></div>
              <h3>{v.title}</h3><p>{v.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="section" id="process" aria-labelledby="process-title">
      <div className="container">
        <div className="section-head section-head--center">
          <p className="eyebrow">How it works</p>
          <h2 id="process-title">From first call to keys in hand</h2>
          <p>A simple, transparent process with no surprises along the way.</p>
        </div>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="step reveal" style={{ "--d": `${i * 0.1}s` }}>
              <span className="step__num" aria-hidden="true">{i + 1}</span>
              <h3><span className="sr-only">Step {i + 1}: </span>{s.title}</h3><p>{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="steps-cta"><a className="btn btn--gold" href="#contact">Start with a free consultation</a></div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="container">
        <div className="about">
          <div className="about__media reveal">
            <img src={IMG(ABOUT.image)} alt="Interior of a modern Lagos living room" width="1200" height="800" loading="lazy" decoding="async" />
            <div className="about__badge"><strong>4.9★</strong><span>Average rating<br />on Google</span></div>
          </div>
          <div className="about__text">
            <p className="eyebrow">About us</p>
            <h2 id="about-title">A Lekki agency that treats every deal like its own</h2>
            <p>{ABOUT.story}</p>
            <p>{ABOUT.story2}</p>
            <div className="mission"><p className="eyebrow">Our mission</p><p>{ABOUT.mission}</p></div>
          </div>
        </div>
        <div className="team">
          <h3 className="team__title">Meet the team <span className="team__note">Photos coming soon</span></h3>
          <ul className="grid-team">
            {TEAM.map((m, i) => (
              <li className="member" key={i}>
                <div className="member__photo">{m.photo ? <img src={IMG(m.photo)} alt={m.name} loading="lazy" /> : <Icon name="user" />}</div>
                <div className="member__body"><h4>{m.name}</h4><p>{m.role}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
