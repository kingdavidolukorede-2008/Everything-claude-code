import { BUSINESS } from '../data/business'
import { formatNaira } from '../utils/format'
import { Container } from './Container'
import { Reveal } from './Reveal'

const FACTS = [
  { label: 'Hours', value: 'Open 24 hours, every day' },
  { label: 'Neighbourhood', value: 'Chevron Drive, Eti-Osa, Lekki' },
  {
    label: 'Typical spend',
    value: `${formatNaira(BUSINESS.spendMin)}–${formatNaira(BUSINESS.spendMax)} / person`,
  },
  { label: 'Founder', value: `${BUSINESS.founder}, founder-led & women-owned` },
]

export function About() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal>
            <div className="card overflow-hidden">
              <img
                src="/images/about-interior.svg"
                alt="Moody, gold-lit dining room at Belle Food"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <p className="eyebrow">The Room</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-cream sm:text-5xl">
              Nothing here rushes.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-cream-dim">
              Belle Food is tucked into Abiola Court, just off Chevron Drive — a founder-led,
              women-owned kitchen helmed by {BUSINESS.founder}. It's built for a working lunch, a
              family dinner, or a plate at 3am, and nothing here closes: not the doors, not the
              grill, not the door for a table for one.
            </p>

            <dl className="mt-9 grid grid-cols-1 gap-5 border-t border-hairline pt-8 sm:grid-cols-2">
              {FACTS.map((fact) => (
                <div key={fact.label}>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-gold">
                    {fact.label}
                  </dt>
                  <dd className="mt-1.5 text-sm text-cream">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
