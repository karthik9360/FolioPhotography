import { createContext, useContext, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'

const byPath = (pathname) => pathname

/**
 * True inside a layer that is fading out. That view is only a picture of the past: it must not
 * navigate, so route guards check this and stand down (see routes/guards.jsx).
 */
export const LeavingContext = createContext(false)
export const useLeaving = () => useContext(LeavingContext)

/**
 * Cross-fades between the child routes of a layout. The outgoing view stays mounted for a moment
 * (inert) while the incoming one enters, so a swap never flashes.
 *  - `layerKey(pathname)`: what counts as "a different view". It defaults to the path; a root frame
 *    uses it to animate only when the shell or the role changes, not on every navigation.
 *  - `order`: left-to-right order of the keys; it sets `--dir` so views slide the way you expect.
 *  - `freeze`: `[[Context, value], ...]`. A view that is fading out keeps seeing the values it had
 *    while it was current. Without this, signing out would hand the old page a null user for the
 *    moment it takes to fade, and it would crash.
 * Layers use `${layerClass}`, `${layerClass}--in` and `${layerClass}--out`.
 */
export default function CrossfadeOutlet({
  as: Tag = 'div',
  id,
  className,
  layerClass,
  order = [],
  outMs = 200,
  layerKey = byPath,
  freeze = [],
}) {
  const { pathname } = useLocation()
  const outerLeaving = useLeaving()
  const outlet = useOutlet()
  const key = layerKey(pathname)
  const shown = useRef({ key, outlet, freeze })
  const [leaving, setLeaving] = useState(null)
  const [dir, setDir] = useState(1)

  // Runs first in a commit, so `shown.current` still holds the view we are leaving.
  useLayoutEffect(() => {
    if (shown.current.key === key) return undefined
    const from = order.indexOf(shown.current.key)
    const to = order.indexOf(key)
    setDir(from >= 0 && to >= 0 && to < from ? -1 : 1)
    setLeaving(shown.current)
    const timer = setTimeout(() => setLeaving(null), outMs)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useLayoutEffect(() => {
    shown.current = { key, outlet, freeze }
  })

  const layers = leaving ? [{ ...leaving, out: true }, { key, outlet, out: false }] : [{ key, outlet, out: false }]

  return (
    <Tag id={id} className={className} style={{ '--dir': dir }}>
      {layers.map((layer) => (
        <div
          key={layer.key}
          className={`${layerClass} ${layerClass}--${layer.out ? 'out' : 'in'}`}
          aria-hidden={layer.out || undefined}
          inert={layer.out || undefined}
        >
          <LeavingContext.Provider value={outerLeaving || layer.out}>
            {layer.out
              ? (layer.freeze ?? []).reduceRight((tree, [Context, value]) => <Context.Provider value={value}>{tree}</Context.Provider>, layer.outlet)
              : layer.outlet}
          </LeavingContext.Provider>
        </div>
      ))}
    </Tag>
  )
}
