import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/*
 * useStudioTheme: the mood of the whole site. There are two, "teal" (the default) and "blue". The mood
 * is one attribute on <html> (data-theme); the page's gradient, its panels and its depth are CSS
 * variables that the attribute swaps, and the browser animates the change over 1.5s (see the
 * @property rules in index.css). index.html sets the attribute before first paint, so the page never
 * opens in the wrong mood. The home hero listens to the same value and plays its own transition.
 */

export const THEMES = ['teal', 'blue']
export const THEME_LABELS = { teal: 'Teal', blue: 'Blue' }
const STORAGE_KEY = 'folio.theme'
const CHROME = { teal: '#011411', blue: '#010c14' } // browser UI colour on phones

const StudioThemeContext = createContext(null)

function readTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'blue' ? 'blue' : 'teal'
  } catch {
    return 'teal'
  }
}

export function StudioThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', CHROME[theme])
  }, [theme])

  const setTheme = useCallback((next) => {
    const value = next === 'blue' ? 'blue' : 'teal'
    setThemeState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* private mode: the choice lasts for this visit only */
    }
  }, [])

  const toggleTheme = useCallback(() => setTheme(theme === 'teal' ? 'blue' : 'teal'), [theme, setTheme])

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])
  return <StudioThemeContext.Provider value={value}>{children}</StudioThemeContext.Provider>
}

export function useStudioTheme() {
  const ctx = useContext(StudioThemeContext)
  if (!ctx) throw new Error('useStudioTheme must be used inside StudioThemeProvider')
  return ctx
}
