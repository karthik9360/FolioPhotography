import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Translucent bubbles that rise behind the page, drawn in CSS (no image files). One spawns every 400ms
 * on the home hero and every second elsewhere, 10-30px wide, taking 4-10 seconds to cross the screen.
 * Nothing spawns under prefers-reduced-motion or while the tab is hidden.
 */
export default function Bubbles() {
  const host = useRef(null)
  const { pathname } = useLocation()
  const hero = pathname === '/'

  useEffect(() => {
    const el = host.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    function spawn() {
      if (document.hidden || el.childElementCount > 40) return
      const bubble = document.createElement('span')
      const size = Math.random() * 20 + 10
      const duration = Math.random() * 6 + 4
      bubble.className = 'bubble'
      bubble.style.width = `${size}px`
      bubble.style.height = `${size}px`
      bubble.style.left = `${Math.random() * 100}%`
      bubble.style.setProperty('--peak', String(Math.random() * 0.4 + 0.2))
      bubble.style.animationDuration = `${duration}s`
      el.appendChild(bubble)
      window.setTimeout(() => bubble.remove(), duration * 1000)
    }

    const timer = window.setInterval(spawn, hero ? 400 : 1000)
    return () => {
      window.clearInterval(timer)
      el.replaceChildren()
    }
  }, [hero])

  return <div ref={host} className="bubbles" aria-hidden="true" />
}
