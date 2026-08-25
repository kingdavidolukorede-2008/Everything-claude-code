import { useMemo, useState } from 'react'
import { MENU_CATEGORIES, MENU_ITEMS, MENU_OVERVIEW, ORDER_YOUR_WAY } from '../data/menu'
import type { MenuCategory } from '../types'
import { useCart } from '../context/CartContext'
import { formatNaira } from '../utils/format'
import { Container } from './Container'
import { Reveal } from './Reveal'
import { PlusIcon } from './Icons'

type Filter = 'All' | MenuCategory

const FILTERS: Filter[] = ['All', ...MENU_CATEGORIES]

export function MenuSection() {
  const [filter, setFilter] = useState<Filter>('All')
  const cart = useCart()

  const items = useMemo(
    () => (filter === 'All' ? MENU_ITEMS : MENU_ITEMS.filter((item) => item.category === filter)),
    [filter],
  )

  return (
    <section id="menu" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <p className="eyebrow">On the Table</p>
          <h2 className="mt-4 max-w-xl font-display text-4xl leading-tight text-cream sm:text-5xl">
            The menu, by the hour.
          </h2>
          <p className="mt-4 max-w-xl text-sm text-cream-faint">
            Guide prices in Naira — full pricing is best confirmed on arrival or on Glovo.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {MENU_OVERVIEW.map((card, i) => (
            <Reveal key={card.number} delay={i * 60}>
              <div className="card-hover flex h-full flex-col gap-4 bg-wine p-7">
                <span className="font-mono text-xs text-gold">{card.number}</span>
                <h3 className="font-display text-lg text-cream">{card.title}</h3>
                <p className="text-sm leading-relaxed text-cream-dim">{card.description}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={MENU_OVERVIEW.length * 60}>
            <div className="card-hover flex h-full flex-col gap-4 bg-wine p-7">
              <span className="font-mono text-xs text-gold">{ORDER_YOUR_WAY.number}</span>
              <h3 className="font-display text-lg text-cream">{ORDER_YOUR_WAY.title}</h3>
              <ul className="space-y-1.5 text-sm text-cream-dim">
                {ORDER_YOUR_WAY.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="mt-16 flex flex-wrap gap-2" role="group" aria-label="Filter menu by category">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`font-mono text-xs uppercase tracking-[0.1em] px-4 py-2 rounded-sq border transition-colors ${
                filter === f
                  ? 'border-gold bg-gold text-ink'
                  : 'border-hairline text-cream-dim hover:border-gold hover:text-gold-soft'
              }`}
              aria-pressed={filter === f}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={(i % 6) * 60}>
              <article className="card card-hover flex h-full gap-4 overflow-hidden p-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-24 shrink-0 rounded-sq object-cover"
                  loading="lazy"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base text-cream">{item.name}</h3>
                    {item.houseFavourite && (
                      <span className="chip shrink-0 !px-1.5 !py-0.5 text-[10px]">House favourite</span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-cream-faint">
                    {item.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-mono text-sm text-gold-soft">
                      {formatNaira(item.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => cart.addItem(item)}
                      className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.08em] text-cream hover:text-gold-soft"
                      aria-label={`Add ${item.name} to order`}
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
