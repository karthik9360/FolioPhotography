import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { photos as staticPhotos, photosById as staticPhotosById } from '../data/photos'
import { posts as staticPosts, postsById as staticPostsById } from '../data/posts'
import { profiles as staticProfiles } from '../data/profile'
import { getDirectory } from '../lib/mockAuthApi'
import { persistPost } from '../lib/mockFeedApi'
import { useToast } from '../components/ui/Toast'

/*
 * useUserTenant: the multi-tenant content store. Every photographer has their own slice
 * (their uploads, then their seeded work), and everything that renders a user, a post or a photo
 * reads it from here. Uploads live in memory for the session: blob: URLs do not survive a reload.
 */

const TenantContext = createContext(null)

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))
export const initialsOf = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?'

/** An upload (the contract object plus userHandle and status) rendered as display photos and a post. */
function toDisplay(upload) {
  const created = Date.parse(upload.createdAt)
  const meta = upload.mediaMeta ?? []
  const firstLine = upload.caption.split('\n')[0].slice(0, 60)
  const exif = Object.fromEntries(Object.entries(upload.exifData ?? {}).filter(([, v]) => v))

  const photos = upload.mediaUrls.map((url, i) => {
    const m = meta[i] ?? {}
    const isVideo = m.type === 'video'
    const w = m.w || (isVideo ? 1280 : 1200)
    const h = m.h || (isVideo ? 720 : 1500)
    const title = firstLine || (isVideo ? 'New video' : 'New photograph')
    return {
      id: `${upload.id}:${i}`,
      userHandle: upload.userHandle,
      title,
      category: isVideo ? 'Video' : 'New',
      series: 'New',
      ratio: w / h,
      w,
      h,
      fullW: w,
      fullH: h,
      thumb: isVideo ? m.poster || '' : url,
      full: isVideo ? m.poster || '' : url,
      video: isVideo ? url : '', // the playable file, for a video
      duration: m.duration || 0,
      playable: m.playable !== false,
      alt: `${isVideo ? 'Video' : 'Photograph'} by ${upload.userHandle}: ${title}`,
      location: '',
      year: new Date(created).getFullYear(),
      story: upload.caption,
      exif: isVideo ? {} : exif,
      likes: upload.metrics.likes.length,
      seedComments: upload.metrics.comments,
      fresh: Date.now() - created < 4000, // drives the arrival animation, once
    }
  })

  const post = {
    id: upload.id,
    userHandle: upload.userHandle,
    photoIds: photos.map((p) => p.id),
    ratio: clamp(photos[0].ratio, 0.8, 1.5),
    location: '',
    caption: upload.caption,
    createdAt: created,
    likes: upload.metrics.likes.length,
    seedComments: upload.metrics.comments,
  }
  return { photos, post }
}

export function TenantProvider({ children }) {
  const toast = useToast()
  const [uploads, setUploads] = useState({}) // { [handle]: Upload[] }, newest first
  const [directory, setDirectory] = useState(getDirectory)

  const { user } = useAuth()

  const refreshDirectory = useCallback(() => setDirectory(getDirectory()), [])

  // Accounts are created and edited through the auth layer: re-read the public directory whenever
  // the signed-in user changes (sign-in, registration, or an edit that re-issues the session).
  useEffect(() => {
    refreshDirectory()
  }, [user?.id, user?.handle, user?.name, refreshDirectory])

  /**
   * Optimistic publish: the post goes to index 0 of this user's slice immediately, then the
   * (mock) save runs. If it fails the post is removed and the user is told.
   */
  const appendPost = useCallback(
    async (username, postData) => {
      const upload = { ...postData, userHandle: username, status: 'pending' }
      setUploads((u) => ({ ...u, [username]: [upload, ...(u[username] ?? [])] }))
      try {
        await persistPost(upload)
        setUploads((u) => ({
          ...u,
          [username]: (u[username] ?? []).map((p) => (p.id === upload.id ? { ...p, status: 'published' } : p)),
        }))
      } catch {
        setUploads((u) => ({ ...u, [username]: (u[username] ?? []).filter((p) => p.id !== upload.id) }))
        toast.show('Couldn’t publish that post, so it was removed.', 'error')
      }
    },
    [toast],
  )

  /** When a user renames their handle, their uploads move with them. */
  const renameHandle = useCallback((from, to) => {
    if (from === to) return
    setUploads((u) => {
      if (!u[from]) return u
      const { [from]: moved, ...rest } = u
      return { ...rest, [to]: moved.map((p) => ({ ...p, userHandle: to })) }
    })
  }, [])

  const displayById = useMemo(
    () => new Map(Object.values(uploads).flat().map((up) => [up.id, toDisplay(up)])),
    [uploads],
  )

  const uploadedPhotosById = useMemo(
    () => Object.fromEntries([...displayById.values()].flatMap((d) => d.photos.map((p) => [p.id, p]))),
    [displayById],
  )

  const uploadedPosts = useMemo(
    () => [...displayById.values()].map((d) => d.post).sort((a, b) => b.createdAt - a.createdAt),
    [displayById],
  )
  const postsAll = useMemo(() => [...uploadedPosts, ...staticPosts], [uploadedPosts])
  const uploadedPostsById = useMemo(() => Object.fromEntries(uploadedPosts.map((p) => [p.id, p])), [uploadedPosts])

  const photoById = useCallback((id) => uploadedPhotosById[id] ?? staticPhotosById[id], [uploadedPhotosById])
  const postById = useCallback((id) => uploadedPostsById[id] ?? staticPostsById[id], [uploadedPostsById])

  /** A user's photographs: their new uploads first (newest on top), then their seeded work. */
  const photosFor = useCallback(
    (handle) => {
      const fresh = (uploads[handle] ?? []).flatMap((up) => displayById.get(up.id).photos)
      const seeded = staticPhotos.filter((p) => p.userHandle === handle)
      return [...fresh, ...seeded]
    },
    [uploads, displayById],
  )

  const isPrivate = useCallback((handle) => directory.some((d) => d.handle === handle && d.isPrivate), [directory])

  /** A profile for any handle: seeded data, overridden by the users table, or built from it alone. */
  const profileFor = useCallback(
    (handle) => {
      const base = staticProfiles[handle]
      const dir = directory.find((d) => d.handle === handle)
      if (!base && !dir) return null
      const name = dir?.name ?? base.name
      const mine = photosFor(handle)
      return {
        handle,
        name,
        initials: initialsOf(name),
        location: base?.location ?? '',
        specialty: base?.specialty ?? '',
        bio: dir?.bio ?? base?.bio ?? '',
        categories: dir?.categories ?? (base ? [base.specialty] : []),
        avatarUrl: dir?.avatar || '',
        followers: base?.followers ?? 0,
        following: base?.following ?? 0,
        isPrivate: Boolean(dir?.isPrivate),
        isRegistered: Boolean(dir),
        isSeeded: Boolean(base),
        photoIds: mine.map((p) => p.id),
        series: base?.series ?? [],
        tagged: [],
      }
    },
    [directory, photosFor],
  )

  const seededProfiles = useCallback(() => Object.keys(staticProfiles).map(profileFor), [profileFor])

  /** Every photographer: the seeded demo set plus anyone who registered as a creator. For search. */
  const photographerProfiles = useCallback(() => {
    const handles = new Set(Object.keys(staticProfiles))
    for (const entry of directory) if (entry.role === 'creator') handles.add(entry.handle)
    return [...handles].map(profileFor).filter(Boolean)
  }, [directory, profileFor])

  const value = useMemo(
    () => ({
      appendPost,
      renameHandle,
      refreshDirectory,
      postsAll,
      photoById,
      postById,
      photosFor,
      profileFor,
      seededProfiles,
      photographerProfiles,
      isPrivate,
    }),
    [appendPost, renameHandle, refreshDirectory, postsAll, photoById, postById, photosFor, profileFor, seededProfiles, photographerProfiles, isPrivate],
  )

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useUserTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useUserTenant must be used inside TenantProvider')
  return ctx
}
