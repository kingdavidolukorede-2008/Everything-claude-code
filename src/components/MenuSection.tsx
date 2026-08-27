import { useMemo, useState } from 'react'
import { MENU_CATEGORIES, MENU_ITEMS, MENU_OVERVIEW, ORDER_YOUR_WAY } from '../data/menu'
import type { MenuCategory } from '../types'
import { useCart } from '../context/CartContext'
import { dishImage, formatNaira } from '../utils/format'
import { Container } from './Container'
import { Reveal } from './Reveal'
import { PlusIcon } from './Icons'
import { CuisineChips, type ChipTheme } from './ui/cuisine-selector-chips'

/**
 * The chip group ships in an orange-on-zinc palette; this is the same set of
 * roles in Belle Food's. The three background values are animated, so they have
 * to be literal colours — the rest ride on the theme's utility classes.
 */
const FILTER_THEME: Partial<ChipTheme> = {
  selectedBg: '#2c2113',
  selectedBgHover: '#352817',
  selectedBgActive: '#221a0f',
  idleBg: 'rgba(244, 232, 216, 0.03)',
  idleBgHover: 'rgba(244, 232, 216, 0.07)',
  idleBgActive: 'rgba(244, 232, 216, 0.10)',
  selectedClassName: 'text-gold-soft ring-gold/40',
  idleClassName: 'text-cream-dim ring-hairline',
  badgeClassName: 'bg-gold',
  iconClassName: 'text-ink',
}

export function MenuSection() {
  const [filters, setFilters] = useState<MenuCategory[]>([])
  const cart = useCart()

  // No selection reads as no filter, which is what the old 'All' chip did.
  const items = useMemo(
    () =>
      filters.length === 0
        ? MENU_ITEMS
        : MENU_ITEMS.filter((item) => filters.includes(item.category)),
    [filters],
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

        <div className="mt-16">
          <CuisineChips
            options={MENU_CATEGORIES}
            value={filters}
            // Every option comes from MENU_CATEGORIES, so the strings coming
            // back are categories.
            onChange={(next) => setFilters(next as MenuCategory[])}
            label="Filter menu by category"
            theme={FILTER_THEME}
            chipClassName="rounded-sq font-mono text-xs uppercase tracking-[0.1em]"
          />
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-cream-faint">
            {filters.length === 0
              ? `Showing all ${MENU_ITEMS.length} dishes — pick a course to narrow it down.`
              : `Showing ${items.length} of ${MENU_ITEMS.length} dishes.`}
          </p>
        </div>

        {/*
          Each Reveal is the grid item, so it carries `min-w-0`: without it the
          track cannot shrink below the card's min-content and the page scrolls
          sideways under about 375px.
        */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const picture = dishImage(item.id, item.name)
            return (
              <Reveal key={item.id} className="min-w-0" delay={(i % 6) * 60}>
                <article className="card card-hover flex h-full min-h-[148px] gap-4 overflow-hidden p-4">
                  <img
                    src={picture.src}
                    alt={picture.alt}
                    className={`h-28 w-28 shrink-0 rounded-sq ${picture.fit}`}
                    loading="lazy"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="font-display text-base leading-snug text-cream">{item.name}</h3>
                    <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-cream-faint">
                      {item.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span className="font-mono text-sm text-gold-soft">
                          {formatNaira(item.price)}
                        </span>
                        {item.houseFavourite && (
                          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.08em] text-gold">
                            <span aria-hidden="true">&#10022;</span> Favourite
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => cart.addItem(item)}
                        className="flex shrink-0 items-center gap-1 font-mono text-[11px] uppercase tracking-[0.08em] text-cream hover:text-gold-soft"
                        aria-label={`Add ${item.name} to order`}
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                        Add
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
