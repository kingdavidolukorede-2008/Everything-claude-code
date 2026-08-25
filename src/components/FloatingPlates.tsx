import { FloatingFoodHero } from '@/components/ui/hero-section-7'

/**
 * The floating-plates interlude between the featured dishes and the menu.
 * Uses the engraved cut-outs (no ground) so the plates read as drifting
 * objects rather than tiles.
 *
 * Every plate carries `aspect-square`: the artwork is square, and an
 * absolutely-positioned img given only a width collapses to zero height.
 */
const PLATE = 'absolute aspect-square animate-float'

const HERO_IMAGES = [
  {
    src: '/images/rg-jollof-cutout.svg',
    alt: 'An engraving of a plate of party jollof rice',
    className: `${PLATE} w-44 sm:w-60 md:w-72 lg:w-80 -top-4 -left-6 sm:left-0 md:-top-2 md:left-4 opacity-95`,
  },
  {
    src: '/images/gm-catfish-cutout.svg',
    alt: 'An engraving of a whole grilled catfish on a platter',
    className: `${PLATE} w-40 sm:w-56 md:w-68 lg:w-76 -top-6 -right-6 sm:right-0 md:-top-4 md:right-2 opacity-95`,
  },
  {
    src: '/images/sc-suya-cutout.svg',
    alt: 'An engraving of chicken suya skewers on a board',
    className: `${PLATE} w-40 sm:w-52 md:w-64 -bottom-8 -left-4 sm:left-2 md:-bottom-6 md:left-10 opacity-95`,
  },
  {
    src: '/images/ss-egusi-cutout.svg',
    alt: 'An engraving of a bowl of egusi soup',
    className: `${PLATE} w-36 sm:w-52 md:w-64 -bottom-6 -right-4 sm:right-2 md:-bottom-4 md:right-10 opacity-95`,
  },
  {
    src: '/images/dr-chapman-cutout.svg',
    alt: 'An engraving of a glass of Chapman',
    className: `${PLATE} hidden lg:block w-24 top-[3%] left-[44%] opacity-70`,
  },
  {
    src: '/images/sc-snail-cutout.svg',
    alt: 'An engraving of peppered snails',
    className: `${PLATE} hidden lg:block w-28 bottom-[4%] left-[52%] opacity-70`,
  },
]

export function FloatingPlates() {
  return (
    <FloatingFoodHero
      title="Whatever hour brings you in."
      description="Small chops at noon, a whole catfish at midnight, pepper soup at 3am — the grill stays lit and the plates keep coming."
      images={HERO_IMAGES}
      className={[
        'border-y border-hairline',
        // the swirls paint with currentColor
        'text-gold/25',
        // tighten the band; the component defaults to 60vh / 80vh
        'min-h-[520px] py-16 md:py-20 lg:min-h-[600px]',
        // headings on this site are Fraunces, not the body face
        '[&_h1]:font-display [&_h1]:font-semibold [&_h1]:tracking-normal',
      ].join(' ')}
    />
  )
}
