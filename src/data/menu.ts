import type { MenuCategory, MenuItem } from '../types'

export const MENU_CATEGORIES: MenuCategory[] = [
  'Small Chops',
  'Soups & Swallow',
  'Rice & Grains',
  'Grills & Mains',
  'Drinks',
]

export const MENU_ITEMS: MenuItem[] = [
  // Small Chops
  {
    id: 'sc-snail',
    name: 'Peppered Snail',
    category: 'Small Chops',
    price: 6500,
    description: 'Charred garden snail tossed through a fiery pepper sauce.',
    image: '/images/menu-small-chops.svg',
  },
  {
    id: 'sc-puffpuff',
    name: 'Puff-Puff',
    category: 'Small Chops',
    price: 2000,
    description: 'Golden, pillow-soft street classic, fried to order.',
    image: '/images/menu-small-chops.svg',
  },
  {
    id: 'sc-springrolls',
    name: 'Spring Rolls',
    category: 'Small Chops',
    price: 3500,
    description: 'Crisp shells packed with spiced vegetables.',
    image: '/images/menu-small-chops.svg',
  },
  {
    id: 'sc-suya',
    name: 'Chicken Suya Skewers',
    category: 'Small Chops',
    price: 5500,
    description: 'Smoky grilled chicken dusted in yaji spice.',
    image: '/images/menu-small-chops.svg',
    houseFavourite: true,
  },

  // Soups & Swallow
  {
    id: 'ss-eforiro',
    name: 'Efo Riro',
    category: 'Soups & Swallow',
    price: 4500,
    description: 'Vegetable soup layered with assorted meat and fish.',
    image: '/images/menu-soups-swallow.svg',
  },
  {
    id: 'ss-egusi',
    name: 'Egusi Soup',
    category: 'Soups & Swallow',
    price: 4500,
    description: 'Ground melon-seed soup, thick and full-bodied.',
    image: '/images/dish-egusi-poundedyam.svg',
    houseFavourite: true,
  },
  {
    id: 'ss-peppersoup',
    name: 'Catfish Pepper Soup',
    category: 'Soups & Swallow',
    price: 8500,
    description: 'Whole catfish in a clear, fiery herbal broth.',
    image: '/images/menu-soups-swallow.svg',
  },
  {
    id: 'ss-swallow',
    name: 'Pounded Yam / Eba / Semo',
    category: 'Soups & Swallow',
    price: 1500,
    description: 'Your swallow of choice, pounded fresh to order.',
    image: '/images/menu-soups-swallow.svg',
  },

  // Rice & Grains
  {
    id: 'rg-jollof',
    name: 'Party Jollof',
    category: 'Rice & Grains',
    price: 5500,
    description: 'Smoky, oven-finished party jollof rice.',
    image: '/images/dish-party-jollof.svg',
    houseFavourite: true,
  },
  {
    id: 'rg-friedrice',
    name: 'Native Fried Rice',
    category: 'Rice & Grains',
    price: 6000,
    description: 'Fried rice built on native spice, not curry powder.',
    image: '/images/menu-rice-grains.svg',
  },
  {
    id: 'rg-ofada',
    name: 'Ofada Rice & Ayamase',
    category: 'Rice & Grains',
    price: 7500,
    description: 'Local ofada rice with a green-pepper ayamase sauce.',
    image: '/images/menu-rice-grains.svg',
  },
  {
    id: 'rg-coconut',
    name: 'Coconut Rice',
    category: 'Rice & Grains',
    price: 5500,
    description: 'Rice slow-simmered in coconut milk and pepper.',
    image: '/images/menu-rice-grains.svg',
  },

  // Grills & Mains
  {
    id: 'gm-catfish',
    name: 'Grilled Catfish',
    category: 'Grills & Mains',
    price: 12000,
    description: 'Whole catfish, char-grilled and pepper-glazed.',
    image: '/images/dish-whole-catfish.svg',
    houseFavourite: true,
  },
  {
    id: 'gm-chicken',
    name: 'Peppered Chicken',
    category: 'Grills & Mains',
    price: 7500,
    description: 'Chicken parts fried and finished in pepper sauce.',
    image: '/images/menu-grills-mains.svg',
  },
  {
    id: 'gm-turkey',
    name: 'Turkey & Chips',
    category: 'Grills & Mains',
    price: 8500,
    description: 'Grilled turkey with hand-cut fries.',
    image: '/images/menu-grills-mains.svg',
  },
  {
    id: 'gm-platter',
    name: 'Assorted Meat Platter',
    category: 'Grills & Mains',
    price: 15000,
    description: 'Beef, chicken, turkey and shaki, built for the table.',
    image: '/images/menu-grills-mains.svg',
  },

  // Drinks
  {
    id: 'dr-chapman',
    name: 'Chapman',
    category: 'Drinks',
    price: 2500,
    description: 'The house mix, chilled and citrus-bright.',
    image: '/images/menu-drinks.svg',
    houseFavourite: true,
  },
  {
    id: 'dr-zobo',
    name: 'Zobo',
    category: 'Drinks',
    price: 1500,
    description: 'Hibiscus, ginger and clove, steeped overnight.',
    image: '/images/menu-drinks.svg',
  },
  {
    id: 'dr-malt',
    name: 'Chilled Malt',
    category: 'Drinks',
    price: 1200,
    description: 'Ice-cold malt, straight from the fridge.',
    image: '/images/menu-drinks.svg',
  },
  {
    id: 'dr-juice',
    name: 'Fresh Juice',
    category: 'Drinks',
    price: 2000,
    description: 'Seasonal fruit, pressed fresh to order.',
    image: '/images/menu-drinks.svg',
  },
]

export const FEATURED_DISHES: MenuItem[] = [
  {
    id: 'rg-jollof',
    name: 'Party Jollof',
    category: 'Rice & Grains',
    price: 5500,
    description:
      'Smoky, oven-finished party jollof — the kind that makes a room go quiet for a minute.',
    image: '/images/dish-party-jollof.svg',
    houseFavourite: true,
  },
  {
    id: 'gm-catfish',
    name: 'Whole Catfish',
    category: 'Grills & Mains',
    price: 12000,
    description:
      'Char-grilled whole catfish, glazed in pepper sauce, plated for sharing.',
    image: '/images/dish-whole-catfish.svg',
    houseFavourite: true,
  },
  {
    id: 'feat-egusi-poundedyam',
    name: 'Egusi & Pounded Yam',
    category: 'Soups & Swallow',
    price: 6000,
    description:
      'Ground egusi soup, thick with assorted meat and stockfish, spooned beside hot pounded yam.',
    image: '/images/dish-egusi-poundedyam.svg',
    houseFavourite: true,
  },
]

export const MENU_OVERVIEW = [
  {
    number: '01',
    title: 'Small Chops',
    description: "Bright, shareable starters for a table that's just getting going.",
  },
  {
    number: '02',
    title: 'Soups & Swallow',
    description: 'Slow, deep-flavoured soups spooned beside swallow made to order.',
  },
  {
    number: '03',
    title: 'Rice & Grains',
    description: "Smoky jollof to native fried rice — the Lagos rice canon.",
  },
  {
    number: '04',
    title: 'Grills & Mains',
    description: 'Off the grill, pepper-glazed, built for a proper appetite.',
  },
  {
    number: '05',
    title: 'Drinks',
    description: 'Chilled, citrus-bright, zero-proof — built for any hour.',
  },
] as const

export const ORDER_YOUR_WAY = {
  number: '06',
  title: 'Order It Your Way',
  items: [
    'Dine-in seating',
    'Takeaway packaging',
    'No-contact delivery',
    'Via Glovo or by phone',
  ],
} as const
