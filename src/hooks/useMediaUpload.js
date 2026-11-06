import { useCallback, useEffect, useRef, useState } from 'react'
import { EMPTY_EXIF, readExif } from '../lib/exif'

const MAX_FILES = 4
const MAX_BYTES = 25 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

const measure = (url) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => resolve({ w: 0, h: 0 })
    img.src = url
  })

const formatCaption = (text) =>
  text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

/**
 * Collects photographs for a post: validates them, makes local blob: URLs, reads their dimensions
 * and EXIF, and builds the post object the rest of the app expects:
 *   { id, mediaUrls, mediaMeta, caption, exifData, createdAt, metrics }
 * Object URLs it created but never published are freed when the page closes.
 */
export function useMediaUpload() {
  const [items, setItems] = useState([]) // [{ id, file, url, w, h }]
  const [exif, setExif] = useState(EMPTY_EXIF)
  const [error, setError] = useState('')
  const itemsRef = useRef(items)
  itemsRef.current = items
  const published = useRef(false)

  useEffect(
    () => () => {
      if (!published.current) itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url))
    },
    [],
  )

  const addFiles = useCallback(async (fileList) => {
    setError('')
    const room = MAX_FILES - itemsRef.current.length
    const accepted = []
    for (const file of [...fileList]) {
      if (!TYPES.includes(file.type)) setError('Use JPEG, PNG or WebP images.')
      else if (file.size > MAX_BYTES) setError('Each photograph must be under 25 MB.')
      else accepted.push(file)
    }
    if (accepted.length > room) setError(`You can add up to ${MAX_FILES} photographs to one post.`)
    const chosen = accepted.slice(0, Math.max(0, room))
    if (!chosen.length) return

    const firstEver = itemsRef.current.length === 0
    const added = await Promise.all(
      chosen.map(async (file) => {
        const url = URL.createObjectURL(file)
        return { id: crypto.randomUUID(), file, url, ...(await measure(url)) }
      }),
    )
    setItems((prev) => [...prev, ...added])
    if (firstEver) setExif(await readExif(added[0].file)) // from the first photograph; editable
  }, [])

  const remove = useCallback((id) => {
    const target = itemsRef.current.find((i) => i.id === id)
    if (target) URL.revokeObjectURL(target.url)
    setItems((prev) => prev.filter((i) => i.id !== id))
    setError('')
  }, [])

  const setExifField = useCallback((key, value) => setExif((e) => ({ ...e, [key]: value })), [])

  /** Marks the photographs as published (so their URLs are kept) and returns the post object. */
  const buildPostData = useCallback(
    (caption) => {
      published.current = true
      return {
        id: crypto.randomUUID(),
        mediaUrls: itemsRef.current.map((i) => i.url),
        mediaMeta: itemsRef.current.map((i) => ({ w: i.w, h: i.h })),
        caption: formatCaption(caption),
        exifData: Object.fromEntries(Object.entries(exif).map(([k, v]) => [k, String(v).trim()])),
        createdAt: new Date().toISOString(),
        metrics: { likes: [], comments: [], bookmarks: [] },
      }
    },
    [exif],
  )

  return { items, exif, error, addFiles, remove, setExifField, buildPostData, canAdd: items.length < MAX_FILES, max: MAX_FILES }
}
