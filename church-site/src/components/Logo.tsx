/** Flame-in-a-ring mark. Inline SVG so it inherits color and never 404s. */
export default function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M20 7.5c3.6 4.9 7 8.1 7 13.2A7 7 0 0 1 13 20.7c0-5.1 3.4-8.3 7-13.2Z"
        fill="var(--color-flame)"
      />
      <path
        d="M20 16.6c1.7 2.3 2.9 3.6 2.9 5.5a2.9 2.9 0 1 1-5.8 0c0-1.9 1.2-3.2 2.9-5.5Z"
        fill="currentColor"
      />
      <path d="M10.6 32h18.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
