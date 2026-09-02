import { DISH_PHOTOS } from '../data/photos'

const NAIRA_FORMATTER = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

export function formatNaira(amount: number): string {
  return NAIRA_FORMATTER.format(amount)
}

/** Every dish's engraved plate lives at /images/<id>.svg */
export function plateFor(id: string): string {
  return `/images/${id}.svg`
}

export interface DishImage {
  src: string
  /** Tailwind object-fit class, so a cutout is not cropped by a square frame. */
  fit: string
  alt: string
  isPhoto: boolean
}

/**
 * The picture to show for a dish: its photograph if one has been shot, its
 * engraving otherwise. Framing and alt text follow from that, so no call site
 * has to know which dishes have been photographed.
 */
export function dishImage(id: string, name: string): DishImage {
  const photo = DISH_PHOTOS[id]
  if (photo) {
    return {
      src: photo.src,
      fit: photo.fit === 'contain' ? 'object-contain' : 'object-cover',
      alt: photo.alt ?? name,
      isPhoto: true,
    }
  }
  return { src: plateFor(id), fit: 'object-cover', alt: `Engraving of ${name}`, isPhoto: false }
}
