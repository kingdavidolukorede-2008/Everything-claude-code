/** Placeholder monogram + wordmark. Swap for the client's logo SVG. */
export function BrandMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#C9A24B" />
      <path d="M9 19 20 10l11 9" stroke="#0B1F3A" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 30V19h11M14 24.5h9M14 30h11" stroke="#0B1F3A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Brand({ as: Tag = "a", ...props }) {
  return (
    <Tag className="brand" {...(Tag === "a" ? { href: "#home", "aria-label": "Edemrey Homes and Properties, home" } : {})} {...props}>
      <BrandMark />
      <span className="brand__text"><span className="brand__name">Edemrey</span><span className="brand__sub">Homes &amp; Properties</span></span>
    </Tag>
  );
}
