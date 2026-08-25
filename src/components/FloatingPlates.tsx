import { FloatingFoodHero } from '@/components/ui/hero-section-7'

/**
 * The FloatingFoodHero reference content, rendered with the site's own
 * artwork. Title, description, alt text and the per-image position classes
 * are the demo's verbatim; `aspect-square` is added to each because an
 * absolutely-positioned img given only a width collapses to zero height.
 */
const HERO_IMAGES = [
  {
    src: '/images/demo-burger.svg',
    alt: 'A delicious cheeseburger',
    className:
      'aspect-square w-40 sm:w-56 md:w-64 lg:w-72 top-10 left-4 sm:left-10 md:top-20 md:left-20 animate-float',
  },
  {
    src: '/images/demo-steamer.svg',
    alt: 'A bamboo steamer with dumplings',
    className:
      'aspect-square w-28 sm:w-36 md:w-48 top-10 right-4 sm:right-10 md:top-16 md:right-16 animate-float',
  },
  {
    src: '/images/demo-pizza.svg',
    alt: 'A slice of pizza',
    className:
      'aspect-square w-32 sm:w-40 md:w-56 bottom-8 right-5 sm:right-10 md:bottom-16 md:right-20 animate-float',
  },
  {
    src: '/images/demo-basil.svg',
    alt: 'A basil leaf',
    className: 'aspect-square w-8 sm:w-12 top-1/4 left-1/3 animate-float',
  },
  {
    src: '/images/demo-tomato.svg',
    alt: 'A slice of tomato',
    className: 'aspect-square w-8 sm:w-10 top-1/2 right-1/4 animate-float',
  },
  {
    src: '/images/demo-tomato.svg',
    alt: 'A slice of tomato',
    className: 'aspect-square w-8 sm:w-10 top-3/4 left-1/4 animate-float',
  },
]

export function FloatingPlates() {
  return (
    <FloatingFoodHero
      title="Better food for more people"
      description="For over a decade, we've enabled our customers to discover new tastes, delivered right to their doorstep."
      images={HERO_IMAGES}
      className={[
        'border-y border-hairline',
        // the swirls paint with currentColor
        'text-gold/25',
        // headings on this site are Fraunces, not the body face
        '[&_h1]:font-display [&_h1]:font-semibold [&_h1]:tracking-normal',
      ].join(' ')}
    />
  )
}
