import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Sheet from '../ui/Sheet'
import LikeButton from '../social/LikeButton'
import SaveButton from '../social/SaveButton'
import CommentPanel from '../social/CommentPanel'
import { useUserTenant } from '../../context/TenantContext'
import { useViewer } from '../../context/ViewerContext'
import { useBooking } from '../../context/BookingContext'
import { site } from '../../config/site'

/** Full-screen lightbox: the photograph on the left, story + EXIF + social on the right. */
export default function PhotoViewer() {
  const { openId, list, close, step } = useViewer()
  const { openBooking } = useBooking()
  const { photoById, profileFor } = useUserTenant()
  const open = openId !== null

  // Keep the last photograph mounted while the exit transition plays.
  const [shownId, setShownId] = useState(null)
  useEffect(() => {
    if (openId) setShownId(openId)
  }, [openId])

  useEffect(() => {
    if (!open) return undefined
    function onKey(event) {
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (event.key === 'ArrowRight') step(1)
      else if (event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, step])

  const photo = shownId ? photoById(shownId) : null
  const position = photo ? list.indexOf(photo.id) + 1 : 0

  return (
    <Sheet
      open={open}
      onClose={close}
      label="Photograph viewer"
      className="darkroom"
      scrimClassName="viewer-scrim"
    >
      <div className="viewer-body text-darkroom-text">
        <button
          type="button"
          className="icon-btn fixed right-3 top-3 z-10 bg-darkroom"
          aria-label="Close viewer"
          onClick={close}
        >
          <X size={22} strokeWidth={1.25} aria-hidden="true" />
        </button>

        {photo && (
          <div className="grid min-h-full lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
            <div className="relative flex items-center justify-center px-4 pb-6 pt-20 lg:sticky lg:top-0 lg:h-svh lg:p-12">
              <img
                key={photo.id}
                src={photo.full}
                alt={photo.alt}
                width={photo.fullW}
                height={photo.fullH}
                className="h-auto max-h-[72svh] w-auto max-w-full object-contain lg:max-h-[calc(100svh-6rem)]"
              />
              {list.length > 1 && (
                <>
                  <button
                    type="button"
                    className="icon-btn absolute left-1 top-1/2 -translate-y-1/2 bg-darkroom lg:left-3"
                    aria-label="Previous photograph"
                    onClick={() => step(-1)}
                  >
                    <ChevronLeft size={24} strokeWidth={1.25} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="icon-btn absolute right-1 top-1/2 -translate-y-1/2 bg-darkroom lg:right-3"
                    aria-label="Next photograph"
                    onClick={() => step(1)}
                  >
                    <ChevronRight size={24} strokeWidth={1.25} aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            <aside className="border-t border-white/15 px-5 py-8 lg:border-l lg:border-t-0 lg:px-10 lg:py-14">
              <p className="data text-darkroom-dim">
                {position} of {list.length}
              </p>
              <h2 className="headline mt-6">{photo.title}</h2>
              <p className="caption mt-3 text-darkroom-dim">
                {photo.location}, {photo.year} · {photo.series}
              </p>

              <p className="caption mt-1 text-darkroom-dim">
                by {profileFor(photo.userHandle)?.name ?? photo.userHandle} (@{photo.userHandle})
              </p>

              <p className="measure mt-8 whitespace-pre-line text-[1.0625rem] leading-relaxed">{photo.story}</p>

              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/15 pt-8">
                {Object.entries(photo.exif).map(([key, value]) => (
                  <div key={key}>
                    <dt className="label text-darkroom-dim">{key}</dt>
                    <dd className="data mt-1">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 border-t border-white/15 pt-4">
                <LikeButton photo={photo} />
                <SaveButton photo={photo} />
              </div>

              <div className="mt-2">
                <CommentPanel key={photo.id} photo={photo} />
              </div>

              <div className="mt-10">
                <button type="button" className="btn btn-quiet" onClick={openBooking}>
                  Book a shoot
                </button>
              </div>

              <p className="caption mt-10 text-darkroom-dim">{site.demoNotice}</p>
            </aside>
          </div>
        )}
      </div>
    </Sheet>
  )
}
