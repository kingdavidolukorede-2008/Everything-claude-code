import { FloatingFoodHero } from '@/components/ui/hero-section-7'

/**
 * The site's main hero: the FloatingFoodHero reference content, rendered
 * with the site's own artwork. Title, description and the per-image position
 * classes are the demo's verbatim; `aspect-square` is added to each because an
 * absolutely-positioned img given only a width collapses to zero height.
 *
 * The three food subjects are photographs rather than engravings — jollof rice,
 * a shawarma wrap and egusi with pounded yam, the dishes this restaurant is
 * actually known for. Only the basil leaf and the tomato slices stay engraved.
 */
const HERO_IMAGES = [
  {
    src: '/images/photo/jollof-rice.webp',
    alt: 'A plate of jollof rice with chicken drumsticks, sweet peppers and peas',
    className:
      'aspect-square w-40 sm:w-56 md:w-64 lg:w-72 top-10 left-4 sm:left-10 md:top-20 md:left-20 animate-float',
  },
  {
    src: '/images/photo/shawarma-wrap.webp',
    alt: 'A shawarma wrap cut in two, with beef, salad and garlic sauce',
    // Wider than it is tall, so `object-contain` letterboxes it inside the
    // square box: the wraps only ever fill about four fifths of the height.
    // The box therefore runs a size class larger than the plates it sits
    // among, to land at the same apparent size on the page.
    className:
      'aspect-square w-32 sm:w-44 md:w-60 top-10 right-4 sm:right-10 md:top-16 md:right-16 animate-float',
  },
  {
    src: '/images/photo/egusi-pounded-yam.webp',
    alt: 'A plate of egusi soup with pounded yam, goat meat and snail',
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
    <div id="top" className="scroll-mt-24">
      <FloatingFoodHero
        title="Better food for more people"
        description="For over a decade, we've enabled our customers to discover new tastes, delivered right to their doorstep."
        images={HERO_IMAGES}
        className={[
          'border-b border-hairline',
          // the swirls paint with currentColor
          'text-gold/25',
          // headings on this site are Fraunces, not the body face
          '[&_h1]:font-display [&_h1]:font-semibold [&_h1]:tracking-normal',
        ].join(' ')}
      />
    </div>
  )
}
