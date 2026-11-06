import { Heart, MessageCircle } from 'lucide-react'
import { useSocial } from '../../context/SocialContext'

/**
 * One photograph in a grid. A button: opens the lightbox.
 * Hover or keyboard focus draws print crop marks and reveals the counters.
 */
export default function PhotoTile({ photo, onOpen, index = 0, variant = 'masonry', showCaption = true, showOwner = false }) {
  const { likeCount, commentsFor } = useSocial()
  const likes = likeCount(photo)
  const comments = commentsFor(photo.id).length
  const ratio = variant === 'grid' ? '4 / 5' : `${photo.w} / ${photo.h}`

  return (
    <div className={photo.fresh ? 'cell-in' : 'rise'} style={{ '--i': Math.min(index, 8) }}>
      <button
        type="button"
        className="photo-tile"
        aria-label={`Open ${photo.title}, ${likes} likes, ${comments} ${comments === 1 ? 'comment' : 'comments'}`}
        onClick={() => onOpen(photo.id)}
      >
        <span className="relative block">
          <span className="photo-frame block" style={{ aspectRatio: ratio }}>
            <img
              src={photo.thumb}
              alt={photo.alt}
              width={photo.w}
              height={photo.h}
              loading={index < 4 ? 'eager' : 'lazy'}
              decoding="async"
            />
            <span className="tile-counters data" aria-hidden="true">
              <span className="counter-chip">
                <Heart size={12} strokeWidth={1.5} />
                {likes.toLocaleString('en-US')}
              </span>
              <span className="counter-chip">
                <MessageCircle size={12} strokeWidth={1.5} />
                {comments}
              </span>
            </span>
          </span>
          <span className="crop-marks" aria-hidden="true" />
        </span>

        {showCaption && (
          <span className="mt-3 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <span className="text-[0.9375rem] font-medium leading-snug">{photo.title}</span>
            <span className="caption text-ink-soft sm:shrink-0">
              {showOwner ? `@${photo.userHandle}` : `${photo.location}, ${photo.year}`}
            </span>
          </span>
        )}
      </button>
    </div>
  )
}
