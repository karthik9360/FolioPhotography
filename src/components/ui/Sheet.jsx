import { useEffect, useRef, useState } from 'react'

const EXIT_MS = 280

/**
 * Modal dialog with enter/exit motion. Built on <dialog> so focus trapping,
 * Escape, and focus return come from the platform.
 * `open` is controlled; the dialog stays mounted during the exit transition.
 */
export default function Sheet({ open, onClose, label, className = '', scrimClassName = '', children }) {
  const ref = useRef(null)
  const [state, setState] = useState('closed')

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return undefined

    if (open) {
      if (!dialog.open) dialog.showModal()
      let raf2 = 0
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setState('open'))
      })
      return () => {
        cancelAnimationFrame(raf1)
        cancelAnimationFrame(raf2)
      }
    }

    setState('closed')
    const timer = setTimeout(() => {
      if (dialog.open) dialog.close()
    }, EXIT_MS)
    return () => clearTimeout(timer)
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`sheet ${className}`}
      data-state={state}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className={`sheet-scrim ${scrimClassName}`} onClick={onClose} aria-hidden="true" />
      {children}
    </dialog>
  )
}
