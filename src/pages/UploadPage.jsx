import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FloatingField from '../components/auth/FloatingField'
import { useAuth } from '../context/AuthContext'
import { useUserTenant } from '../context/TenantContext'
import { useMediaUpload } from '../hooks/useMediaUpload'
import { profilePath } from '../lib/routes'

const EXIF_FIELDS = [
  ['Camera', 'Camera'],
  ['Lens', 'Lens'],
  ['ISO', 'ISO'],
  ['Aperture', 'Aperture'],
  ['Shutter', 'Shutter speed'],
]
const CAPTION_LIMIT = 2200

export default function UploadPage() {
  const { user } = useAuth()
  const { appendPost } = useUserTenant()
  const navigate = useNavigate()
  const upload = useMediaUpload()
  const [caption, setCaption] = useState('')
  const [over, setOver] = useState(false)
  const hasExif = Object.values(upload.exif).some(Boolean)

  function publish() {
    if (!upload.items.length) return
    const post = upload.buildPostData(caption)
    // 1. Optimistic: the post goes to index 0 of this photographer's slice, straight away.
    appendPost(user.handle, post)
    // 2. Straight to their profile, where the new cell reveals itself. Same tick, so the profile's
    //    first render already contains the post: no flash of the old grid.
    navigate(profilePath(user.handle))
  }

  return (
    <main id="main" className="wrap pb-10 pt-12 md:pt-20">
      <h1 className="display">Upload</h1>
      <p className="measure mt-6 text-[1.0625rem] text-ink-soft">
        Add up to {upload.max} photographs to one post. Camera details are read from the files when they have
        them, and you can correct them below.
      </p>

      <div className="mt-12 max-w-[40rem]">
        <label
          className="drop"
          data-over={over}
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setOver(false)
            upload.addFiles(e.dataTransfer.files)
          }}
        >
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Choose photographs"
            disabled={!upload.canAdd}
            onChange={(e) => {
              upload.addFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <span className="headline block">Drop photographs here</span>
          <span className="mt-2 block text-ink-soft">
            or click to choose. JPEG, PNG or WebP, up to {upload.max} per post.
          </span>
        </label>
        <p className="float-msg" data-tone="error" aria-live="polite">
          {upload.error || ' '}
        </p>

        {upload.items.length > 0 && (
          <ul className="mt-6 grid grid-cols-4 gap-[var(--gutter)]">
            {upload.items.map((item, i) => (
              <li key={item.id}>
                <img src={item.url} alt={`Selected photograph ${i + 1}`} className="aspect-[4/5] w-full object-cover" />
                <button
                  type="button"
                  className="link mt-2 caption"
                  aria-label={`Remove photograph ${i + 1}`}
                  onClick={() => upload.remove(item.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10">
          <FloatingField
            label="Caption"
            name="caption"
            multiline
            maxLength={CAPTION_LIMIT}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            counter={{ max: CAPTION_LIMIT }}
          />
        </div>

        {upload.items.length > 0 && (
          <details className="mt-8" open={hasExif}>
            <summary className="link w-fit cursor-pointer">Technical details</summary>
            <p className="caption mt-3 text-ink-soft">
              {hasExif ? 'Read from your photograph. Edit anything that is wrong.' : 'No camera data was found in this file. Add it if you like.'}
            </p>
            <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
              {EXIF_FIELDS.map(([key, label]) => (
                <FloatingField
                  key={key}
                  label={label}
                  name={`exif-${key}`}
                  value={upload.exif[key]}
                  onChange={(e) => upload.setExifField(key, e.target.value)}
                />
              ))}
            </div>
          </details>
        )}

        <button type="button" className="btn btn-primary btn-auth mt-12" disabled={!upload.items.length} onClick={publish}>
          Publish to Feed
        </button>
      </div>
    </main>
  )
}
