import { useId } from 'react'

// Descriptive options only. No prices or deliverables are promised here.
export const tiers = [
  { id: 'portrait', name: 'Portrait session', note: 'Individuals or small groups, in studio or on location.' },
  { id: 'editorial', name: 'Editorial shoot', note: 'Concept-led work for a publication, brand, or lookbook.' },
  { id: 'event', name: 'Event coverage', note: 'Documentary coverage of a day or an evening.' },
]

export default function TierSelect({ value, onChange, error }) {
  const id = useId()
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="caption">Type of shoot</legend>
      <div className="mt-2 border-t border-hairline">
        {tiers.map((tier) => (
          <label
            key={tier.id}
            className="flex cursor-pointer items-start gap-4 border-b border-hairline py-4"
          >
            <input
              type="radio"
              name="tier"
              className="radio mt-1"
              value={tier.id}
              checked={value === tier.id}
              onChange={() => onChange(tier.id)}
            />
            <span>
              <span className="block font-medium">{tier.name}</span>
              <span className="caption text-ink-soft">{tier.note}</span>
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${id}-error`} className="caption mt-2 font-medium">
          {error}
        </p>
      )}
    </fieldset>
  )
}
