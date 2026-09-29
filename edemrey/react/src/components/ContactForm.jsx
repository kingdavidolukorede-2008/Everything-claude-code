import { useEffect, useId, useRef, useState } from "react";
import { BUSINESS, INTERESTS } from "@data/content.js";
import { submitInquiry, telHref, validateInquiry, waHref } from "@data/lib.js";
import { announce } from "../util.js";
import Icon from "./Icon.jsx";

export function interestFor(p) {
  if (p.category !== "Residential") return "Commercial or industrial space";
  return p.status === "For Rent" ? "Renting a property" : "Buying a property";
}

const EMPTY = { name: "", phone: "", email: "", interest: "", message: "" };

/**
 * Inquiry form with inline validation and a success state.
 * Reused on the contact section and on each property detail page.
 */
export default function ContactForm({ property = null, compact = false, defaultInterest = "" }) {
  const uid = useId();
  const [values, setValues] = useState(() => ({ ...EMPTY, interest: property ? interestFor(property) : defaultInterest }));
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [result, setResult] = useState(null);
  const formRef = useRef(null);
  const successRef = useRef(null);

  // "Book a Viewing" preselects an interest unless the user already chose one
  useEffect(() => {
    if (!property && defaultInterest) setValues((v) => (v.interest ? v : { ...v, interest: defaultInterest }));
  }, [defaultInterest, property]);

  const set = (k) => (e) => {
    const next = { ...values, [k]: e.target.value };
    setValues(next);
    if (attempted) setErrors(validateInquiry(next));
  };

  const submit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    const errs = validateInquiry(values);
    setErrors(errs);
    const bad = Object.keys(errs);
    if (bad.length) {
      formRef.current.elements[bad[0]].focus();
      announce(`Please check ${bad.length} ${bad.length === 1 ? "field" : "fields"}.`);
      return;
    }
    setStatus("sending");
    try {
      const res = await submitInquiry(values, property);
      if (res.via === "whatsapp") window.open(res.href, "_blank", "noopener");
      setResult(res);
      setStatus("done");
      announce("Enquiry ready. Thank you.");
      setTimeout(() => successRef.current?.focus(), 0);
    } catch {
      setStatus("error");
    }
  };

  const reset = () => { setValues({ ...EMPTY, interest: property ? interestFor(property) : "" }); setErrors({}); setAttempted(false); setStatus("idle"); };

  if (status === "done") {
    const viaWa = result.via === "whatsapp";
    return (
      <div className="form-success" tabIndex={-1} ref={successRef}>
        <div className="form-success__icon"><Icon name="check" /></div>
        <h3>Thank you, {values.name.trim().split(/\s+/)[0]}!</h3>
        <p>{viaWa
          ? "Your enquiry is ready in WhatsApp. Just tap send and an agent will reply shortly. If WhatsApp didn't open, use the button below."
          : `We've received your enquiry and an agent will call you on ${values.phone} shortly.`}</p>
        <div className="actions">
          {viaWa && <a className="btn btn--whatsapp" href={result.href} target="_blank" rel="noopener"><Icon name="whatsapp" /> Open WhatsApp</a>}
          <a className="btn btn--outline" href={telHref()}><Icon name="phone" /> Call us now</a>
        </div>
        <button className="btn btn--sm" type="button" style={{ textDecoration: "underline" }} onClick={reset}>Send another enquiry</button>
      </div>
    );
  }

  const id = (n) => `${uid}-${n}`;
  const Field = ({ name, label, optional, children }) => (
    <div className={`field${errors[name] ? " field--invalid" : ""}`}>
      <label htmlFor={id(name)}>{label}{optional && <> <span className="optional">(optional)</span></>}</label>
      {children}
      <p className="field__error" id={id(name) + "-err"}>{errors[name] && <><Icon name="close" />{errors[name]}</>}</p>
    </div>
  );
  const ctl = (name) => ({ id: id(name), name, value: values[name], onChange: set(name), "aria-invalid": !!errors[name], "aria-describedby": id(name) + "-err" });

  return (
    <>
      <h3>{property ? "Enquire about this property" : "Send us an enquiry"}</h3>
      <p>{property ? "Ask a question or book an inspection." : "We usually reply within the hour, day or night."}</p>
      <form className="form" noValidate ref={formRef} onSubmit={submit}>
        <div className="form__row">
          {Field({ name: "name", label: "Full name", children: <input className="input" autoComplete="name" required {...ctl("name")} /> })}
          {Field({ name: "phone", label: "Phone number", children: <input className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="0802 090 2599" required {...ctl("phone")} /> })}
        </div>
        <div className="form__row">
          {Field({ name: "email", label: "Email", optional: true, children: <input className="input" type="email" autoComplete="email" {...ctl("email")} /> })}
          {Field({ name: "interest", label: "I'm interested in", children: (
            <select className="select" required {...ctl("interest")}>
              <option value="">Choose one…</option>
              {INTERESTS.map((o) => <option key={o}>{o}</option>)}
            </select>) })}
        </div>
        {Field({ name: "message", label: "Message", optional: true, children: <textarea className="textarea" rows={compact ? 3 : 4} placeholder={property ? "I'd like to inspect this property on…" : "Budget, preferred area, move-in date…"} {...ctl("message")} /> })}
        {status === "error" && (
          <div className="form__alert" role="alert">
            Sorry, we couldn't send that. Please call <a href={telHref()}>{BUSINESS.phoneDisplay}</a> or <a href={waHref()} target="_blank" rel="noopener">WhatsApp us</a>.
          </div>
        )}
        <div className="form__foot">
          <button className="btn btn--gold btn--block" type="submit" disabled={status === "sending"}>
            {property ? "Request an inspection" : "Send enquiry"} <Icon name="arrowRight" />
          </button>
          <p className="form__note"><Icon name="shield" /><span>Your details are only used to respond to your enquiry.</span></p>
        </div>
      </form>
    </>
  );
}
