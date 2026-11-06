import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'

/**
 * Cross-fades between the child routes of a layout. The outgoing view stays mounted for a moment
 * (inert) while the incoming one enters, so a swap never flashes. `order` is the left-to-right
 * order of the routes; it sets `--dir` so views slide the way you would expect.
 * Layers use `${layerClass}`, `${layerClass}--in` and `${layerClass}--out`.
 */
export default function CrossfadeOutlet({ as: Tag = 'div', id, className, layerClass, order = [], outMs = 200 }) {
  const { pathname } = useLocation()
  const outlet = useOutlet()
  const shown = useRef({ pathname, outlet })
  const [leaving, setLeaving] = useState(null)
  const [dir, setDir] = useState(1)

  // Runs first in a commit, so `shown.current` still holds the view we are leaving.
  useLayoutEffect(() => {
    if (shown.current.pathname === pathname) return undefined
    const from = order.indexOf(shown.current.pathname)
    const to = order.indexOf(pathname)
    setDir(from >= 0 && to >= 0 && to < from ? -1 : 1)
    setLeaving(shown.current)
    const timer = setTimeout(() => setLeaving(null), outMs)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useLayoutEffect(() => {
    shown.current = { pathname, outlet }
  })

  const layers = leaving
    ? [{ ...leaving, out: true }, { pathname, outlet, out: false }]
    : [{ pathname, outlet, out: false }]

  return (
    <Tag id={id} className={className} style={{ '--dir': dir }}>
      {layers.map((layer) => (
        <div
          key={layer.pathname}
          className={`${layerClass} ${layerClass}--${layer.out ? 'out' : 'in'}`}
          aria-hidden={layer.out || undefined}
          inert={layer.out || undefined}
        >
          {layer.outlet}
        </div>
      ))}
    </Tag>
  )
}
