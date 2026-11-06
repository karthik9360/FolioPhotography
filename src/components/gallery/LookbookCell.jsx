import { Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import ModelViewport from './ModelViewport'
import RoleControls, { reviewLabel } from './RoleControls'
import { canBook } from '../../config/navigation'
import { useSocial } from '../../context/SocialContext'
import { meshLabel } from '../../data/models'
import { useGridInteraction } from '../../hooks/useGridInteraction'
import { HERO, exifTokens, projectCode } from '../../lib/lookbook'
import { formatDuration } from '../../lib/media'

// Literal class strings so Tailwind sees them: hero spreads and tall columns.
const FRAME = {
  [HERO]: { cell: 'col-span-12 md:col-span-8', ratio: 'aspect-[16/9]' },
  tall: { cell: 'col-span-12 md:col-span-4', ratio: 'aspect-[4/5]' },
}

/**
 * One cell of the lookbook: the work in its frame (a photograph, or a WebGL canvas for a `type: '3d'`
 * node), then a text block beneath it (asset name, technical category, project code). No like or
 * comment icons. On hover or keyboard focus the photograph warms from grey and eases up to 1.025, and
 * a borderless overlay glides up with the technical data, the credit, and the controls this viewer
 * may use. On touch screens, which have no hover, the overlay sits as plain text under the image.
 *  - `to`: link to this address instead of opening the lightbox (the feed opens the post page).
 *  - `frames`: number of photographs when the cell stands for a multi-photo post.
 *  - `model`: the 3D node, when the cell is one (`photo` is then the same node).
 */
export default function LookbookCell({
  photo,
  model,
  variant,
  row,
  index,
  author,
  role,
  isOwn,
  showOwner,
  to,
  frames = 1,
  canShare,
  isNew,
  note,
  review,
  onNote,
  onReview,
  onOpen,
  onShare,
  onBook,
}) {
  const { isFollowing, toggleFollow } = useSocial()
  const { ref, subscribe } = useGridInteraction()
  const frame = FRAME[variant]
  const name = author?.name ?? photo.userHandle
  const label = `Open ${photo.title} by ${name}`
  const stagger = variant === 'tall' && row % 2 === 0 ? 'md:mt-6' : ''
  const tokens = model
    ? [`${model.polyCount.toLocaleString('en-US')} faces`, meshLabel(model.mesh), ...model.tags]
    : exifTokens(photo.exif)
  const following = isFollowing(photo.userHandle)
  const status = isNew ? 'New' : reviewLabel(review) || (note ? 'Private note' : '')

  const image =
    !model &&
    (photo.thumb ? (
      <img
        src={photo.thumb}
        alt={photo.alt}
        width={photo.w}
        height={photo.h}
        loading={index < 2 ? 'eager' : 'lazy'}
        decoding="async"
      />
    ) : (
      <span className="caption grid h-full place-items-center text-ink-soft">Video</span>
    ))

  return (
    <li
      className={`lookbook-cell ${frame.cell} ${stagger} ${variant === HERO ? 'md:self-start' : 'md:self-end'} ${photo.fresh ? 'cell-in' : 'rise'}`}
      style={{ '--i': Math.min(index, 8) }}
      data-variant={variant}
      data-type={model ? '3d' : 'image'}
    >
      <div className="lookbook-frame" ref={ref}>
        <div className={`lookbook-stage ${frame.ratio}`}>
          {model ? (
            <ModelViewport model={model} subscribe={subscribe} />
          ) : to ? (
            <Link to={to} className="lookbook-open" aria-label={label}>
              {image}
            </Link>
          ) : (
            <button type="button" className="lookbook-open" aria-label={label} onClick={onOpen}>
              {image}
            </button>
          )}
          {photo.video && (
            <span className="media-badge caption pointer-events-none flex items-center gap-1">
              <Play size={10} strokeWidth={1.5} aria-hidden="true" />
              {photo.duration ? formatDuration(photo.duration) : 'Video'}
            </span>
          )}
        </div>

        <div className="lookbook-overlay">
          <p className="data" data-slot="exif">
            {tokens.length > 0 ? tokens.join(' · ') : photo.video ? 'Video' : 'No camera info'}
          </p>

          <RoleControls
            role={role}
            isOwn={isOwn}
            assetId={photo.id}
            title={photo.title}
            note={note}
            onNote={onNote}
            review={review}
            onReview={onReview}
          />

          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <p className="caption">
              {model ? 'Model' : 'Photograph'} by {name}
            </p>
            <p className="label flex flex-wrap gap-x-6 gap-y-1">
              {!model &&
                (to ? (
                  <Link to={to} className="nav-link !text-ink">
                    View
                  </Link>
                ) : (
                  <button type="button" className="nav-link !text-ink" onClick={onOpen}>
                    View
                  </button>
                ))}
              {canShare && (
                <button type="button" className="nav-link !text-ink" onClick={onShare}>
                  Share
                </button>
              )}
              {role !== 'client' && !isOwn && (
                <button
                  type="button"
                  className="nav-link !text-ink"
                  aria-pressed={following}
                  aria-label={`${following ? 'Unfollow' : 'Follow'} ${photo.userHandle}`}
                  onClick={() => toggleFollow(photo.userHandle)}
                >
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
              {canBook(role) && !isOwn && (
                <button type="button" className="nav-link !text-ink" onClick={onBook}>
                  Book
                </button>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1">
        <h2 className="font-display text-sm leading-tight tracking-[0.01em]">{photo.title}</h2>
        <span className="data text-ink-soft">{projectCode(photo)}</span>
        <p className="label col-span-2 text-ink-soft">
          {[photo.category, photo.series, frames > 1 ? `${frames} frames` : '', showOwner ? `@${photo.userHandle}` : '', status]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
    </li>
  )
}
