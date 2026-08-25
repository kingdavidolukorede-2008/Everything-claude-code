import { useState } from 'react'
import { BUSINESS, NAV_LINKS } from '../data/business'
import { useCart } from '../context/CartContext'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { CartIcon, CloseIcon, MenuIcon, PhoneIcon } from './Icons'

interface NavProps {
  onReserve: () => void
}

export function Nav({ onReserve }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const cart = useCart()
  useBodyScrollLock(mobileOpen)

  function handleLinkClick() {
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-ink/82 backdrop-blur">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="#top" className="font-display text-xl font-semibold tracking-tight">
          <span className="text-cream">BELLE</span> <span className="text-gold">FOOD</span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-xs uppercase tracking-[0.1em] text-cream-dim transition-colors hover:text-gold-soft"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={`tel:${BUSINESS.phoneTel}`} className="btn btn-ghost" aria-label="Call Belle Food">
            <PhoneIcon className="h-4 w-4" />
            Call
          </a>
          <button type="button" onClick={onReserve} className="btn btn-ghost">
            Reserve
          </button>
          <button
            type="button"
            onClick={cart.open}
            className="btn btn-primary relative"
            aria-label={`Open order cart, ${cart.count} item${cart.count === 1 ? '' : 's'}`}
          >
            <CartIcon className="h-4 w-4" />
            Order
            {cart.count > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cream px-1 text-[11px] font-semibold text-pepper">
                {cart.count}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={cart.open}
            className="relative flex h-10 w-10 items-center justify-center border border-hairline text-cream"
            aria-label={`Open order cart, ${cart.count} item${cart.count === 1 ? '' : 's'}`}
          >
            <CartIcon className="h-5 w-5" />
            {cart.count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pepper px-1 text-[11px] font-semibold text-cream">
                {cart.count}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center border border-hairline text-cream"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-hairline bg-ink px-5 py-6 lg:hidden">
          <nav className="flex flex-col gap-5" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="font-mono text-sm uppercase tracking-[0.1em] text-cream-dim hover:text-gold-soft"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <a href={`tel:${BUSINESS.phoneTel}`} className="btn btn-ghost">
              <PhoneIcon className="h-4 w-4" />
              Call
            </a>
            <button
              type="button"
              onClick={() => {
                onReserve()
                setMobileOpen(false)
              }}
              className="btn btn-ghost"
            >
              Reserve
            </button>
            <button
              type="button"
              onClick={() => {
                cart.open()
                setMobileOpen(false)
              }}
              className="btn btn-primary"
            >
              <CartIcon className="h-4 w-4" />
              Start an order
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
