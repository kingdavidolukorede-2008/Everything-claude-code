import { GATHERINGS } from "@/lib/site";

export default function Gatherings() {
  return (
    <section id="gatherings" className="bg-paper py-[clamp(72px,10vw,132px)]">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="reveal max-w-2xl">
          <p className="eyebrow m-0 text-flame">The week</p>
          <h2 className="mt-5 font-display text-[clamp(2.2rem,5.5vw,4rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-ink">
            When we gather
          </h2>
          <p className="mt-6 max-w-[46ch] text-[1.02rem] leading-[1.7] text-ash">
            Four meetings, each with its own weight. Sunday is the one to start with.
          </p>
        </div>

        <div className="reveal mt-12 border-t border-hair">
          {GATHERINGS.map((g) => (
            <div
              key={g.day}
              className="grid gap-2 border-b border-hair py-7 sm:grid-cols-[7rem_1fr_auto] sm:items-baseline sm:gap-x-8 sm:py-9"
            >
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-flame">
                {g.day}
              </div>
              <div>
                <h3 className="m-0 font-display text-[clamp(1.35rem,2.6vw,1.9rem)] font-medium text-ink">
                  {g.name}
                </h3>
                <p className="m-0 mt-1.5 max-w-[52ch] text-[0.95rem] leading-relaxed text-ash">
                  {g.note}
                </p>
              </div>
              <div className="font-display text-[clamp(1.05rem,1.8vw,1.35rem)] italic text-ink tabular-nums">
                {g.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
