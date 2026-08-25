import { cn } from '@/lib/utils'

/**
 * @typedef FloatingImageProps
 * @property {string} src - The source URL for the image.
 * @property {string} alt - The alt text for the image for accessibility.
 * @property {string} className - Tailwind CSS classes for positioning, sizing, and animation.
 */
interface FloatingImageProps {
  src: string
  alt: string
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
 * A responsive hero section with images drifting around centred text.
 * Motion is disabled under `prefers-reduced-motion`.
 */
export function FloatingFoodHero({
  title,
  description,
  images,
  className,
}: FloatingFoodHeroProps) {
  return (
    <section
      className={cn(
        'relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden bg-background py-20 md:py-32 lg:min-h-[80vh]',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <Swirls />
      </div>

      {/* Floating images */}
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
        {images.map((image, index) => (
          <img
            key={image.src + index}
            src={image.src}
            alt={image.alt}
            loading="lazy"
            className={cn('absolute object-contain', image.className)}
            style={{ animationDelay: `${index * 300}ms` }}
          />
        ))}
      </div>

      {/* Text content */}
      <div className="container relative z-20 mx-auto max-w-2xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">{description}</p>
      </div>
    </section>
  )
}
