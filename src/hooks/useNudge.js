import { useEffect } from 'react'

/**
 * A restrained "that didn't work" cue: a 4px sideways nudge over 220ms.
 * Runs when `signal` changes (increment it on each failed attempt). It moves the element with a
 * transform only, so nothing around it shifts, and it is skipped for reduced-motion users.
 */
export function useNudge(ref, signal) {
  useEffect(() => {
    if (!signal || !ref.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    ref.current.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(-3px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    )
  }, [ref, signal])
}
