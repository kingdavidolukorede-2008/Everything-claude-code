import { FloatingFoodHero } from '@/components/ui/hero-section-7'

/**
 * The site's main hero: the FloatingFoodHero reference content, rendered
 * with the site's own artwork. Title and description are the demo's verbatim.
 *
 * The largest plate is a photograph rather than an engraving — jollof rice is
 * the dish this restaurant is actually known for, so it leads.
 *
 * Each plate declares the lane it belongs to and nothing else about where it
 * sits. The demo positioned these absolutely at fractions of the section
 * (`left-1/3`, `top-1/2`), which walked them straight into the centred type as
 * the window narrowed; lanes give the food and the letters each their own
 * column instead. `className` is therefore size and drift only — the small
 * `lg:translate-*` nudges keep the column from reading as a rigid stack, and
 * stay well inside the lane's own width.
 */
const HERO_IMAGES = [
  {
    src: '/images/demo-basil.svg',
    alt: 'A basil leaf',
    side: 'left' as const,
    className: 'w-7 sm:w-9 xl:w-11 xl:translate-x-10',
  },
  {
    src: '/images/photo/jollof-rice.webp',
    alt: 'A plate of jollof rice with chicken drumsticks, sweet peppers and peas',
    side: 'left' as const,
    className: 'w-36 sm:w-44 md:w-52 xl:w-72',
  },
  {
    src: '/images/demo-tomato.svg',
    alt: 'A slice of tomato',
    side: 'left' as const,
    className: 'w-7 sm:w-9 xl:w-10 xl:translate-x-20',
  },
  {
    src: '/images/demo-steamer.svg',
    alt: 'A bamboo steamer with dumplings',
    side: 'right' as const,
    className: 'w-20 sm:w-24 md:w-28 xl:w-40',
  },
  {
    src: '/images/demo-tomato.svg',
    alt: 'A slice of tomato',
    side: 'right' as const,
    className: 'w-7 sm:w-9 xl:w-10 xl:-translate-x-16',
  },
  {
    src: '/images/demo-pizza.svg',
    alt: 'A slice of pizza',
    side: 'right' as const,
    className: 'w-24 sm:w-28 md:w-32 xl:w-48 xl:-translate-x-6',
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
