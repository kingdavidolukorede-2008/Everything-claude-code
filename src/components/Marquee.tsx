import { MARQUEE_ITEMS } from '../data/business'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function Marquee() {
  const reduced = useReducedMotion()
  const items = reduced ? MARQUEE_ITEMS : [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div className="overflow-hidden border-y border-hairline bg-wine/60 py-3">
      <div
        className={
          reduced
            ? 'flex flex-wrap justify-center gap-x-8 gap-y-2 px-4'
            : 'flex w-max animate-[marquee_26s_linear_infinite]'
        }
      >
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="mx-4 flex items-center gap-4 whitespace-nowrap font-mono text-xs uppercase tracking-[0.14em] text-gold"
          >
            {item}
            <span aria-hidden="true" className="text-cream-faint">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
