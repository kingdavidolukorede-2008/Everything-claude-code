import { useEffect, useState, type FormEvent } from 'react'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { BUSINESS } from '../data/business'
import { CloseIcon, PhoneIcon } from './Icons'

interface ReserveModalProps {
  open: boolean
  onClose: () => void
}

const GUEST_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1)

export function ReserveModal({ open, onClose }: ReserveModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [guests, setGuests] = useState(2)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setSubmitted(false)
    }
  }, [open])

  if (!open) return null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close reservation form"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Reserve a table"
        className="relative w-full max-w-md border border-hairline bg-ink"
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <h2 className="font-display text-lg text-cream">Reserve a Table</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-hairline text-cream"
            aria-label="Close"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-10 text-center">
            <p className="font-display text-2xl text-gold-soft">You're on the book.</p>
            <p className="mt-3 text-sm text-cream-dim">
              We've noted your reservation for {guests} guest{guests > 1 ? 's' : ''}
              {date ? ` on ${date}` : ''}
              {time ? ` at ${time}` : ''}. For same-day or late-night bookings, a quick call
              locks it in fastest.
            </p>
            <a
              href={`tel:${BUSINESS.phoneTel}`}
              className="btn btn-primary mt-6 inline-flex"
            >
              <PhoneIcon className="h-4 w-4" />
              Confirm by Phone
            </a>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 block w-full font-mono text-xs uppercase tracking-[0.08em] text-cream-faint hover:text-gold-soft"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
            <div>
              <label htmlFor="rsv-name" className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream-dim">
                Name
              </label>
              <input
                id="rsv-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                className="mt-1.5 w-full rounded-sq border border-hairline bg-wine px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="rsv-phone" className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream-dim">
                Phone
              </label>
              <input
                id="rsv-phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                className="mt-1.5 w-full rounded-sq border border-hairline bg-wine px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="rsv-guests" className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream-dim">
                  Guests
                </label>
                <select
                  id="rsv-guests"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-sq border border-hairline bg-wine px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
                >
                  {GUEST_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="rsv-date" className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream-dim">
                  Date
                </label>
                <input
                  id="rsv-date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  className="mt-1.5 w-full rounded-sq border border-hairline bg-wine px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="rsv-time" className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream-dim">
                Time
              </label>
              <input
                id="rsv-time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                type="time"
                className="mt-1.5 w-full rounded-sq border border-hairline bg-wine px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="rsv-notes" className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream-dim">
                Notes
              </label>
              <textarea
                id="rsv-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Occasion, seating preference, anything else"
                className="mt-1.5 w-full resize-none rounded-sq border border-hairline bg-wine px-3 py-2.5 text-sm text-cream placeholder:text-cream-faint focus:border-gold focus:outline-none"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Confirm Reservation
            </button>
            <p className="text-center text-xs text-cream-faint">
              Belle Food is open 24 hours — any time works.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
