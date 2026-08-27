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
  'gm-catfish': {
    src: '/images/photo/whole-catfish.webp',
    fit: 'cover',
    alt: 'A whole catfish baked in foil under a pepper-sauce crust, with rosemary, lemon and bowls of dipping sauce',
  },
  'sc-snail': {
    src: '/images/photo/peppered-snail.webp',
    fit: 'cover',
    alt: 'Peppered snail in a red pepper sauce with onions',
  },
  'sc-puffpuff': {
    src: '/images/photo/puff-puff.webp',
    fit: 'cover',
    alt: 'Golden puff-puff piled in paper',
  },
  'sc-springrolls': {
    src: '/images/photo/spring-rolls.webp',
    fit: 'cover',
    alt: 'A stack of crisp fried spring rolls',
  },
  'sc-suya': {
    src: '/images/photo/chicken-suya.webp',
    fit: 'cover',
    alt: 'Spice-dusted chicken with sliced red onion and tomato',
  },
  'ss-eforiro': {
    src: '/images/photo/efo-riro.webp',
    fit: 'cover',
    alt: 'Efo riro: spinach stew with assorted meat, stockfish and red pepper',
  },
  'ss-peppersoup': {
    src: '/images/photo/catfish-pepper-soup.webp',
    fit: 'cover',
    alt: 'Catfish in a peppery broth with scent leaf and chilli',
  },
  'ss-swallow': {
    src: '/images/photo/pounded-yam.webp',
    fit: 'cover',
    alt: 'Three moulded balls of swallow on a plate',
  },
  'rg-friedrice': {
    src: '/images/photo/native-fried-rice.webp',
    fit: 'cover',
    alt: 'Native fried rice with beef, sweet peppers and scent leaf',
  },
  'rg-ofada': {
    src: '/images/photo/ofada-ayamase.webp',
    fit: 'cover',
    alt: 'Ayamase stew with assorted meat and boiled eggs, beside rice and fried plantain',
  },
  'rg-coconut': {
    src: '/images/photo/coconut-rice.webp',
    fit: 'cover',
    alt: 'Coconut rice with sweet peppers, peas, sweetcorn and green beans',
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
