import { BUSINESS, DAYS } from '../data/business'
import { Container } from './Container'
import { LagosClock } from './LagosClock'
import { Reveal } from './Reveal'
import { ClockIcon, InstagramIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from './Icons'
import { buildWhatsAppLink } from '../utils/whatsapp'

interface VisitProps {
  onReserve: () => void
}

export function Visit({ onReserve }: VisitProps) {
  return (
    <section id="visit" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <p className="eyebrow">Visit</p>
          <h2 className="mt-4 max-w-xl font-display text-4xl leading-tight text-cream sm:text-5xl">
            Find us on Chevron Drive.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="card flex h-full flex-col p-8">
              <p className="eyebrow mb-6">Address</p>
              <div className="flex items-start gap-3">
                <MapPinIcon className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="text-base text-cream">{BUSINESS.address}</p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.08em] text-cream-faint">
                    Plus code: {BUSINESS.plusCode}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="chip">Dine-in</span>
                <span className="chip">Takeaway</span>
                <span className="chip">No-contact delivery</span>
                <span className="chip">Also on Glovo</span>
              </div>

              <div className="mt-auto grid grid-cols-1 gap-3 pt-8 sm:grid-cols-2">
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-gold justify-start"
                >
                  <MapPinIcon className="h-4 w-4" />
                  Get Directions
                </a>
                <a href={`tel:${BUSINESS.phoneTel}`} className="btn btn-ghost justify-start">
                  <PhoneIcon className="h-4 w-4" />
                  Call {BUSINESS.phoneDisplay}
                </a>
                <button type="button" onClick={onReserve} className="btn btn-ghost justify-start">
                  Reserve a Table
                </button>
                <a
                  href={BUSINESS.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost justify-start"
                >
                  <InstagramIcon className="h-4 w-4" />
                  Instagram
                </a>
              </div>

              <a
                href={buildWhatsAppLink("Hi Belle Food, I'd like to place an order.")}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-cream-dim hover:text-gold-soft"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Message us on WhatsApp
              </a>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="card h-full p-8">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Hours</p>
                <span className="flex items-center gap-2 font-mono text-xs text-gold-soft">
                  <ClockIcon className="h-4 w-4" />
                  <LagosClock withDay />
                </span>
              </div>

              <ul className="mt-6 divide-y divide-hairline">
                {DAYS.map((day) => (
                  <li key={day} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-cream-dim">{day}</span>
                    <span className="font-mono text-xs uppercase tracking-[0.06em] text-gold">
                      Open 24h
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
