import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const TopProgressContext = createContext(null)

/**
 * A one-pixel progress strip on the very top edge of the viewport, for batch work (delivery,
 * syndication). It grows in width and gains opacity as it fills, and fades away when done. It is
 * never a modal and never blocks the page.
 */
export function TopProgressProvider({ children }) {
  const [state, setState] = useState({ active: false, value: 0 })
  const hide = useRef(0)

  const start = useCallback(() => {
    clearTimeout(hide.current)
    setState({ active: true, value: 0.04 })
  }, [])
  const set = useCallback((value) => {
    setState((s) => ({ active: true, value: Math.max(s.value, Math.min(1, value)) }))
  }, [])
  const finish = useCallback(() => {
    setState({ active: true, value: 1 })
    hide.current = setTimeout(() => setState({ active: false, value: 0 }), 450)
  }, [])

  useEffect(() => () => clearTimeout(hide.current), [])

  const api = useMemo(() => ({ start, set, finish }), [start, set, finish])

  return (
    <TopProgressContext.Provider value={api}>
      {children}
      <div
        className="top-progress"
        role="progressbar"
        aria-label="Progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(state.value * 100)}
        aria-hidden={!state.active}
        data-active={state.active}
        style={{ '--p': state.value }}
      />
    </TopProgressContext.Provider>
  )
}

export function useTopProgress() {
  const ctx = useContext(TopProgressContext)
  if (!ctx) throw new Error('useTopProgress must be used inside TopProgressProvider')
  return ctx
}
