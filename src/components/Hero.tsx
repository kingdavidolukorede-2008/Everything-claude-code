import { BUSINESS } from '../data/business'
import { useCart } from '../context/CartContext'
import { formatNaira } from '../utils/format'
import { ClockIcon, PhoneIcon, StarIcon } from './Icons'
import { DialSVG } from './DialSVG'
import { LagosClock } from './LagosClock'
import { Marquee } from './Marquee'

export function Hero() {
  const cart = useCart()

  return (
    <section id="belle" className="relative overflow-hidden pt-14 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,162,75,0.12),transparent_55%)]" />
      <div className="mx-auto grid max-w-[1180px] gap-12 px-5 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-8">
        <div>
          <p className="eyebrow">{BUSINESS.eyebrowLocation}</p>

          <h1 className="mt-6 font-display text-[15vw] leading-[0.92] tracking-tight sm:text-7xl md:text-8xl">
            <span className="block text-cream">Belle</span>
            <span className="block text-gold">Food.</span>
          </h1>

          <p className="mt-6 max-w-xl font-display text-xl italic text-gold-soft sm:text-2xl">
            {BUSINESS.tagline}
          </p>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-cream-dim">
            Dine-in, takeaway or no-contact delivery — a warm plate is always waiting at Belle
            Food, whatever hour Lagos brings you in.
          </p>

          <div className="mt-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.1em] text-gold">
            <ClockIcon className="h-4 w-4" />
            <span>
              <LagosClock />
            </span>
            <span className="inline-flex items-center gap-1.5 text-gold-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7FBF6B]" aria-hidden="true" />
              Open now
            </span>
          </div>

          <div className="mt-7 flex max-w-[440px] flex-wrap gap-2.5">
            <span className="chip">
              <StarIcon className="h-3 w-3 text-gold" />
              {BUSINESS.rating} · {BUSINESS.reviewCount} reviews
            </span>
            <span className="chip">
              {formatNaira(BUSINESS.spendMin)}–{formatNaira(BUSINESS.spendMax)} / person
            </span>
            <span className="chip">Owned by {BUSINESS.founder}</span>
            <span className="chip">Dine-in · Takeaway · Delivery</span>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <button type="button" onClick={cart.open} className="btn btn-primary">
              Start an Order
            </button>
            <a href={`tel:${BUSINESS.phoneTel}`} className="btn btn-ghost">
              <PhoneIcon className="h-4 w-4" />
              Call to Reserve
            </a>
            <a
              href={BUSINESS.glovoUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-gold"
            >
              Order on Glovo
            </a>
          </div>
        </div>

        <div className="relative">
          <DialSVG />
          <p className="mt-6 text-center font-display text-sm italic text-cream-faint">
            Day into night — the kitchen doesn't clock out
          </p>
        </div>
      </div>

      <div className="mt-14">
        <Marquee />
      </div>
    </section>
  )
}
