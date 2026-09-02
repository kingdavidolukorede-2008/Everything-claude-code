import { Container } from './Container'
import { Reveal } from './Reveal'

const SHOTS = [
  { src: '/images/gallery-1.svg', alt: 'Cinematic wide shot of the Belle Food dining room' },
  { src: '/images/gallery-2.svg', alt: 'The kitchen pass, plating a dish under warm light' },
  { src: '/images/gallery-3.svg', alt: 'A candle-lit table setting at Belle Food' },
  {
    src: '/images/photo/forecourt-night.webp',
    alt: "Belle Food's forecourt at night: the lit 24/7 BELLEFOOD sign above strings of festoon bulbs, with delivery bikes parked by the door",
  },
]

export function GallerySection() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <p className="eyebrow">A Look Inside</p>
          <h2 className="mt-4 max-w-xl font-display text-4xl leading-tight text-cream sm:text-5xl">
            Gold-lit, late-night, Lagos.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4">
          {SHOTS.map((shot, i) => (
            <Reveal key={shot.src} delay={i * 80}>
              <div className="card overflow-hidden">
                <img
                  src={shot.src}
                  alt={shot.alt}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
