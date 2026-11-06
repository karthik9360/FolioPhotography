import { useCallback, useEffect, useRef, useState } from 'react'
import { useTopProgress } from '../components/ui/TopProgress'
import { EMPTY_EXIF, readExif } from '../lib/exif'
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, formatSize, kindOf, measureImage, readVideo } from '../lib/media'

const MAX_FILES = 10

const formatCaption = (text) =>
  text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

/**
 * Collects photos and videos for a post. Each file is checked, given a local preview address, and
 * read in the browser: photos for their size and camera info; videos for their size, length and a
 * cover frame (a video the browser cannot play is still accepted, just without a preview). Progress
 * shows as the thin bar on the top edge of the screen, never a spinner. Everything it says to the
 * person is in plain words.
 *
 * It builds the post object the rest of the app expects:
 *   { id, mediaUrls, mediaMeta, caption, exifData, createdAt, metrics }
 * where each `mediaMeta` entry is { type, w, h, name, duration, poster, playable }.
 * Preview addresses it made but never posted are released when the page closes.
 */
export function useMediaUpload() {
  const progress = useTopProgress()
  const [items, setItems] = useState([]) // [{ id, kind, file, url, w, h, duration, poster, playable }]
  const [exif, setExif] = useState(EMPTY_EXIF)
  const [exifById, setExifById] = useState({}) // camera info read from each photo, by item id
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const itemsRef = useRef(items)
  itemsRef.current = items
  const published = useRef(false)

  useEffect(
    () => () => {
      if (!published.current) {
        itemsRef.current.forEach((i) => {
          URL.revokeObjectURL(i.url)
          if (i.poster) URL.revokeObjectURL(i.poster)
        })
      }
    },
    [],
  )

  const addFiles = useCallback(
    async (fileList) => {
      setError('')
      const room = MAX_FILES - itemsRef.current.length
      const accepted = []
      const problems = []
      for (const file of [...fileList]) {
        const kind = kindOf(file)
        if (!kind) problems.push(`We can’t use “${file.name}” because it isn’t a photo or a video.`)
        else if (kind === 'image' && file.size > MAX_IMAGE_BYTES) problems.push(`“${file.name}” is too big. Photos can be up to ${formatSize(MAX_IMAGE_BYTES)}.`)
        else if (kind === 'video' && file.size > MAX_VIDEO_BYTES) problems.push(`“${file.name}” is too big. Videos can be up to ${formatSize(MAX_VIDEO_BYTES)}.`)
        else accepted.push({ file, kind })
      }
      if (accepted.length > room) {
        problems.push(
          room > 0
            ? `One post can hold ${MAX_FILES} files, so only the first ${room} were added.`
            : `One post can hold ${MAX_FILES} files. Remove one to add another.`,
        )
      }
      if (problems.length) setError(problems[0])
      const chosen = accepted.slice(0, Math.max(0, room))
      if (!chosen.length) return

      setBusy(true)
      progress.start()
      const firstEver = itemsRef.current.length === 0
      const added = []
      for (let i = 0; i < chosen.length; i += 1) {
        const { file, kind } = chosen[i]
        const url = URL.createObjectURL(file)
        const info = kind === 'video' ? await readVideo(url) : { ...(await measureImage(url)), duration: 0, poster: '', playable: true }
        added.push({ id: crypto.randomUUID(), kind, file, url, ...info })
        progress.set((i + 1) / chosen.length)
      }
      setItems((prev) => [...prev, ...added])

      // Camera info comes from photos only; the post's own details start from the first photo.
      const found = await Promise.all(added.map((a) => (a.kind === 'image' ? readExif(a.file) : Promise.resolve({ ...EMPTY_EXIF }))))
      setExifById((prev) => ({ ...prev, ...Object.fromEntries(added.map((a, i) => [a.id, found[i]])) }))
      const firstPhoto = found.find((_, i) => added[i].kind === 'image')
      if (firstEver && firstPhoto) setExif(firstPhoto)
      progress.finish()
      setBusy(false)
    },
    [progress],
  )

  const remove = useCallback((id) => {
    const target = itemsRef.current.find((i) => i.id === id)
    if (target) {
      URL.revokeObjectURL(target.url)
      if (target.poster) URL.revokeObjectURL(target.poster)
    }
    setItems((prev) => prev.filter((i) => i.id !== id))
    setError('')
  }, [])

  const setExifField = useCallback((key, value) => setExif((e) => ({ ...e, [key]: value })), [])

  /** Marks the files as posted (so their preview addresses are kept) and returns the post object. */
  const buildPostData = useCallback(
    (caption) => {
      published.current = true
      return {
        id: crypto.randomUUID(),
        mediaUrls: itemsRef.current.map((i) => i.url),
        mediaMeta: itemsRef.current.map((i) => ({
          type: i.kind,
          w: i.w,
          h: i.h,
          name: i.file.name,
          duration: i.duration,
          poster: i.poster,
          playable: i.playable,
        })),
        caption: formatCaption(caption),
        exifData: Object.fromEntries(Object.entries(exif).map(([k, v]) => [k, String(v).trim()])),
        createdAt: new Date().toISOString(),
        metrics: { likes: [], comments: [], bookmarks: [] },
      }
    },
    [exif],
  )

  const hasPhotos = items.some((i) => i.kind === 'image')

  return {
    items,
    exif,
    exifById,
    error,
    busy,
    hasPhotos,
    addFiles,
    remove,
    setExifField,
    buildPostData,
    canAdd: items.length < MAX_FILES,
    max: MAX_FILES,
  }
}
