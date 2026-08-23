import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import Photo from "@/components/Photo";
import { useReveal } from "@/lib/useReveal";
import { CHURCH, IMAGES, GATHERINGS } from "@/lib/site";

export default function AboutPage() {
  useReveal();

  return (
    <main id="main">
      {/* Cinematic hero */}
      <section className="relative flex min-h-[78vh] items-end overflow-hidden bg-ink pt-[72px] text-white">
        <Photo
          src={IMAGES.congregation}
          alt="The congregation of Ever Increasing Grace gathered in worship"
          mono
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/25"
        />
        <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
          <p className="eyebrow m-0 text-flame">Who we are</p>
          <h1 className="mt-6 max-w-[16ch] font-display text-[clamp(2.6rem,8vw,6rem)] font-semibold uppercase leading-[0.9] tracking-[-0.03em]">
            The Yoke Breaker
          </h1>
          <p className="mt-7 max-w-[46ch] text-[1.05rem] leading-[1.7] text-white/65">
            A Pentecostal assembly in the middle of Ipaja, known across Lagos by a name we never
            chose for ourselves.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="bg-paper py-[clamp(72px,10vw,132px)]">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12">
          <div className="reveal">
            <p className="eyebrow m-0 text-flame">Our story</p>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.2rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-ink">
              A small church that prays like the roof is coming off
            </h2>
          </div>

          <div className="reveal flex flex-col gap-6 text-[1.05rem] leading-[1.8] text-ash">
            <p className="m-0">
              There is nothing grand about the building on Unity Road. What happens inside it is
              another matter. People come carrying things they have carried for years — a
              diagnosis, a debt, a child who will not come home, a marriage held together with
              silence. We take those things to God together, out loud, by name, until something
              moves.
            </p>
            <p className="m-0">
              That is where the name came from. We did not print it on a banner; people who had
              been prayed for started calling us{" "}
              <em className="not-italic font-display text-ink">The Yoke Breaker</em>, and it stuck.
            </p>
            <p className="m-0">
              We are Pentecostal in the plainest sense: we believe God still speaks, still heals,
              and still sends people out. The Bible is read slowly on Tuesdays, preached plainly on
              Sundays, and prayed back to God on Thursdays. The night vigil on the last Friday of
              the month is the long one — and the one visitors most often say they came back for.
            </p>
            <p className="m-0 border-l-2 border-flame pl-6 font-display text-[1.5rem] italic leading-[1.5] text-ink">
              Come with the burden. Leave without it.
            </p>
            <p className="m-0">
              You do not need an invitation, a membership, or the right clothes. You need a chair,
              and there is one.
            </p>
          </div>
        </div>
      </section>

      {/* Scripture */}
      <section className="bg-ink py-[clamp(64px,9vw,120px)] text-white">
        <div className="mx-auto max-w-[900px] px-5 text-center sm:px-8">
          <blockquote className="reveal m-0">
            <p className="m-0 font-display text-[clamp(1.4rem,3.4vw,2.4rem)] font-light italic leading-[1.45]">
              &ldquo;{CHURCH.scripture.text}&rdquo;
            </p>
            <footer className="mt-8 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-flame">
              {CHURCH.scripture.ref}
            </footer>
          </blockquote>
          <p className="reveal m-0 mx-auto mt-10 max-w-[52ch] text-[0.98rem] leading-[1.8] text-white/50">
            This is the verse the church was founded on, and it still sets the agenda: sight for
            people who have stopped expecting it, and open doors for people who have been shut in
            too long.
          </p>
        </div>
      </section>

      {/* Service times */}
      <section className="bg-bone py-[clamp(72px,10vw,132px)]">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="reveal">
            <p className="eyebrow m-0 text-flame">Service times</p>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.2rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-ink">
              The week, in order
            </h2>
          </div>
          <div className="reveal mt-10 border-t border-hair">
            {GATHERINGS.map((g) => (
              <div
                key={g.day}
                className="grid gap-1 border-b border-hair py-6 sm:grid-cols-[8rem_1fr_auto] sm:items-baseline sm:gap-x-8"
              >
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-flame">
                  {g.day}
                </div>
                <div className="font-display text-[1.3rem] font-medium text-ink">{g.name}</div>
                <div className="font-display text-[1.05rem] italic text-ash tabular-nums">
                  {g.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead pastors */}
      <section className="bg-ink text-white">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[52vh] overflow-hidden lg:min-h-full">
            <Photo
              src={IMAGES.pastors}
              alt="The lead pastors of Ever Increasing Grace and Revival Fire Assembly"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-transparent to-ink max-lg:bg-gradient-to-t max-lg:from-ink max-lg:via-ink/40 max-lg:to-transparent"
            />
          </div>
          <div className="flex flex-col justify-center px-5 py-[clamp(56px,8vw,110px)] sm:px-8 lg:px-16">
            <div className="reveal max-w-xl">
              <p className="eyebrow m-0 text-flame">Leadership</p>
              <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] font-semibold uppercase leading-[0.98] tracking-[-0.02em]">
                Our lead pastors
              </h2>
              <p className="mt-7 text-[1.02rem] leading-[1.8] text-white/60">
                The assembly is led by a husband and wife who planted it at 13 Unity Road and have
                pastored it together ever since. From the earliest days they opened their own home
                for prayer, and that is still the tone of the church — pastoral care that happens
                at kitchen tables as much as from a pulpit.
              </p>
              <p className="mt-5 text-[1.02rem] leading-[1.8] text-white/60">
                With a passion for the Word and a heart for the broken, they carry the burden of
                this congregation personally. If you come on a Sunday, you will meet them.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link to="/#visit" className="btn btn--flame">
                  Plan your visit
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a href={CHURCH.phoneHref} className="btn btn--outline-light border-white/40">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {CHURCH.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan your visit CTA */}
      <section className="bg-paper py-[clamp(72px,10vw,132px)]">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="reveal flex flex-col gap-8 border-t-2 border-flame bg-bone p-8 sm:p-12 lg:flex-row lg:items-end lg:justify-between lg:p-16">
            <div>
              <p className="eyebrow m-0 text-flame">Plan your visit</p>
              <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(2rem,4.5vw,3.2rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-ink">
                Sunday, 8:00 am. Bring nothing.
              </h2>
              <address className="mt-6 not-italic leading-[1.7] text-ash">
                {CHURCH.address.line1}
                <br />
                {CHURCH.address.line2}, {CHURCH.address.line3}
              </address>
            </div>
            <div className="flex shrink-0 flex-col gap-3">
              <Link to="/#visit" className="btn btn--dark">
                What to expect
              </Link>
              <Link to="/#map" className="btn btn--outline text-ink">
                Directions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
