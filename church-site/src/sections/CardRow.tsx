import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Photo from "@/components/Photo";
import { IMAGES } from "@/lib/site";

type Card = {
  eyebrow: string;
  title: string;
  cta: string;
  to: string;
  img: string;
  alt: string;
  mono?: boolean;
};

const CARDS: Card[] = [
  {
    eyebrow: "Who we are",
    title: "About us",
    cta: "Learn more",
    to: "/about",
    img: IMAGES.congregation,
    alt: "The congregation gathered in worship",
    mono: true,
  },
  {
    eyebrow: "Join our community",
    title: "Connect with us",
    cta: "Sign up",
    to: "/#community",
    img: IMAGES.community,
    alt: "Members of the church family together after a service",
  },
  {
    eyebrow: "Endless celebration",
    title: "Celebrations",
    cta: "Learn more",
    to: "/#gatherings",
    img: IMAGES.celebration,
    alt: "Hands raised during a celebration service",
  },
];

export default function CardRow() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-[1400px] px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12">
        <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {CARDS.map((card, i) => (
            <Link
              key={card.title}
              to={card.to}
              className="reveal group relative flex aspect-[3/4] flex-col justify-end overflow-hidden bg-ink transition-transform duration-500 ease-out hover:-translate-y-2 focus-visible:-translate-y-2 lg:aspect-[4/5.6]"
              style={{ "--reveal-delay": `${i * 110}ms` } as React.CSSProperties}
            >
              <Photo
                src={card.img}
                alt={card.alt}
                mono={card.mono}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent transition-opacity duration-500 group-hover:opacity-90"
              />
              <div className="relative flex flex-col gap-6 p-7 sm:p-8">
                <div>
                  <p className="eyebrow m-0 text-white/70">{card.eyebrow}</p>
                  <h2 className="mt-3 font-display text-[clamp(1.9rem,3.2vw,2.6rem)] font-medium leading-none text-white">
                    {card.title}
                  </h2>
                </div>
                <span className="inline-flex items-center gap-2.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white">
                  {card.cta}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
