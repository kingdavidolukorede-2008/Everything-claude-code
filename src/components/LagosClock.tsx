import { useLagosClock } from '../hooks/useLagosClock'

/**
 * The Lagos time, on its own so the clock's once-a-second tick re-renders a
 * single span. Called from Hero or Visit directly, the hook re-rendered the
 * whole hero — engraved dial and all — every second.
 */
export function LagosClock({ withDay = false }: { withDay?: boolean }) {
  const { time, dayLabel } = useLagosClock()
  return (
    <>
      {time} WAT{withDay ? ` · ${dayLabel}` : ''}
    </>
  )
}
