import { useEffect, useRef, useState } from 'react'

// Placeholder stills standing in for a cinematic editorial loop. Replace with real footage or imagery.
const SLIDES = [1, 2, 3].map((n) => `https://picsum.photos/seed/folio-auth-${n}/1400/1600`)
const HOLD_MS = 7000

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The 60% image side. Slow cross-fade between stills, each revealing with a gentle drift,
 * plus a few pixels of pointer parallax on devices with a mouse. All of it stops for
 * reduced-motion users.
 */
export default function AuthMedia() {
  const [active, setActive] = useState(0)
  const rootRef = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return undefined
    const id = setInterval(() => {
      if (!document.hidden) setActive((a) => (a + 1) % SLIDES.length)
    }, HOLD_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el || prefersReducedMotion()) return undefined
    let raf = 0
    const onMove = (event) => {
      if (event.pointerType !== 'mouse') return
      const rect = el.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', `${(-x * 14).toFixed(1)}px`)
        el.style.setProperty('--py', `${(-y * 14).toFixed(1)}px`)
      })
    }
    const onLeave = () => {
      el.style.setProperty('--px', '0px')
      el.style.setProperty('--py', '0px')
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div className="auth-media" ref={rootRef}>
      {SLIDES.map((src, i) => (
        <div key={src} className="auth-slide" data-active={i === active}>
          <img src={src} alt="" width={1400} height={1600} decoding="async" />
        </div>
      ))}
      <p className="auth-caption caption">Placeholder imagery</p>
    </div>
  )
}
