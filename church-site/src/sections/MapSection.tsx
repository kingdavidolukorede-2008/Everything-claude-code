import { Phone, MapPin, Clock } from "lucide-react";
import { CHURCH, MAPS_EMBED, MAPS_DIRECTIONS } from "@/lib/site";

export default function MapSection() {
  return (
    <section id="map" className="bg-paper py-[clamp(72px,10vw,132px)]">
      <div className="mx-auto grid max-w-[1400px] items-start gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-12">
        <div className="reveal">
          <p className="eyebrow m-0 text-flame">Find us</p>
          <h2 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-ink">
            13 Unity Road,
            <br />
            Ipaja
          </h2>

          <address className="mt-7 not-italic text-[1.05rem] leading-[1.75] text-ink">
            {CHURCH.address.line1}
            <br />
            {CHURCH.address.line2}
            <br />
            {CHURCH.address.line3}
          </address>

          <ul className="mt-8 flex list-none flex-col gap-4 border-t border-hair p-0 pt-7">
            <li className="flex gap-3.5">
              <Phone className="mt-1 h-4 w-4 shrink-0 text-flame" aria-hidden="true" />
              <a href={CHURCH.phoneHref} className="text-ink no-underline hover:text-flame">
                {CHURCH.phoneDisplay}
              </a>
            </li>
            <li className="flex gap-3.5">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-flame" aria-hidden="true" />
              <span className="text-ash">Alight at Unity Bus Stop — the church is a short walk in.</span>
            </li>
            <li className="flex gap-3.5">
              <Clock className="mt-1 h-4 w-4 shrink-0 text-flame" aria-hidden="true" />
              <span className="text-ash">Sunday worship begins at 8:00 am.</span>
            </li>
          </ul>

          <a
            className="btn btn--outline mt-9 text-ink"
            href={MAPS_DIRECTIONS}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps
          </a>
        </div>

        <div className="reveal aspect-[4/3] w-full border border-hair lg:aspect-[4/3.2]">
          <iframe
            title={`Map showing ${CHURCH.name}`}
            src={MAPS_EMBED}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full grayscale"
          />
        </div>
      </div>
    </section>
  );
}
