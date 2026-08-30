import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface ToastItem {
  id: number
  message: string
}

interface ToastContextValue {
  show: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)
  const timers = useRef(new Set<number>())

  // Every pending dismissal is cancelled on unmount, so nothing is left holding
  // a timer that fires into a torn-down tree.
  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const timer of pending) window.clearTimeout(timer)
      pending.clear()
    }
  }, [])

  const show = useCallback((message: string) => {
    const id = ++counter.current
    setToasts((current) => [...current, { id, message }])
    const timer = window.setTimeout(() => {
      timers.current.delete(timer)
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 2600)
    timers.current.add(timer)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-sq border border-gold/40 bg-wine px-4 py-3 font-mono text-xs uppercase tracking-wider text-cream shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
