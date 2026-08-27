/**
 * Dishes that have a photograph instead of an engraving.
 *
 * Anything not listed here falls back to `/images/<id>.svg`, so photographs can
 * land one dish at a time without the menu ever showing a gap. `fit` says how
 * the file wants to be framed: `cover` for a full-frame photograph, `contain`
 * for a cutout on transparency, which the square and 4:3 card frames would
 * otherwise crop into.
 */
export interface DishPhoto {
  src: string
  fit: 'cover' | 'contain'
  /** Describes the photograph; falls back to the dish name when omitted. */
  alt?: string
}

export const DISH_PHOTOS: Record<string, DishPhoto> = {
  'rg-jollof': {
    src: '/images/photo/party-jollof.webp',
    fit: 'cover',
    alt: 'A green oval dish of party jollof rice under charred, spice-rubbed chicken thighs',
  },
  'ss-egusi': {
    src: '/images/photo/egusi-pounded-yam.webp',
    fit: 'contain',
    alt: 'Egusi soup with pounded yam, goat meat and snail',
  },
  'feat-egusi-poundedyam': {
    src: '/images/photo/egusi-pounded-yam.webp',
    fit: 'contain',
    alt: 'Egusi soup with pounded yam, goat meat and snail',
  },
}
