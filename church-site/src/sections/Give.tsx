import { Phone, MessageCircle } from "lucide-react";
import { CHURCH } from "@/lib/site";

/**
 * The church has not supplied bank or transfer details, so this section does
 * not invent any. It points to the two channels we can verify — in person on
 * a Sunday, or the church line. Add an account panel here once the real
 * details are confirmed by the pastors.
 */
export default function Give() {
  return (
    <section id="give" className="bg-bone py-[clamp(72px,10vw,132px)]">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="reveal grid gap-10 border-t-2 border-flame bg-paper p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16 lg:p-16">
          <div>
            <p className="eyebrow m-0 text-flame">Give</p>
            <h2 className="mt-5 max-w-[16ch] font-display text-[clamp(2rem,4.5vw,3.2rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-ink">
              Every offering stays in Ipaja
            </h2>
            <p className="mt-6 max-w-[52ch] text-[1.02rem] leading-[1.7] text-ash">
              Giving keeps the lights on, the vigil running, and the church able to meet a need in
              the neighbourhood the same week it is heard. Offerings are received in person at any
              gathering. For transfer details, call the church line and one of the pastors will
              speak with you directly.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3">
            <a className="btn btn--flame" href={CHURCH.phoneHref}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              {CHURCH.phoneDisplay}
            </a>
            <a
              className="btn btn--outline text-ink"
              href={CHURCH.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
