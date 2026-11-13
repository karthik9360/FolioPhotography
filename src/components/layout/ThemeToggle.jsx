import { THEME_LABELS, useStudioTheme } from '../../context/StudioThemeContext'

const SWATCH = { teal: '#0b8a78', blue: '#0b4f8a' }

/**
 * Switches between the Teal and Blue looks. `variant="inline"` is a small round swatch for the header
 * that shows the look you would switch to; `variant="pair"` lists both options for the footer (the
 * current one is marked pressed).
 */
export default function ThemeToggle({ variant = 'inline', className = '' }) {
  const { theme, setTheme, toggleTheme } = useStudioTheme()

  if (variant === 'pair') {
    return (
      <p className={`caption text-ink-soft ${className}`}>
        Look:{' '}
        {Object.entries(THEME_LABELS).map(([id, label], i) => (
          <span key={id}>
            {i > 0 && ' · '}
            <button
              type="button"
              className={theme === id ? 'font-medium text-ink' : 'link'}
              aria-pressed={theme === id}
              onClick={() => setTheme(id)}
            >
              {label}
            </button>
          </span>
        ))}
      </p>
    )
  }

  const next = theme === 'teal' ? 'blue' : 'teal'
  const label = `Switch to the ${THEME_LABELS[next].toLowerCase()} look`
  return (
    <button
      type="button"
      className={`look-dot ${className}`}
      style={{ '--look-next': SWATCH[next] }}
      aria-label={label}
      title={label}
      onClick={toggleTheme}
    />
  )
}
