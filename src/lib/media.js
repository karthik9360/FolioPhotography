// What the upload page accepts, and how it reads a file. Photos and videos both work: the picker
// accepts any file the browser reports as an image or a video, and also recognises common video
// file extensions by name, because some systems report no type for them (an empty type, or a
// generic one). "ANSL" is accepted by its extension on a best guess; a file saved with a real video
// type works whatever it is called.

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']
const VIDEO_EXTENSIONS = ['mp4', 'm4v', 'mov', 'webm', 'ogv', 'ogg', 'avi', 'mkv', 'mpg', 'mpeg', 'mts', 'm2ts', '3gp', 'wmv', 'flv', 'ansl']

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024

/** The `accept` list for the file picker. */
export const ACCEPT = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'video/*',
  ...VIDEO_EXTENSIONS.map((ext) => `.${ext}`),
].join(',')

const extensionOf = (name) => String(name).toLowerCase().split('.').pop()

/** 'image', 'video', or null when the file is neither. */
export function kindOf(file) {
  const type = String(file.type ?? '').toLowerCase()
  const ext = extensionOf(file.name)
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image'
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video'
  return null
}

/** 1:05, 0:42, 1:02:30. */
export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

/** 1.4 MB, 312 KB. */
export function formatSize(bytes) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 ** 3).toFixed(1)} GB`
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** Width and height of an image. Zeros if the browser cannot read it. */
export const measureImage = (url) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => resolve({ w: 0, h: 0 })
    img.src = url
  })

/**
 * Reads a video in the browser: its size, length, and a still frame to use as the cover. If the
 * browser cannot decode the file (some formats cannot be played on the web), `playable` is false and
 * there is no cover; the file can still be posted.
 */
export function readVideo(url) {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    let done = false
    const finish = (result) => {
      if (done) return
      done = true
      clearTimeout(timer)
      video.removeAttribute('src')
      video.load()
      resolve(result)
    }
    const unplayable = { w: 0, h: 0, duration: 0, poster: '', playable: false }
    const timer = setTimeout(() => finish(unplayable), 6000)
    video.onerror = () => finish(unplayable)
    const capture = () => {
      const w = video.videoWidth
      const h = video.videoHeight
      const duration = Number.isFinite(video.duration) ? video.duration : 0 // some recordings do not say how long they are
      if (!w || !h) return finish(unplayable)
      const scale = Math.min(1, 800 / w)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(w * scale)
      canvas.height = Math.round(h * scale)
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => finish({ w, h, duration, poster: blob ? URL.createObjectURL(blob) : '', playable: true }),
        'image/jpeg',
        0.82,
      )
    }
    video.onloadeddata = () => {
      const known = Number.isFinite(video.duration) && video.duration > 0
      if (known) video.currentTime = Math.min(1, video.duration / 2) // a frame a moment in, not the black first one
      else capture()
    }
    video.onseeked = capture
    video.src = url
  })
}
