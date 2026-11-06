import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/*
 * useStudioTheme: the twin-token theme. "light" is the warm linen look (bone-white base, charcoal text,
 * gold and olive accents) and is the default; "dark" is Studio Dark (onyx, bone, taupe). The theme is one attribute on <html>
 * (data-theme); every colour in the interface is a CSS variable that the attribute swaps, so a switch
 * repaints in place with no layout change. index.html sets the attribute before first paint, so the
 * page never opens in the wrong theme.
 */

export const THEMES = ['dark', 'light']
const STORAGE_KEY = 'folio.theme'
const CHROME = { dark: '#0A0A0A', light: '#F5F5F0' } // browser UI colour on phones

const StudioThemeContext = createContext(null)

function readTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function StudioThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', CHROME[theme])
  }, [theme])

  const setTheme = useCallback((next) => {
    const value = next === 'dark' ? 'dark' : 'light'
    setThemeState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* private mode: the choice lasts for this visit only */
    }
  }, [])

  const toggleTheme = useCallback(() => setTheme(theme === 'light' ? 'dark' : 'light'), [theme, setTheme])

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])
  return <StudioThemeContext.Provider value={value}>{children}</StudioThemeContext.Provider>
}

export function useStudioTheme() {
  const ctx = useContext(StudioThemeContext)
  if (!ctx) throw new Error('useStudioTheme must be used inside StudioThemeProvider')
  return ctx
}
