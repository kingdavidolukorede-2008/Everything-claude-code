import { BUSINESS } from '../data/business'
import { OWNER_NOTE, REVIEWS } from '../data/reviews'
import { Container } from './Container'
import { Reveal } from './Reveal'
import { StarIcon } from './Icons'

export function Reviews() {
  return (
    <section id="reviews" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <p className="eyebrow">Reviews</p>
          <h2 className="mt-4 max-w-xl font-display text-4xl leading-tight text-cream sm:text-5xl">
            What the neighbourhood says.
          </h2>

          <div className="mt-6 flex items-center gap-3">
            <span className="font-display text-3xl text-gold-soft">{BUSINESS.rating}</span>
            <div className="flex items-center gap-1" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <StarIcon key={i} className="h-5 w-5 text-gold" />
              ))}
              <StarIcon className="h-5 w-5 text-gold" filled={false} />
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-cream-faint">
              {BUSINESS.reviewCount} Google reviews
            </span>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {REVIEWS.map((review, i) => (
            <Reveal key={review.name} delay={i * 90}>
              <article className="card h-full p-7">
                <div className="flex items-center gap-1" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <StarIcon key={star} className="h-4 w-4 text-gold" />
                  ))}
                </div>
                <p className="mt-4 font-display text-lg italic leading-relaxed text-cream">
                  “{review.text}”
                </p>
                <p className="mt-5 font-mono text-xs uppercase tracking-[0.08em] text-cream-faint">
                  {review.name} · {review.meta}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="mt-8 card border-gold/30 p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gold">
              A note from {OWNER_NOTE.author}
            </p>
            <p className="mt-3 max-w-2xl font-display text-lg italic leading-relaxed text-cream-dim">
              “{OWNER_NOTE.text}”
            </p>
            <p className="mt-4 font-mono text-xs text-cream-faint">{OWNER_NOTE.role}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
