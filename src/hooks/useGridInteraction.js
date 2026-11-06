import { useCallback, useEffect, useRef } from 'react'

const clamp = (n) => Math.max(-1, Math.min(1, n))
const EASE = 0.14 // fraction of the remaining distance covered each frame

/**
 * Cursor tracking for a lookbook cell. Attach `ref` to the cell's frame. While the pointer is over it,
 * the cursor position relative to the frame's bounds becomes a vector (x, y), each axis from -1 to 1
 * (0, 0 is the centre), eased frame by frame so it never jumps. The vector is
 *  - written to the element as CSS variables `--px` and `--py` (photographs use them for a sub-1%
 *    parallax shift under their 1.025 scale), and
 *  - sent to anything registered with `subscribe(fn)` (3D cells pivot their mesh with it).
 * When the pointer leaves, the vector eases back to the centre, so the response reverses smoothly.
 * Nothing runs on touch screens or under prefers-reduced-motion.
 * The vector lives in refs, not state: tracking never re-renders React.
 */
export function useGridInteraction() {
  const ref = useRef(null)
  const listeners = useRef(new Set())

  const subscribe = useCallback((fn) => {
    listeners.current.add(fn)
    return () => listeners.current.delete(fn)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (reduce || !fine) return undefined

    const p = { x: 0, y: 0, tx: 0, ty: 0 }
    let raf = 0

    const tick = () => {
      p.x += (p.tx - p.x) * EASE
      p.y += (p.ty - p.y) * EASE
      const settled = Math.abs(p.tx - p.x) < 0.001 && Math.abs(p.ty - p.y) < 0.001
      if (settled) {
        p.x = p.tx
        p.y = p.ty
      }
      el.style.setProperty('--px', p.x.toFixed(4))
      el.style.setProperty('--py', p.y.toFixed(4))
      listeners.current.forEach((fn) => fn(p.x, p.y))
      raf = settled ? 0 : requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const move = (event) => {
      const r = el.getBoundingClientRect()
      p.tx = clamp(((event.clientX - r.left) / r.width) * 2 - 1)
      p.ty = clamp(((event.clientY - r.top) / r.height) * 2 - 1)
      kick()
    }
    const leave = () => {
      p.tx = 0
      p.ty = 0
      kick()
    }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return { ref, subscribe }
}
