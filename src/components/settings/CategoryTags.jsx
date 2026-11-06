export const CATEGORY_OPTIONS = ['Editorial', 'Cinematic', 'Runway', 'Portrait', 'Event', 'Documentary']
const MAX = 3

/** Pick up to three portfolio categories. Text toggles with an underline: no chips, no boxes. */
export default function CategoryTags({ value, onChange, onBlur, error = '', dirty = false }) {
  const toggle = (category) => {
    const on = value.includes(category)
    if (!on && value.length >= MAX) return
    onChange(on ? value.filter((c) => c !== category) : [...value, category])
  }

  return (
    <fieldset>
      <legend className="caption">Portfolio categories</legend>
      <div className="tag-row mt-2 flex flex-wrap gap-x-6 gap-y-1" data-dirty={dirty}>
        {CATEGORY_OPTIONS.map((category) => (
          <button
            key={category}
            type="button"
            className="tag"
            aria-pressed={value.includes(category)}
            onClick={() => toggle(category)}
            onBlur={onBlur}
          >
            {category}
          </button>
        ))}
      </div>
      <p className="float-msg" data-tone={error ? 'error' : 'hint'} aria-live="polite">
        {error || `Choose up to ${MAX}. ${value.length} selected.`}
      </p>
    </fieldset>
  )
}
