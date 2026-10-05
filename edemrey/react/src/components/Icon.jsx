import { ICONS } from "@data/icons.js";

/** Line icon from the shared icon set. Decorative by default (aria-hidden). */
export default function Icon({ name, className = "icon" }) {
  const raw = ICONS[name] || "";
  const filled = raw.startsWith("fill|");
  const paint = filled
    ? { fill: "currentColor", stroke: "none" }
    : { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  return <svg className={className} viewBox="0 0 24 24" {...paint} aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: filled ? raw.slice(5) : raw }} />;
}

export function Stars({ n = 5 }) {
  return <span className="stars" aria-label={`${n} out of 5 stars`}>{Array.from({ length: Math.round(n) }, (_, i) => <Icon key={i} name="star" />)}</span>;
}
