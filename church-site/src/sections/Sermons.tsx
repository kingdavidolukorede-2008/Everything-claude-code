import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CHURCH } from "@/lib/site";

const TEACHING = [
  {
    when: "Sunday morning",
    what: "The word, preached",
    body: "One passage, opened plainly, applied to the week ahead. Prayer for anyone who comes forward at the close.",
  },
  {
    when: "Tuesday evening",
    what: "Bible study",
    body: "We work through one book at a time, slowly, with room for questions. Bring a Bible or borrow one.",
  },
  {
    when: "Thursday evening",
    what: "Revival hour",
    body: "Less teaching, more intercession — for the church, for Ipaja, and for the requests brought that week.",
  },
];

export default function Sermons() {
  return (
    <section id="sermons" className="bg-ink py-[clamp(72px,10vw,132px)] text-white">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="reveal max-w-2xl">
          <p className="eyebrow m-0 text-flame">Sermons</p>
          <h2 className="mt-5 font-display text-[clamp(2.2rem,5.5vw,4rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em]">
            Where the teaching happens
          </h2>
          <p className="mt-6 max-w-[48ch] text-[1.02rem] leading-[1.7] text-white/55">
            Every message is preached live, in the room, at {CHURCH.address.line2}. Recordings are
            not published online yet — the surest way to hear the word is to come and sit under it.
          </p>
        </div>

        <div className="mt-14 grid gap-px border border-white/10 bg-white/10 md:grid-cols-3">
          {TEACHING.map((t, i) => (
            <article
              key={t.what}
              className="reveal flex flex-col gap-3 bg-ink p-8 lg:p-10"
              style={{ "--reveal-delay": `${i * 110}ms` } as React.CSSProperties}
            >
              <p className="eyebrow m-0 text-white/40">{t.when}</p>
              <h3 className="m-0 font-display text-[1.6rem] font-medium">{t.what}</h3>
              <p className="m-0 text-[0.95rem] leading-relaxed text-white/55">{t.body}</p>
            </article>
          ))}
        </div>

        <div className="reveal mt-12">
          <Link to="/#visit" className="btn btn--outline-light border-white/40 text-white">
            Plan your first visit
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
