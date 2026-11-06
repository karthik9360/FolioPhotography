import { useStudioTheme } from '../../context/StudioThemeContext'

const LABELS = { light: 'Light', dark: 'Dark' }

/**
 * Switches between the light and dark looks. `variant="inline"` is a single text button for the
 * header; `variant="pair"` lists both options for the footer (the current one is marked pressed).
 */
export default function ThemeToggle({ variant = 'inline', className = '' }) {
  const { theme, setTheme, toggleTheme } = useStudioTheme()

  if (variant === 'pair') {
    return (
      <p className={`caption text-ink-soft ${className}`}>
        Theme:{' '}
        {Object.entries(LABELS).map(([id, label], i) => (
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

  const next = theme === 'light' ? 'dark' : 'light'
  return (
    <button
      type="button"
      className={`nav-link ${className}`}
      aria-label={`Switch to the ${LABELS[next].toLowerCase()} look`}
      onClick={toggleTheme}
    >
      {LABELS[next]}
    </button>
  )
}
