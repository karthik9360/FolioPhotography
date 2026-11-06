import { useRef, useState } from 'react'
import { PILES } from '../../context/CreativeHubContext'
import { colourName } from '../../lib/imageAnalysis'

const GLIDE_MS = 220
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const pileAt = (x, y) => document.elementsFromPoint(x, y).find((el) => el.dataset?.pileTarget)

/**
 * One staged photograph. Mouse and pen users can drag it onto a pile: it scales to 0.96 while held,
 * then glides into the pile over 220ms. Everyone (keyboard, touch, screen readers) can use the pile
 * buttons instead.
 */
export default function AssetTile({ asset, duplicateName, onMove, onRemove }) {
  const drag = useRef(null)
  const [dragging, setDragging] = useState(false)

  function onDown(event) {
    if (event.pointerType === 'touch' || event.button !== 0) return // touch scrolls; it uses the buttons
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX, y: event.clientY, dx: 0, dy: 0, moved: false, over: null }
  }

  function onMovePointer(event) {
    const d = drag.current
    if (!d) return
    const dx = event.clientX - d.x
    const dy = event.clientY - d.y
    if (!d.moved && Math.hypot(dx, dy) < 6) return
    if (!d.moved) {
      d.moved = true
      setDragging(true)
    }
    d.dx = dx
    d.dy = dy
    event.currentTarget.style.transform = `translate(${dx}px, ${dy}px) scale(0.96)`
    const target = pileAt(event.clientX, event.clientY) ?? null
    if (d.over !== target) {
      d.over?.removeAttribute('data-over')
      target?.setAttribute('data-over', 'true')
      d.over = target
    }
  }

  async function onUp(event) {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    const el = event.currentTarget
    d.over?.removeAttribute('data-over')
    const target = pileAt(event.clientX, event.clientY)

    if (reducedMotion()) {
      el.style.transform = ''
      setDragging(false)
      if (target) onMove(target.dataset.pileTarget)
      return
    }

    const from = `translate(${d.dx}px, ${d.dy}px) scale(0.96)`
    let to = 'translate(0px, 0px) scale(1)'
    if (target) {
      const t = target.getBoundingClientRect()
      const m = el.getBoundingClientRect()
      const tx = d.dx + (t.left + t.width / 2) - (m.left + m.width / 2)
      const ty = d.dy + (t.top + t.height / 2) - (m.top + m.height / 2)
      to = `translate(${tx}px, ${ty}px) scale(0.96)`
    }
    const glide = el.animate(
      [
        { transform: from, opacity: 1 },
        { transform: to, opacity: target ? 0 : 1 },
      ],
      { duration: GLIDE_MS, easing: EASE, fill: 'forwards' },
    )
    await glide.finished.catch(() => {})
    if (target) onMove(target.dataset.pileTarget)
    glide.cancel()
    el.style.transform = ''
    setDragging(false)
  }

  function onCancel(event) {
    drag.current?.over?.removeAttribute('data-over')
    drag.current = null
    event.currentTarget.style.transform = ''
    setDragging(false)
  }

  return (
    <li>
      <div
        className="asset-frame"
        data-dragging={dragging}
        data-pile={asset.pile ?? ''}
        onPointerDown={onDown}
        onPointerMove={onMovePointer}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
      >
        <img src={asset.url} alt={`Staged photograph ${asset.name}`} width={asset.w} height={asset.h} draggable={false} />
      </div>

      <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
        {asset.analysis.palette.map((hex) => (
          <span key={hex} className="swatch" style={{ background: hex }} title={`${colourName(hex)} ${hex}`} />
        ))}
      </div>
      <p className="caption mt-2 truncate text-ink-soft">{asset.name}</p>
      {duplicateName && (
        <p className="caption font-medium" role="note">
          Possible duplicate of {duplicateName}
        </p>
      )}

      {asset.tonal && (
        <div className="mt-3">
          <p className="text-xs leading-snug">{asset.tonal.description}</p>
          <ul className="mt-2 space-y-0.5">
            {asset.tonal.tags.map((tag) => (
              <li key={tag.name} className="caption">
                <span className="font-medium">{tag.name}</span>
                <span className="text-ink-soft"> · {tag.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div role="group" aria-label={`Move ${asset.name} to a pile`} className="mt-3 flex flex-wrap gap-x-4">
        {PILES.map((pile) => (
          <button key={pile.id} type="button" className="tag caption" aria-pressed={asset.pile === pile.id} onClick={() => onMove(pile.id)}>
            {pile.label}
          </button>
        ))}
      </div>
      <button type="button" className="link caption mt-1 text-ink-soft" onClick={onRemove}>
        Remove
      </button>
    </li>
  )
}
