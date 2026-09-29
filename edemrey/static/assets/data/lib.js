/* ==========================================================================
   Shared, framework-free helpers used by both the static and React builds.
   ========================================================================== */

import { BUSINESS, PROPERTIES, BUDGETS } from "./content.js";

/** ₦650,000,000 → "₦650M", 1.2e9 → "₦1.2B", 25e6 + "/yr" → "₦25M/yr" */
export function formatPrice(n, period = "") {
  const fmt = (v) => (Number.isInteger(v) ? v : v.toFixed(1).replace(/\.0$/, ""));
  let s;
  if (n >= 1e9) s = `₦${fmt(n / 1e9)}B`;
  else if (n >= 1e6) s = `₦${fmt(n / 1e6)}M`;
  else s = `₦${n.toLocaleString("en-NG")}`;
  return s + (period || "");
}

/** Full price for screen readers and detail pages: "₦650,000,000" */
export function formatPriceLong(n, period = "") {
  return `₦${n.toLocaleString("en-NG")}${period === "/yr" ? " per year" : ""}`;
}

export const formatSize = (sqm) => `${sqm.toLocaleString("en-NG")} sqm`;

/** Distinct search locations, derived from the listings. */
export const LOCATIONS = [...new Set(PROPERTIES.map((p) => p.area))];

/**
 * Filters listings by category chip + search form values.
 * All criteria are optional; "all"/"any"/"" mean no constraint.
 */
export function filterProperties(list, { category = "all", area = "", type = "", budget = "any" } = {}) {
  const b = BUDGETS.find((x) => x.id === budget) || BUDGETS[0];
  return list.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (!area || p.area === area) &&
      (!type || p.type === type) &&
      p.price >= b.min &&
      p.price < b.max
  );
}

export const getProperty = (id) => PROPERTIES.find((p) => p.id === id);

/** Related listings for the detail view: same category first. */
export function relatedProperties(p, n = 3) {
  const others = PROPERTIES.filter((x) => x.id !== p.id);
  return [...others.filter((x) => x.category === p.category), ...others.filter((x) => x.category !== p.category)].slice(0, n);
}

/* ---------------------------------------------------------------- links */
export const telHref = () => `tel:${BUSINESS.phoneIntl}`;
export const waHref = (text = "Hello Edmery Homes, I'd like to make an enquiry.") =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(text)}`;

export const fullAddress = () => {
  const a = BUSINESS.address;
  return `${a.line1}, ${a.line2}, ${a.city} ${a.postcode}`;
};

/* ------------------------------------------------------------ inquiries */
/** Normalises Nigerian numbers: "0802 090 2599" / "+234 802…" → "08020902599" */
export function normalisePhone(v) {
  let d = String(v).replace(/[\s\-().]/g, "");
  if (d.startsWith("+234")) d = "0" + d.slice(4);
  else if (d.startsWith("234") && d.length === 13) d = "0" + d.slice(3);
  return d;
}

/** Returns { field: message } for every invalid field (empty object = valid). */
export function validateInquiry(v) {
  const e = {};
  if (!v.name || v.name.trim().length < 2) e.name = "Please enter your full name.";
  const phone = normalisePhone(v.phone || "");
  if (!phone) e.phone = "Please enter a phone number so we can reach you.";
  else if (!/^0[789][01]\d{8}$/.test(phone) && !/^\+?\d{10,15}$/.test(phone))
    e.phone = "Enter a valid phone number, e.g. 0802 090 2599.";
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "That email address doesn't look right.";
  if (!v.interest) e.interest = "Please choose what you're interested in.";
  if (v.message && v.message.length > 2000) e.message = "Please keep your message under 2,000 characters.";
  return e;
}

/** Plain-text summary used for WhatsApp hand-off and email bodies. */
export function inquiryText(v, property) {
  return [
    "Hello Edmery Homes, I'd like to make an enquiry.",
    property ? `Property: ${property.title} (${property.location})` : "",
    `Name: ${v.name.trim()}`,
    `Phone: ${v.phone.trim()}`,
    v.email ? `Email: ${v.email.trim()}` : "",
    `Interest: ${v.interest}`,
    v.message ? `Message: ${v.message.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Sends an inquiry. With BUSINESS.formEndpoint set it POSTs JSON (Formspree-
 * compatible). Without one it returns a WhatsApp link for the caller to open.
 * Resolves to { ok: true, via: "endpoint" | "whatsapp", href? }.
 */
export async function submitInquiry(values, property) {
  if (BUSINESS.formEndpoint) {
    const res = await fetch(BUSINESS.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...values, property: property ? property.title : "", _subject: "New website enquiry" }),
    });
    if (!res.ok) throw new Error("Submission failed");
    return { ok: true, via: "endpoint" };
  }
  return { ok: true, via: "whatsapp", href: waHref(inquiryText(values, property)) };
}
