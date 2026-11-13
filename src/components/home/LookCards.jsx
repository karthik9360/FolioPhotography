import { THEMES, THEME_LABELS } from '../../context/StudioThemeContext'

const NOTES = { teal: 'Calm and cool', blue: 'Deep and quiet' }
const TONES = { teal: ['#12a58f', '#0b6f61'], blue: ['#2a7fd6', '#1b4f8e'] }

/** A lens seen from the front, drawn in a look's colours. It rises out of the top of its card. */
function LensArt({ look }) {
  const [light, dark] = TONES[look]
  return (
    <svg className="look-art" viewBox="0 0 140 140" aria-hidden="true">
      <circle cx="70" cy="70" r="66" fill={dark} />
      <circle cx="70" cy="70" r="60" fill={light} />
      <circle cx="70" cy="70" r="52" fill="#0c0f0f" />
      <circle cx="70" cy="70" r="46" fill="none" stroke="#fbcfe8" strokeWidth="3" />
      <circle cx="70" cy="70" r="36" fill="#03151c" />
      <circle cx="70" cy="70" r="22" fill="none" stroke="#8fb8ff" strokeOpacity="0.5" strokeWidth="1.5" />
      <ellipse cx="56" cy="54" rx="10" ry="6" fill="#fff" fillOpacity="0.5" transform="rotate(-30 56 54)" />
      <circle cx="70" cy="9" r="3.5" fill="#fbcfe8" />
    </svg>
  )
}

/**
 * Two cards, one for each look, and two arrows. Choosing one changes the whole site's look. The
 * active card is outlined in pink. `onPick` ignores a request while a change is still playing.
 */
export default function LookCards({ theme, onPick }) {
  const other = THEMES.find((id) => id !== theme)

  return (
    <div className="product-carousel">
      <div className="carousel-cards" role="group" aria-label="Choose a look">
        {THEMES.map((id) => (
          <button
            key={id}
            type="button"
            className={`look-card${theme === id ? ' active' : ''}`}
            aria-pressed={theme === id}
            onClick={() => onPick(id)}
          >
            <LensArt look={id} />
            <span className="card-info">
              <span>{THEME_LABELS[id]} look</span>
              <span>{NOTES[id]}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="carousel-nav">
        <button type="button" className="nav-arrow" aria-label="Previous look" onClick={() => onPick(other)}>
          ←
        </button>
        <button type="button" className="nav-arrow" aria-label="Next look" onClick={() => onPick(other)}>
          →
        </button>
      </div>
    </div>
  )
}
