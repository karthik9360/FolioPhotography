import { useEffect, useRef, useState } from 'react'

// Photographs that drift behind the lens ("leaves"): size px, position %, opacity.
const PRINTS = [
  { top: 10, left: 15, size: 60, opacity: 1 },
  { top: 40, left: 80, size: 140, opacity: 0.4 },
  { top: 70, left: 75, size: 80, opacity: 1 },
  { top: 85, left: 20, size: 120, opacity: 0.3 },
]

/**
 * The hero's moving layer: four floating photo prints (plain images), and two WebGL canvases (see
 * lib/heroScene.js), one behind the page's text and one above it. This component owns the pointer and
 * the one animation loop. `look` is "teal" or "blue" and a change of it plays the look transition.
 * `switchingRef.current` is set to a function that says whether that transition is still playing.
 * Without WebGL the prints and the page still work, and the canvases stay empty.
 */
export default function HeroStage({ photos, look, switchingRef }) {
  const backRef = useRef(null)
  const frontRef = useRef(null)
  const printsRef = useRef(null)
  const sceneRef = useRef(null)
  const lookRef = useRef(look)
  const nudge = useRef(() => {})
  const [status, setStatus] = useState('loading') // loading | ready | unavailable

  useEffect(() => {
    lookRef.current = look
    sceneRef.current?.setLook(look)
    nudge.current()
  }, [look])

  useEffect(() => {
    if (!switchingRef) return undefined
    switchingRef.current = () => sceneRef.current?.isSwitching() ?? false
    return () => {
      switchingRef.current = null
    }
  }, [switchingRef])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, px: -9999, py: -9999, cx: -9999, cy: -9999 }
    const printEls = [...printsRef.current.querySelectorAll('.leaf')]
    let scene = null
    let raf = 0
    let last = performance.now()
    let still = 3 // under reduced motion, only a few frames are drawn
    let disposed = false
    // If frames come slowly (no real GPU), draw at a lower resolution rather than slow the whole page.
    let quality = 0
    let slowTime = 0
    let slowFrames = 0

    nudge.current = () => {
      still = 3
    }

    const onMove = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return
      mouse.tx = event.clientX / window.innerWidth - 0.5
      mouse.ty = event.clientY / window.innerHeight - 0.5
      mouse.px = event.clientX
      mouse.py = event.clientY
    }

    // The brief measures its percentages inside the hero box: 4% side margins, 5rem (80px) from the
    // top. The canvas is the whole window on a wide screen and a band at the top on a narrow one, so
    // its own size is the reference. Narrow windows scale the rings down so they never swamp the text.
    function measure() {
      if (!scene) return
      const w = backRef.current.clientWidth || window.innerWidth
      const h = backRef.current.clientHeight || window.innerHeight
      scene.setLayout({ x0: w * 0.04, y0: 80, w: w * 0.92, h: Math.max(1, h - 80), unit: Math.min(1, Math.max(0.4, w / 1200)) })
      scene.resize(w, h)
      nudge.current()
    }

    function tick(now) {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      if (reduced) {
        if (still <= 0) return
        still -= 1
        scene?.frame(0, 0.016, { x: 0, y: 0, cx: -9999, cy: -9999 })
        return
      }
      const k = 1 - (1 - 0.05) ** (dt * 60)
      mouse.x += (mouse.tx - mouse.x) * k
      mouse.y += (mouse.ty - mouse.y) * k
      const time = now / 1000
      // The scene works in canvas pixels; the canvas scrolls with the page on a narrow screen.
      const box = backRef.current.getBoundingClientRect()
      mouse.cx = mouse.px - box.left
      mouse.cy = mouse.py - box.top

      printsRef.current.style.transform = `translate(${mouse.x * -15}px, ${mouse.y * -15}px)`
      printEls.forEach((el, i) => {
        const phase = (time + i * 1.2) * ((Math.PI * 2) / (10 + i * 2))
        const x = Math.cos(phase * 0.5) * 15
        const y = Math.sin(phase) * 20
        const angle = Math.sin(phase * 0.3) * 15
        el.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`
      })
      scene?.frame(time, dt, mouse)

      if (scene && quality < 2 && !document.hidden) {
        slowTime += dt
        slowFrames += 1
        if (slowTime >= 2) {
          if (slowTime / slowFrames > 0.05) {
            quality += 1
            scene.setQuality(quality)
          }
          slowTime = 0
          slowFrames = 0
        }
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    const resizer = new ResizeObserver(measure)
    resizer.observe(document.documentElement)
    // Draw only while the tab is showing and the canvas is on screen (a narrow page scrolls it away).
    let onScreen = true
    const syncVisible = () => scene?.setVisible(onScreen && !document.hidden)
    const onVisibility = syncVisible
    document.addEventListener('visibilitychange', onVisibility)
    const watcher = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      syncVisible()
    })
    watcher.observe(backRef.current)
    raf = requestAnimationFrame(tick)

    import('../../lib/heroScene')
      .then(({ createHeroScene }) => {
        if (disposed) return
        try {
          const created = createHeroScene({ backCanvas: backRef.current, frontCanvas: frontRef.current, look: lookRef.current, reduced })
          // Wait for the shaders to compile before drawing; a page that was left in the meantime
          // just lets the scene go.
          created.ready.then(() => {
            if (disposed) {
              created.dispose()
              return
            }
            scene = created
            sceneRef.current = created
            measure()
            scene.setLook(lookRef.current) // in case the look changed while compiling
            setStatus('ready')
          })
        } catch {
          setStatus('unavailable')
        }
      })
      .catch(() => {
        if (!disposed) setStatus('unavailable')
      })

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVisibility)
      resizer.disconnect()
      watcher.disconnect()
      scene?.dispose()
      sceneRef.current = null
      nudge.current = () => {}
    }
  }, [])

  return (
    <>
      <div ref={printsRef} className="leaves-container" aria-hidden="true">
        {PRINTS.map((print, i) => (
          <img
            key={i}
            className="leaf"
            src={photos[i % photos.length]?.thumb}
            alt=""
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            width={print.size}
            height={Math.round(print.size * 1.25)}
            style={{ top: `${print.top}%`, left: `${print.left}%`, width: print.size, opacity: print.opacity }}
            draggable={false}
          />
        ))}
      </div>
      <canvas ref={backRef} className="hero-canvas hero-canvas--back" aria-hidden="true" data-status={status} />
      <canvas ref={frontRef} className="hero-canvas hero-canvas--front" aria-hidden="true" data-status={status} />
    </>
  )
}
