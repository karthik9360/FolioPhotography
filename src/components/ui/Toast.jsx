import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)
const HOLD_MS = 3200
const EXIT_MS = 200

/**
 * A low-profile notice that slides down from the top edge, then away. Not a modal: it never takes
 * focus and never blocks anything. The region is always mounted so screen readers announce it.
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timers = useRef([])

  const show = useCallback((message, tone = 'success') => {
    timers.current.forEach(clearTimeout)
    const id = Date.now() + Math.random()
    setToast({ id, message, tone, leaving: false })
    timers.current = [
      setTimeout(() => setToast((t) => (t && t.id === id ? { ...t, leaving: true } : t)), HOLD_MS),
      setTimeout(() => setToast((t) => (t && t.id === id ? null : t)), HOLD_MS + EXIT_MS),
    ]
  }, [])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <p key={toast.id} className="toast" data-tone={toast.tone} data-leaving={toast.leaving}>
            {toast.message}
          </p>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
