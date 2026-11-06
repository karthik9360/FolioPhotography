import { useId } from 'react'

/** An on/off switch for a setting. A real button with role="switch", so it works with a keyboard and screen readers. */
export default function Switch({ checked, onChange, label, description, dirty = false }) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4 py-5" data-dirty={dirty}>
      <div>
        <p id={`${id}-label`} className="font-medium">
          {label}
        </p>
        {description && (
          <p id={`${id}-desc`} className="caption mt-1 max-w-[26rem] text-ink-soft">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        className="switch"
        data-dirty={dirty}
        onClick={() => onChange(!checked)}
      >
        <span className="switch-thumb" />
      </button>
    </div>
  )
}
