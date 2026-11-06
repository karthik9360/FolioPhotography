import { useId } from 'react'
import { site } from '../../config/site'

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: site.currency,
  maximumFractionDigits: 0,
})
export const formatMoney = (n) => formatter.format(n)

/** Dual-thumb budget slider built from two native range inputs. */
export default function BudgetRange({ min, max, step, value, onChange }) {
  const id = useId()
  const [lo, hi] = value
  const pct = (v) => ((v - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span id={`${id}-label`} className="caption">
          Budget range
        </span>
        <output className="data" aria-live="polite">
          {formatMoney(lo)} to {formatMoney(hi)}
        </output>
      </div>

      <div className="range mt-3" role="group" aria-labelledby={`${id}-label`}>
        <div className="absolute inset-y-0 left-2 right-2">
          <div className="range-track" />
          <div
            className="range-fill"
            style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label="Minimum budget"
          aria-valuetext={formatMoney(lo)}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label="Maximum budget"
          aria-valuetext={formatMoney(hi)}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
        />
      </div>
      <p className="caption mt-2 text-ink-soft">Placeholder scale. Currency and limits are not final.</p>
    </div>
  )
}
