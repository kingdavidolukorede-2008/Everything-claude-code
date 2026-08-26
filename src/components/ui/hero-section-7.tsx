import { cn } from '@/lib/utils'

/**
 * @typedef FloatingImageProps
 * @property {string} src - The source URL for the image.
 * @property {string} alt - The alt text for the image for accessibility.
 * @property {'left'|'right'} side - Which lane the image drifts in.
 * @property {string} className - Tailwind CSS classes for sizing and lane offset.
 */
interface FloatingImageProps {
  src: string
  alt: string
  side: 'left' | 'right'
  className: string
}

/**
 * @typedef FloatingFoodHeroProps
 * @property {string} title - The main heading text.
 * @property {string} description - The paragraph text below the heading.
 * @property {FloatingImageProps[]} images - An array of image objects to be displayed.
 * @property {string} [className] - Optional additional classes for the section container.
 */
export interface FloatingFoodHeroProps {
  title: string
  description: string
  images: FloatingImageProps[]
  className?: string
}

/**
 * Decorative background swirls. They paint with `currentColor`, so the colour is
 * whatever text colour the section sets — pass e.g. `text-gold/20` via
 * `className` to theme them.
 */
const Swirls = () => (
  <>
    <svg
      className="absolute left-0 top-0 -translate-x-1/3 -translate-y-1/3"
      width="600"
      height="600"
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M515.266 181.33C377.943 51.564 128.537 136.256 50.8123 293.565C-26.9127 450.874 125.728 600 125.728 600"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
    <svg
      className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4"
      width="700"
      height="700"
      viewBox="0 0 700 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M26.8838 528.274C193.934 689.816 480.051 637.218 594.397 451.983C708.742 266.748 543.953 2.22235 543.953 2.22235"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </>
)

/**
 * One flank of plates. The lane holds real layout space rather than floating
 * over the section, which is what keeps the food off the letters: from `xl` up
 * it is a column beside the text, and below that it collapses to a row above or
 * below it. Either way the grid, not a guessed offset, owns the separation.
 */
function Lane({
  images,
  side,
  delayFrom,
}: {
  images: FloatingImageProps[]
  side: 'left' | 'right'
  delayFrom: number
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex items-center justify-center gap-5 sm:gap-8',
        'xl:flex-col xl:gap-8',
        side === 'left'
          ? 'xl:items-start xl:justify-self-start'
          : 'xl:items-end xl:justify-self-end',
      )}
    >
      {images.map((image, index) => (
        <img
          key={image.src + index}
          src={image.src}
          alt={image.alt}
          loading="lazy"
          className={cn('animate-float max-w-full object-contain', image.className)}
          style={{ animationDelay: `${(delayFrom + index) * 300}ms` }}
        />
      ))}
    </div>
  )
}

/**
 * A responsive hero: plates drift in a lane down each side of the text, and
 * stack above and below it once the screen is too narrow to flank.
 * Motion is disabled under `prefers-reduced-motion`.
 */
export function FloatingFoodHero({
  title,
  description,
  images,
  className,
}: FloatingFoodHeroProps) {
  const left = images.filter((image) => image.side === 'left')
  const right = images.filter((image) => image.side === 'right')

  return (
    <section
      className={cn(
        'relative flex min-h-[36rem] w-full items-center justify-center overflow-hidden bg-background py-20 md:py-28 xl:min-h-[44rem] xl:py-32',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <Swirls />
      </div>

      {/*
        The two lanes are one `1fr` each, so they stay equal and the column of
        type stays centred in the section. `minmax(0,…)` lets a lane fall below
        its plate's width on a tight screen — the plate then scales down under
        `max-w-full` rather than pushing into the text.
      */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-y-14 px-6 xl:max-w-[88rem] xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-x-16 xl:gap-y-0">
        <Lane images={left} side="left" delayFrom={0} />

        <div className="mx-auto max-w-2xl text-center xl:max-w-xl">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{description}</p>
        </div>

        <Lane images={right} side="right" delayFrom={left.length} />
      </div>
    </section>
  )
}
