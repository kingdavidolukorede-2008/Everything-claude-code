import { useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The reference component's own list, kept so the stock demo renders exactly as
 * published. Anything in the app passes its own `options`.
 */
export const CUISINES = [
  'Mexican',
  'Italian',
  'Chinese',
  'Japanese',
  'Indian',
  'Greek',
  'French',
  'Spanish',
  'Turkish',
  'Lebanese',
  'Vietnamese',
  'Korean',
  'Argentinian',
  'Peruvian',
  'Ethiopian',
  'Nigerian',
  'German',
  'British',
  'Irish',
  'Swedish',
  'Danish',
  'Polish',
  'Hungarian',
  'Portuguese',
]

const transitionProps = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
  mass: 0.5,
} as const

/**
 * Chip colours. The background three are animated by Framer Motion, so they have
 * to be real colour values rather than utility classes; the rest are Tailwind
 * classes applied to the chip. Defaults are the reference component's.
 */
export interface ChipTheme {
  selectedBg: string
  selectedBgHover: string
  selectedBgActive: string
  idleBg: string
  idleBgHover: string
  idleBgActive: string
  /** Tailwind classes for a selected chip's text and inset ring. */
  selectedClassName: string
  /** Tailwind classes for an unselected chip's text and inset ring. */
  idleClassName: string
  /** Tailwind classes for the round tick badge and its icon. */
  badgeClassName: string
  iconClassName: string
}

const DEFAULT_THEME: ChipTheme = {
  selectedBg: '#2a1711',
  selectedBgHover: '#2a1711',
  selectedBgActive: '#1f1209',
  idleBg: 'rgba(39, 39, 42, 0.5)',
  idleBgHover: 'rgba(39, 39, 42, 0.8)',
  idleBgActive: 'rgba(39, 39, 42, 0.9)',
  selectedClassName: 'text-[#ff9066] ring-[hsla(0,0%,100%,0.12)]',
  idleClassName: 'text-zinc-400 ring-[hsla(0,0%,100%,0.06)]',
  badgeClassName: 'bg-[#ff9066]',
  iconClassName: 'text-[#2a1711]',
}

export interface CuisineChipsProps {
  /** Chip labels. Defaults to the reference component's cuisine list. */
  options?: readonly string[]
  /** Selected labels. Pass this (with `onChange`) to drive the group yourself. */
  value?: readonly string[]
  /** Starting selection when the group keeps its own state. */
  defaultValue?: readonly string[]
  onChange?: (selected: string[]) => void
  /** Override any subset of the chip colours. */
  theme?: Partial<ChipTheme>
  /** Classes for the wrapping flex row. */
  className?: string
  /** Classes for every chip — use it to restyle the type. */
  chipClassName?: string
  label?: string
}

/**
 * A wrapping row of toggle chips that reflow with a spring as each one grows to
 * make room for its tick. The layout animation is the point of the component:
 * `layout` on the row and on every chip is what makes the others slide rather
 * than jump when one changes width.
 *
 * Controlled when given `value`, uncontrolled otherwise. Motion is dropped to
 * near-instant under `prefers-reduced-motion`, which Framer Motion does not do
 * on its own — the site's global CSS reduced-motion rules only reach CSS
 * animation, never JS-driven transforms.
 */
export function CuisineChips({
  options = CUISINES,
  value,
  defaultValue = [],
  onChange,
  theme,
  className,
  chipClassName,
  label,
}: CuisineChipsProps) {
  const [internal, setInternal] = useState<string[]>(() => [...defaultValue])
  const selected = value ? [...value] : internal
  const colors = theme ? { ...DEFAULT_THEME, ...theme } : DEFAULT_THEME

  /**
   * Toggling off the rendered `selected` loses a chip whenever two toggles land
   * in one React batch: both would read the same pre-batch snapshot and the
   * second would overwrite the first. The ref carries the running selection
   * between renders so each toggle builds on the last one.
   */
  const latest = useRef(selected)
  latest.current = selected

  const toggle = (option: string) => {
    const current = latest.current
    const next = current.includes(option)
      ? current.filter((c) => c !== option)
      : [...current, option]
    latest.current = next
    if (!value) setInternal(next)
    onChange?.(next)
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={cn('flex flex-wrap gap-3 overflow-visible', className)}
        layout
        transition={transitionProps}
        role="group"
        aria-label={label}
      >
        {options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <motion.button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              aria-pressed={isSelected}
              layout
              initial={false}
              animate={{ backgroundColor: isSelected ? colors.selectedBg : colors.idleBg }}
              whileHover={{
                backgroundColor: isSelected ? colors.selectedBgHover : colors.idleBgHover,
              }}
              whileTap={{
                backgroundColor: isSelected ? colors.selectedBgActive : colors.idleBgActive,
              }}
              transition={{ ...transitionProps, backgroundColor: { duration: 0.1 } }}
              className={cn(
                'inline-flex items-center overflow-hidden whitespace-nowrap rounded-full px-4 py-2 text-base font-medium ring-1 ring-inset',
                isSelected ? colors.selectedClassName : colors.idleClassName,
                chipClassName,
              )}
            >
              <motion.div
                className="relative flex items-center"
                animate={{
                  width: isSelected ? 'auto' : '100%',
                  paddingRight: isSelected ? '1.5rem' : '0',
                }}
                transition={{ ease: [0.175, 0.885, 0.32, 1.275], duration: 0.3 }}
              >
                <span>{option}</span>
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={transitionProps}
                      className="absolute right-0"
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full',
                          colors.badgeClassName,
                        )}
                      >
                        <Check
                          className={cn('h-3 w-3', colors.iconClassName)}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </div>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.button>
          )
        })}
      </motion.div>
    </MotionConfig>
  )
}

/**
 * The published demo, unchanged: the full-page cuisine picker on black. Kept so
 * the reference usage still renders; the app uses `CuisineChips` directly.
 */
export default function CuisineSelector() {
  return (
    <div className="min-h-screen w-full bg-black p-6 pt-40">
      <h1 className="mb-12 text-center text-3xl font-semibold text-white">
        What are your favorite cuisines?
      </h1>
      <div className="mx-auto max-w-[570px]">
        <CuisineChips label="Favourite cuisines" />
      </div>
    </div>
  )
}
