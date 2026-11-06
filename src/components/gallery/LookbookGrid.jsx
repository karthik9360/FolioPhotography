import { useMemo, useState } from 'react'
import LookbookCell from './LookbookCell'
import SharePanel from '../feed/SharePanel'
import { useAuth } from '../../context/AuthContext'
import { useBooking } from '../../context/BookingContext'
import { useCreativeHub, useWorkspaceState } from '../../context/CreativeHubContext'
import { useUserTenant } from '../../context/TenantContext'
import { useViewer } from '../../context/ViewerContext'
import { arrangeLookbook } from '../../lib/lookbook'

/**
 * The asymmetric editorial grid that replaces uniform square grids. `items` is a list of
 * `{ photo, to?, post?, frames? }`; the cadence (hero, tall, tall, hero ...) is decided here from each
 * photograph's own shape. One share panel serves the whole grid.
 * `limit` reveals only the first N cells of the full arrangement. A paged feed passes every item and
 * grows `limit`, so cells already on screen never move when the next page arrives.
 * An item with `model` is a `type: '3d'` node and renders a WebGL canvas. `markNew` flags posts newer
 * than this identity's last visit to the feed.
 * Per-identity demo state (private notes, client review tags) is kept in useCreativeHub.
 */
export default function LookbookGrid({ items, label = 'Lookbook', showOwner = false, limit = null, markNew = false }) {
  const { user } = useAuth()
  const { recall } = useCreativeHub()
  const [notes, setNotes] = useWorkspaceState('lookbook.notes', {})
  const [reviews, setReviews] = useWorkspaceState('lookbook.reviews', {})
  const [seenAt] = useState(() => (markNew ? recall('feed.seenAt', null) : null))
  const { openPhoto } = useViewer()
  const { openBooking } = useBooking()
  const { postsAll, profileFor, photoById } = useUserTenant()
  const [share, setShare] = useState({ post: null, open: false })

  const full = useMemo(() => arrangeLookbook(items), [items])
  const arranged = useMemo(() => (limit == null ? full : full.slice(0, limit)), [full, limit])
  const ids = useMemo(() => arranged.map((cell) => cell.item.photo.id), [arranged])
  const postByPhoto = useMemo(() => {
    const map = new Map()
    for (const post of postsAll) for (const id of post.photoIds) if (!map.has(id)) map.set(id, post)
    return map
  }, [postsAll])

  const sharePost = share.post
  return (
    <>
      <ul className="lookbook" aria-label={label}>
        {arranged.map(({ item, variant, row }, n) => {
          const { photo } = item
          const post = item.model ? null : (item.post ?? postByPhoto.get(photo.id) ?? null)
          const created = item.model?.createdAt ?? item.post?.createdAt
          const isOwn = user?.handle === photo.userHandle
          return (
            <LookbookCell
              key={photo.id}
              photo={photo}
              variant={variant}
              row={row}
              index={n}
              author={profileFor(photo.userHandle)}
              role={user?.role}
              model={item.model}
              isOwn={isOwn}
              isNew={seenAt != null && created > seenAt && !isOwn}
              note={notes[photo.id]}
              review={reviews[photo.id]}
              onNote={(id, text) => setNotes({ ...notes, [id]: text })}
              onReview={(id, tag) => setReviews({ ...reviews, [id]: tag })}
              showOwner={showOwner}
              to={item.to}
              frames={item.frames}
              canShare={Boolean(post)}
              onOpen={() => openPhoto(photo.id, ids)}
              onShare={() => setShare({ post, open: true })}
              onBook={openBooking}
            />
          )
        })}
      </ul>

      {sharePost && (
        <SharePanel
          open={share.open}
          onClose={() => setShare((s) => ({ ...s, open: false }))}
          post={sharePost}
          author={profileFor(sharePost.userHandle) ?? { handle: sharePost.userHandle, name: sharePost.userHandle }}
          cover={photoById(sharePost.photoIds[0])}
          count={sharePost.photoIds.length}
        />
      )}
    </>
  )
}

/** Placeholder cells while a page of the feed loads: the same frames, no spinner. */
export function LookbookSkeleton({ count = 2, start = 0 }) {
  return (
    <ul className="lookbook mt-[clamp(16px,2.4vw,32px)]" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const hero = (start + i + 1) % 4 < 2
        return (
          <li key={i} className={hero ? 'col-span-12 md:col-span-8' : 'col-span-12 md:col-span-4'}>
            <div className={`lookbook-skeleton ${hero ? 'aspect-[16/9]' : 'aspect-[4/5]'}`} />
            <div className="lookbook-skeleton mt-4 h-5 w-2/3" />
          </li>
        )
      })}
    </ul>
  )
}
