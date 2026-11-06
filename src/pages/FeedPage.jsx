import { useEffect, useMemo, useRef } from 'react'
import LookbookGrid, { LookbookSkeleton } from '../components/gallery/LookbookGrid'
import SuggestedUsers from '../components/feed/SuggestedUsers'
import { useCreativeHub, useWorkspaceState } from '../context/CreativeHubContext'
import { useUserTenant } from '../context/TenantContext'
import { useSocialFeed } from '../hooks/useSocialFeed'

const SCOPES = [
  { id: 'for-you', label: 'For you' },
  { id: 'following', label: 'Following' },
]

/**
 * The lookbook feed: every photographer's newest posts, and their 3D nodes, as one asymmetric editorial
 * grid, a cover photograph per post. A cell opens the post page, where the story, comments and sharing
 * live. A 3D node renders in place and can be rotated.
 */
export default function FeedPage() {
  // Remembered for this identity, so coming back from Upload or Review keeps your tab.
  const [scope, setScope] = useWorkspaceState('feed.scope', 'for-you')
  const feed = useSocialFeed(scope)
  const { posts, all, loading, hasMore, loadMore } = feed
  const { photoById } = useUserTenant()
  const { remember } = useCreativeHub()
  const sentinel = useRef(null)

  // Leaving the feed stamps the visit, so posts that arrive later are marked New next time.
  useEffect(() => () => remember('feed.seenAt', Date.now()), [remember])

  // The whole list is arranged once and revealed page by page, so nothing moves as pages arrive.
  const items = useMemo(
    () =>
      all.map((entry) =>
        entry.type === '3d'
          ? { photo: entry, model: entry }
          : { photo: photoById(entry.photoIds[0]), post: entry, to: `/post/${entry.id}`, frames: entry.photoIds.length },
      ),
    [all, photoById],
  )

  // Infinite scroll: ask for the next page when the end of the list nears the viewport.
  // A fresh observer reports the current state straight away, so a short page keeps loading.
  useEffect(() => {
    const el = sentinel.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) loadMore()
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loading, loadMore, posts.length])

  const empty = !loading && posts.length === 0

  return (
    <main id="main" className="wrap pt-4 md:pt-6">
      <h1 className="sr-only">Feed</h1>

      <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3">
        <div role="group" aria-label="Feed" className="label flex gap-4">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              type="button"
              className="nav-link"
              aria-pressed={scope === s.id}
              onClick={() => setScope(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="caption min-h-5 text-ink" aria-live="polite">
          {feed.error}
        </p>
      </div>

      <aside className="py-4" aria-label="Suggestions">
        <SuggestedUsers limit={4} />
      </aside>

      <section aria-label="Posts" className="mt-4 md:mt-5">
        {posts.length > 0 && <LookbookGrid items={items} limit={posts.length} label="Posts" showOwner markNew />}

        {loading && <LookbookSkeleton count={2} start={posts.length} />}
        <div ref={sentinel} aria-hidden="true" />

        {empty && (
          <div className="py-6">
            <h2 className="headline">{scope === 'following' ? 'Nothing here yet.' : 'No posts.'}</h2>
            <p className="measure mt-4 text-ink-soft">
              {scope === 'following' ? 'Follow photographers to see their posts in this feed.' : 'Check back soon.'}
            </p>
          </div>
        )}

        {!hasMore && !loading && posts.length > 0 && <p className="py-6 text-ink-soft">You’re all caught up.</p>}
      </section>
    </main>
  )
}
