import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { dishImage, formatNaira } from '../utils/format'
import { buildWhatsAppLink } from '../utils/whatsapp'
import { BUSINESS } from '../data/business'
import type { Fulfilment } from '../types'
import { CartIcon, CloseIcon, MinusIcon, PhoneIcon, PlusIcon, TrashIcon, WhatsAppIcon } from './Icons'

const FULFILMENT_OPTIONS: { value: Fulfilment; label: string }[] = [
  { value: 'dine-in', label: 'Dine-in' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'delivery', label: 'Delivery' },
]

export function CartDrawer() {
  const cart = useCart()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  useBodyScrollLock(cart.isOpen)

  useEffect(() => {
    if (!cart.isOpen) return
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') cart.close()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [cart])

  if (!cart.isOpen) return null

  const ticketMessage = buildTicketMessage()

  function buildTicketMessage() {
    const lines = cart.lines.map(
      (line) => `${line.qty} x ${line.item.name} — ${formatNaira(line.item.price * line.qty)}`,
    )
    const fulfilmentLabel = FULFILMENT_OPTIONS.find((o) => o.value === cart.fulfilment)?.label
    const parts = [
      `New order — Belle Food (${fulfilmentLabel})`,
      '',
      ...(lines.length ? lines : ['No items added yet']),
      '',
      `Estimated total: ${formatNaira(cart.total)}`,
      '',
      `Name: ${name || '—'}`,
      `Phone: ${phone || '—'}`,
    ]
    if (cart.fulfilment === 'delivery') {
      parts.push(`Delivery address: ${address || '—'}`)
    }
    if (notes) {
      parts.push(`Kitchen notes: ${notes}`)
    }
    return parts.join('\n')
  }

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Close order cart"
        onClick={cart.close}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-hairline bg-ink"
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <div className="flex items-center gap-2">
            <CartIcon className="h-5 w-5 text-gold" />
            <h2 className="font-display text-lg text-cream">Your Order</h2>
          </div>
          <button
            type="button"
            onClick={cart.close}
            className="flex h-9 w-9 items-center justify-center border border-hairline text-cream"
            aria-label="Close"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {cart.lines.length === 0 ? (
            <p className="mt-10 text-center text-sm text-cream-faint">
              Your order is empty. Add a plate from the menu to get started.
            </p>
          ) : (
            <ul className="space-y-4">
              {cart.lines.map((line) => (
                <li key={line.item.id} className="flex items-center gap-3">
                  <img
                    src={dishImage(line.item.id, line.item.name).src}
                    alt=""
                    className={`h-16 w-16 shrink-0 rounded-sq ${dishImage(line.item.id, line.item.name).fit}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-cream">{line.item.name}</p>
                    <p className="font-mono text-xs text-gold-soft">
                      {formatNaira(line.item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => cart.setQty(line.item.id, line.qty - 1)}
                      className="flex h-7 w-7 items-center justify-center border border-hairline text-cream hover:border-gold"
                      aria-label={`Decrease ${line.item.name} quantity`}
                    >
                      <MinusIcon className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center font-mono text-sm">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => cart.setQty(line.item.id, line.qty + 1)}
                      className="flex h-7 w-7 items-center justify-center border border-hairline text-cream hover:border-gold"
                      aria-label={`Increase ${line.item.name} quantity`}
                    >
                      <PlusIcon className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => cart.removeItem(line.item.id)}
                    className="ml-1 flex h-7 w-7 items-center justify-center text-cream-faint hover:text-pepper"
                    aria-label={`Remove ${line.item.name} from order`}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {cart.lines.length > 0 && (
            <>
              <button
                type="button"
                onClick={cart.clear}
                className="mt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-cream-faint hover:text-pepper"
              >
                Clear order
              </button>

              <div className="mt-6 border-t border-hairline pt-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gold">
                  Fulfilment
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {FULFILMENT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => cart.setFulfilment(option.value)}
                      className={`rounded-sq border px-2 py-2 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors ${
                        cart.fulfilment === option.value
                          ? 'border-gold bg-gold text-ink'
                          : 'border-hairline text-cream-dim hover:border-gold hover:text-gold-soft'
                      }`}
                      aria-pressed={cart.fulfilment === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-4 border-t border-hairline pt-6">
                <div>
                  <label htmlFor="cart-name" className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream-dim">
                    Name
                  </label>
                  <input
                    id="cart-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Your name"
                    className="mt-1.5 w-full rounded-sq border border-hairline bg-wine px-3 py-2.5 text-sm text-cream placeholder:text-cream-faint focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="cart-phone" className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream-dim">
                    Phone
                  </label>
                  <input
                    id="cart-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    placeholder="080..."
                    className="mt-1.5 w-full rounded-sq border border-hairline bg-wine px-3 py-2.5 text-sm text-cream placeholder:text-cream-faint focus:border-gold focus:outline-none"
                  />
                </div>
                {cart.fulfilment === 'delivery' && (
                  <div>
                    <label htmlFor="cart-address" className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream-dim">
                      Delivery address
                    </label>
                    <input
                      id="cart-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      type="text"
                      placeholder="Street, area"
                      className="mt-1.5 w-full rounded-sq border border-hairline bg-wine px-3 py-2.5 text-sm text-cream placeholder:text-cream-faint focus:border-gold focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="cart-notes" className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream-dim">
                    Kitchen notes
                  </label>
                  <textarea
                    id="cart-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Allergies, spice level, anything else"
                    className="mt-1.5 w-full resize-none rounded-sq border border-hairline bg-wine px-3 py-2.5 text-sm text-cream placeholder:text-cream-faint focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-hairline px-6 py-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-cream-dim">
              Estimated total
            </span>
            <span className="font-display text-xl text-gold-soft">{formatNaira(cart.total)}</span>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            <a
              href={buildWhatsAppLink(ticketMessage)}
              target="_blank"
              rel="noreferrer"
              aria-disabled={cart.lines.length === 0}
              onClick={(e) => {
                if (cart.lines.length === 0) e.preventDefault()
              }}
              className={`btn btn-primary ${cart.lines.length === 0 ? 'pointer-events-none opacity-40' : ''}`}
            >
              <WhatsAppIcon className="h-4 w-4" />
              Prepare WhatsApp Ticket
            </a>
            <a href={`tel:${BUSINESS.phoneTel}`} className="btn btn-ghost">
              <PhoneIcon className="h-4 w-4" />
              Call Instead
            </a>
          </div>
        </div>
      </aside>
    </div>
  )
}
