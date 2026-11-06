import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { models } from '../data/models'
import { persistReaction } from '../lib/mockFeedApi'
import { useAuth } from '../context/AuthContext'
import { useSocial } from '../context/SocialContext'
import { useUserTenant } from '../context/TenantContext'

const PAGE_SIZE = 4
const PAGE_LATENCY_MS = 450

/**
 * Optimistic like and save. The interface flips immediately; the (mock) request follows, and if it
 * fails the change is undone with a short message. `likeOnce` is for double-tap: it never un-likes.
 */
export function useReactions() {
  const social = useSocial()
  const [error, setError] = useState('')

  const react = useCallback(
    async (kind, id) => {
      const wasOn = kind === 'like' ? social.isLiked(id) : social.isSaved(id)
      const flip = kind === 'like' ? social.toggleLike : social.toggleSave
      flip(id) // optimistic
      setError('')
      try {
        await persistReaction(kind, id, !wasOn)
      } catch {
        flip(id) // roll back
        setError(`Couldn’t ${kind} that. Try again.`)
      }
    },
    [social],
  )

  return {
    error,
    toggleLike: (id) => react('like', id),
    toggleSave: (id) => react('save', id),
    likeOnce: (id) => {
      if (!social.isLiked(id)) react('like', id)
    },
  }
}

/**
 * Paginated feed. `scope` is 'for-you' (everyone) or 'following' (people you follow).
 * Pages arrive after a short delay, as they would from a server; `loadMore` is idempotent while a
 * page is in flight.
 */
export function useSocialFeed(scope = 'for-you') {
  const { isFollowing } = useSocial()
  const { postsAll, isPrivate } = useUserTenant() // new uploads sit at the top of postsAll
  const { user: me } = useAuth()
  const reactions = useReactions()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const busy = useRef(false)
  const timer = useRef(0)

  // A private account's posts reach only its owner and its followers.
  // 3D nodes (`type: '3d'`) join the same stream, newest first.
  const source = useMemo(() => {
    const visible = [...postsAll, ...models].sort((a, b) => b.createdAt - a.createdAt).filter(
      (p) => !isPrivate(p.userHandle) || p.userHandle === me?.handle || isFollowing(p.userHandle),
    )
    return scope === 'following' ? visible.filter((p) => isFollowing(p.userHandle)) : visible
  }, [scope, postsAll, isPrivate, isFollowing, me?.handle])
  const sourceLength = useRef(source.length)
  sourceLength.current = source.length

  const loadMore = useCallback(() => {
    if (busy.current) return
    busy.current = true
    setLoading(true)
    timer.current = setTimeout(() => {
      setCount((c) => c + PAGE_SIZE)
      busy.current = false
      setLoading(false)
    }, PAGE_LATENCY_MS)
  }, [])

  // Start over whenever the scope changes.
  useEffect(() => {
    setCount(0)
    if (sourceLength.current > 0) loadMore()
    return () => {
      clearTimeout(timer.current)
      busy.current = false
      setLoading(false)
    }
  }, [scope, loadMore])

  return {
    posts: source.slice(0, count),
    all: source, // every post in scope, for layouts that arrange the whole list and reveal it page by page
    loading,
    hasMore: count < source.length,
    loadMore,
    ...reactions,
  }
}
