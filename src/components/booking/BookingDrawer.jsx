import { useId, useState } from 'react'
import { X } from 'lucide-react'
import Sheet from '../ui/Sheet'
import TierSelect, { tiers } from './TierSelect'
import BudgetRange, { formatMoney } from './BudgetRange'
import { useBooking } from '../../context/BookingContext'

const BUDGET = { min: 500, max: 20000, step: 250 }
const EMPTY = { name: '', email: '', tier: '', date: '', budget: [2000, 6000], details: '' }

function todayLocal() {
  return new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in the local zone
}

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Tell us your name.'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter an email address we can reply to, like name@example.com.'
  if (!form.tier) errors.tier = 'Choose the type of shoot.'
  if (!form.date) errors.date = 'Pick the date you have in mind.'
  else if (form.date < todayLocal()) errors.date = 'Pick a date that has not passed.'
  return errors
}

/** Right-hand sliding drawer. Nothing is sent anywhere yet: there is no backend. */
export default function BookingDrawer() {
  const { open, closeBooking } = useBooking()
  const id = useId()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }))
    // Editing a field clears its stale error straight away.
    setErrors((e) => {
      if (!e[key]) return e
      const { [key]: _cleared, ...rest } = e
      return rest
    })
  }
  const onText = (key) => (e) => set(key)(e.target.value)

  function close() {
    closeBooking()
    if (sent) {
      setTimeout(() => {
        setForm(EMPTY)
        setErrors({})
        setSent(false)
      }, 320)
    }
  }

  function submit(event) {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length === 0) setSent(true)
  }

  const tierName = tiers.find((t) => t.id === form.tier)?.name
  const dateLabel = form.date
    ? new Date(`${form.date}T00:00:00`).toLocaleDateString('en-GB', { dateStyle: 'long' })
    : ''

  return (
    <Sheet open={open} onClose={close} label="Book a shoot">
      <div className="drawer-panel">
        <div className="px-6 py-4 md:px-10 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <h2 className="headline">{sent ? 'Enquiry noted' : 'Book a shoot'}</h2>
            <button
              type="button"
              className="icon-btn -mr-3 -mt-2"
              aria-label="Close booking form"
              onClick={close}
            >
              <X size={22} strokeWidth={1.25} aria-hidden="true" />
            </button>
          </div>

          {sent ? (
            <div className="mt-4">
              <p className="measure">
                Thanks, {form.name.trim()}. This is a demonstration: nothing was sent, because no
                backend is connected yet.
              </p>
              <dl className="mt-4 border-t border-hairline">
                {[
                  ['Shoot', tierName],
                  ['Date', dateLabel],
                  ['Budget', `${formatMoney(form.budget[0])} to ${formatMoney(form.budget[1])}`],
                  ['Reply to', form.email],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-hairline py-4">
                    <dt className="caption text-ink-soft">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" className="btn btn-primary mt-4" onClick={close}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-4 space-y-4">
              <p className="caption measure text-ink-soft">
                Tell us what you have in mind. This demo form does not send anything yet.
              </p>

              <div>
                <label htmlFor={`${id}-name`} className="caption">
                  Your name
                </label>
                <input
                  id={`${id}-name`}
                  className="field-input"
                  value={form.name}
                  onChange={onText('name')}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? `${id}-name-err` : undefined}
                />
                {errors.name && (
                  <p id={`${id}-name-err`} className="caption mt-2 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={`${id}-email`} className="caption">
                  Email
                </label>
                <input
                  id={`${id}-email`}
                  type="email"
                  className="field-input"
                  value={form.email}
                  onChange={onText('email')}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? `${id}-email-err` : undefined}
                />
                {errors.email && (
                  <p id={`${id}-email-err`} className="caption mt-2 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              <TierSelect value={form.tier} onChange={set('tier')} error={errors.tier} />

              <div>
                <label htmlFor={`${id}-date`} className="caption">
                  Preferred date
                </label>
                <input
                  id={`${id}-date`}
                  type="date"
                  className="field-input"
                  min={todayLocal()}
                  value={form.date}
                  onChange={onText('date')}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={errors.date ? `${id}-date-err` : undefined}
                />
                {errors.date && (
                  <p id={`${id}-date-err`} className="caption mt-2 font-medium">
                    {errors.date}
                  </p>
                )}
              </div>

              <BudgetRange {...BUDGET} value={form.budget} onChange={set('budget')} />

              <div>
                <label htmlFor={`${id}-details`} className="caption">
                  Anything else we should know
                </label>
                <textarea
                  id={`${id}-details`}
                  className="field-input"
                  rows={3}
                  value={form.details}
                  onChange={onText('details')}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Send enquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </Sheet>
  )
}
