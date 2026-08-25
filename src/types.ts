export type Fulfilment = 'dine-in' | 'takeaway' | 'delivery'

export type MenuCategory =
  | 'Small Chops'
  | 'Soups & Swallow'
  | 'Rice & Grains'
  | 'Grills & Mains'
  | 'Drinks'

export interface MenuItem {
  id: string
  name: string
  category: MenuCategory
  price: number
  description: string
  image: string
  houseFavourite?: boolean
}

export interface CartLine {
  item: MenuItem
  qty: number
}
