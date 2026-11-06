import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { photos } from '../data/photos'
import { posts } from '../data/posts'

const SocialContext = createContext(null)

// Photographs and posts share one store, keyed by id, so counts agree everywhere they appear.
const initialComments = Object.fromEntries([...photos, ...posts].map((item) => [item.id, item.seedComments]))

function toggleIn(set, id) {
  const next = new Set(set)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

// Local, in-memory social state. Replace with a real backend later.
export function SocialProvider({ children }) {
  const [liked, setLiked] = useState(() => new Set())
  const [saved, setSaved] = useState(() => new Set())
  const [comments, setComments] = useState(initialComments)
  const [following, setFollowing] = useState(() => new Set())

  const toggleLike = useCallback((id) => setLiked((s) => toggleIn(s, id)), [])
  const toggleSave = useCallback((id) => setSaved((s) => toggleIn(s, id)), [])
  const toggleFollow = useCallback((handle) => setFollowing((s) => toggleIn(s, handle)), [])

  const addComment = useCallback((id, text) => {
    const body = text.trim()
    if (!body) return
    setComments((c) => ({
      ...c,
      [id]: [...(c[id] ?? []), { id: `${id}-${Date.now()}`, author: 'you', text: body }],
    }))
  }, [])

  const value = useMemo(
    () => ({
      isLiked: (id) => liked.has(id),
      isSaved: (id) => saved.has(id),
      isFollowing: (handle) => following.has(handle),
      likeCount: (photo) => photo.likes + (liked.has(photo.id) ? 1 : 0),
      commentsFor: (id) => comments[id] ?? [],
      toggleLike,
      toggleSave,
      toggleFollow,
      addComment,
    }),
    [liked, saved, following, comments, toggleLike, toggleSave, toggleFollow, addComment],
  )

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
}

export function useSocial() {
  const ctx = useContext(SocialContext)
  if (!ctx) throw new Error('useSocial must be used inside SocialProvider')
  return ctx
}
