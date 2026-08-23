import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Render black-and-white, as the card treatment calls for. */
  mono?: boolean;
  loading?: "lazy" | "eager";
};

/**
 * An <img> that degrades honestly. If the source fails — a swapped file, a
 * blocked host, an offline visitor — it paints a branded panel instead of
 * the browser's broken-image icon, so the layout never collapses.
 */
export default function Photo({ src, alt, className = "", mono = false, loading = "lazy" }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-ink ${className}`}
        style={{
          backgroundImage:
            "radial-gradient(70% 60% at 30% 20%, rgba(230,48,32,0.30), transparent 62%), linear-gradient(160deg, #141414, #0a0a0a)",
        }}
      >
        <span className="font-display text-5xl font-semibold text-white/25 select-none">EIG</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className={`${className} ${mono ? "grayscale" : ""}`}
    />
  );
}
