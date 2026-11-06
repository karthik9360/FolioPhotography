import { useEffect, useRef, useState } from 'react'
import PostCard from '../components/feed/PostCard'
import PostSkeleton from '../components/feed/PostSkeleton'
import SuggestedUsers from '../components/feed/SuggestedUsers'
import { useSocialFeed } from '../hooks/useSocialFeed'

const SCOPES = [
  { id: 'for-you', label: 'For you' },
  { id: 'following', label: 'Following' },
]

/** The public feed: one post at a time, newest first, from every photographer. */
export default function FeedPage() {
  const [scope, setScope] = useState('for-you')
  const feed = useSocialFeed(scope)
  const { posts, loading, hasMore, loadMore } = feed
  const sentinel = useRef(null)

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
    <main id="main" className="wrap pt-8 md:pt-14">
      <h1 className="sr-only">Feed</h1>

      <div className="mx-auto grid max-w-[940px] gap-x-20 lg:grid-cols-[minmax(0,540px)_300px]">
        <section aria-label="Posts">
          <div role="group" aria-label="Feed" className="label mb-6 flex gap-8">
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

          <p className="caption mb-4 min-h-5 text-ink" aria-live="polite">
            {feed.error}
          </p>

          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} actions={feed} index={i} />
          ))}

          {loading && <PostSkeleton />}
          <div ref={sentinel} aria-hidden="true" />

          {empty && (
            <div className="py-16">
              <h2 className="headline">{scope === 'following' ? 'Nothing here yet.' : 'No posts.'}</h2>
              <p className="measure mt-4 text-ink-soft">
                {scope === 'following'
                  ? 'Follow photographers to see their posts in this feed.'
                  : 'Check back soon.'}
              </p>
            </div>
          )}

          {!hasMore && !loading && posts.length > 0 && (
            <p className="py-10 text-ink-soft">You’re all caught up.</p>
          )}
        </section>

        <aside className="hidden lg:block" aria-label="Suggestions">
          <div className="sticky top-24">
            <SuggestedUsers />
          </div>
        </aside>
      </div>
    </main>
  )
}
