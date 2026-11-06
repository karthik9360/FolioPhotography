import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ViewerContext = createContext(null)

// Tracks which photograph the lightbox shows and the ordered list it steps through.
export function ViewerProvider({ children }) {
  const [state, setState] = useState({ id: null, list: [] })

  const openPhoto = useCallback((id, list) => setState({ id, list }), [])
  const close = useCallback(() => setState((s) => ({ ...s, id: null })), [])
  const step = useCallback(
    (dir) =>
      setState((s) => {
        if (s.id == null || s.list.length < 2) return s
        const i = s.list.indexOf(s.id)
        const next = s.list[(i + dir + s.list.length) % s.list.length]
        return { ...s, id: next }
      }),
    [],
  )

  const value = useMemo(
    () => ({ openId: state.id, list: state.list, openPhoto, close, step }),
    [state, openPhoto, close, step],
  )

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
}

export function useViewer() {
  const ctx = useContext(ViewerContext)
  if (!ctx) throw new Error('useViewer must be used inside ViewerProvider')
  return ctx
}
