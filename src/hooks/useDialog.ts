import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Makes a container behave like the modal its `aria-modal` claims it is: focus
 * moves inside on open, Tab cycles within it, Escape closes, and focus returns
 * to whatever opened it. Without this a keyboard or screen-reader user tabs
 * straight out of the dialog and into the page behind the overlay.
 *
 * `onClose` is held in a ref so the trap is armed once per open. Re-arming it
 * whenever the callback's identity changed would drag focus back to the first
 * control every time the cart's contents did.
 */
export function useDialog<T extends HTMLElement>(active: boolean, onClose: () => void) {
  const ref = useRef<T>(null)
  const close = useRef(onClose)

  useEffect(() => {
    close.current = onClose
  })

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return

    const opener = document.activeElement as HTMLElement | null
    ;(node.querySelector<HTMLElement>(FOCUSABLE) ?? node).focus()

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close.current()
        return
      }
      if (event.key !== 'Tab' || !node) return

      const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const edge = event.shiftKey ? items[0] : items[items.length - 1]
      if (document.activeElement === edge || !node.contains(document.activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? items[items.length - 1] : items[0]).focus()
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      opener?.focus?.()
    }
  }, [active])

  return ref
}
