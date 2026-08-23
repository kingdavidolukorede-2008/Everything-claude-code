import { VISIT_NOTES } from "@/lib/site";

export default function FirstVisit() {
  return (
    <section id="visit" className="bg-bone py-[clamp(72px,10vw,132px)]">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="reveal max-w-2xl">
          <p className="eyebrow m-0 text-flame">First visit</p>
          <h2 className="mt-5 font-display text-[clamp(2.2rem,5.5vw,4rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-ink">
            What Sunday morning
            <br className="hidden sm:block" /> is actually like
          </h2>
        </div>

        <div className="mt-12 grid gap-px border border-hair bg-hair md:grid-cols-3">
          {VISIT_NOTES.map((note, i) => (
            <article
              key={note.title}
              className="reveal flex flex-col gap-3 bg-bone p-8 lg:p-10"
              style={{ "--reveal-delay": `${i * 110}ms` } as React.CSSProperties}
            >
              <h3 className="m-0 font-display text-[1.5rem] font-medium text-ink">{note.title}</h3>
              <p className="m-0 text-[0.95rem] leading-relaxed text-ash">{note.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
