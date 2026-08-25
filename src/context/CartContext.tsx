import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react'
import type { CartLine, Fulfilment, MenuItem } from '../types'
import { useToast } from './ToastContext'

interface CartState {
  lines: CartLine[]
  fulfilment: Fulfilment
  isOpen: boolean
}

type Action =
  | { type: 'add'; item: MenuItem }
  | { type: 'remove'; id: string }
  | { type: 'setQty'; id: string; qty: number }
  | { type: 'clear' }
  | { type: 'setFulfilment'; fulfilment: Fulfilment }
  | { type: 'open' }
  | { type: 'close' }

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'add': {
      const existing = state.lines.find((line) => line.item.id === action.item.id)
      const lines = existing
        ? state.lines.map((line) =>
            line.item.id === action.item.id ? { ...line, qty: line.qty + 1 } : line,
          )
        : [...state.lines, { item: action.item, qty: 1 }]
      return { ...state, lines }
    }
    case 'remove':
      return { ...state, lines: state.lines.filter((line) => line.item.id !== action.id) }
    case 'setQty':
      return {
        ...state,
        lines:
          action.qty <= 0
            ? state.lines.filter((line) => line.item.id !== action.id)
            : state.lines.map((line) =>
                line.item.id === action.id ? { ...line, qty: action.qty } : line,
              ),
      }
    case 'clear':
      return { ...state, lines: [] }
    case 'setFulfilment':
      return { ...state, fulfilment: action.fulfilment }
    case 'open':
      return { ...state, isOpen: true }
    case 'close':
      return { ...state, isOpen: false }
    default:
      return state
  }
}

interface CartContextValue {
  lines: CartLine[]
  fulfilment: Fulfilment
  isOpen: boolean
  count: number
  total: number
  addItem: (item: MenuItem) => void
  removeItem: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  setFulfilment: (fulfilment: Fulfilment) => void
  open: () => void
  close: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    lines: [],
    fulfilment: 'dine-in',
    isOpen: false,
  })
  const { show } = useToast()

  const addItem = useCallback(
    (item: MenuItem) => {
      dispatch({ type: 'add', item })
      show(`Added ${item.name} to your order`)
    },
    [show],
  )

  const value = useMemo<CartContextValue>(() => {
    const count = state.lines.reduce((sum, line) => sum + line.qty, 0)
    const total = state.lines.reduce((sum, line) => sum + line.qty * line.item.price, 0)
    return {
      lines: state.lines,
      fulfilment: state.fulfilment,
      isOpen: state.isOpen,
      count,
      total,
      addItem,
      removeItem: (id) => dispatch({ type: 'remove', id }),
      setQty: (id, qty) => dispatch({ type: 'setQty', id, qty }),
      clear: () => dispatch({ type: 'clear' }),
      setFulfilment: (fulfilment) => dispatch({ type: 'setFulfilment', fulfilment }),
      open: () => dispatch({ type: 'open' }),
      close: () => dispatch({ type: 'close' }),
    }
  }, [state, addItem])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
