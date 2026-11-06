import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'

const DOUBLE_TAP_MS = 300

/**
 * The media stage: a swipeable carousel (scroll-snap) with minimal dot indicators, and
 * double-tap / double-click to like. Slides keep one aspect ratio so nothing shifts as images load.
 */
export default function PostMedia({ ratio, photos, label, onDoubleTap }) {
  const [index, setIndex] = useState(0)
  const [burst, setBurst] = useState(0)
  const scroller = useRef(null)
  const lastTap = useRef(0)
  const count = photos.length

  const onScroll = () => {
    const el = scroller.current
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  const go = (to) => {
    const el = scroller.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: to * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' })
  }

  const onTap = () => {
    const now = Date.now()
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0
      onDoubleTap()
      setBurst((b) => b + 1)
    } else {
      lastTap.current = now
    }
  }

  const onKeyDown = (event) => {
    if (count < 2) return
    if (event.key === 'ArrowRight' && index < count - 1) {
      event.preventDefault()
      go(index + 1)
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      go(index - 1)
    }
  }

  return (
    <div>
      <div className="post-media relative" style={{ aspectRatio: ratio }}>
        <div
          ref={scroller}
          className="carousel h-full"
          role="group"
          aria-roledescription="carousel"
          aria-label={label}
          tabIndex={0}
          onScroll={onScroll}
          onClick={onTap}
          onKeyDown={onKeyDown}
        >
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="photo-frame h-full"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
            >
              <img
                src={photo.thumb}
                alt={photo.alt}
                width={photo.w}
                height={photo.h}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {burst > 0 && (
          <span key={burst} className="heart-burst" aria-hidden="true" onAnimationEnd={() => setBurst(0)}>
            <Heart size={96} strokeWidth={1} fill="currentColor" />
          </span>
        )}

        {count > 1 && index > 0 && (
          <button type="button" className="carousel-btn left-3" aria-label="Previous photograph" onClick={() => go(index - 1)}>
            <ChevronLeft size={20} strokeWidth={1.25} aria-hidden="true" />
          </button>
        )}
        {count > 1 && index < count - 1 && (
          <button type="button" className="carousel-btn right-3" aria-label="Next photograph" onClick={() => go(index + 1)}>
            <ChevronRight size={20} strokeWidth={1.25} aria-hidden="true" />
          </button>
        )}
      </div>

      {count > 1 && (
        <div className="dots mt-3" aria-hidden="true">
          {photos.map((photo, i) => (
            <span key={photo.id} className="dot" data-active={i === index} />
          ))}
        </div>
      )}
    </div>
  )
}
