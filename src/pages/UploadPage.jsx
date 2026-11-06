import { useState } from 'react'
import { Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import FloatingField from '../components/auth/FloatingField'
import { useAuth } from '../context/AuthContext'
import { useUserTenant } from '../context/TenantContext'
import { useMediaUpload } from '../hooks/useMediaUpload'
import { ACCEPT, formatDuration, formatSize } from '../lib/media'
import { profilePath } from '../lib/routes'

const CAMERA_FIELDS = [
  ['Camera', 'Camera'],
  ['Lens', 'Lens'],
  ['ISO', 'ISO'],
  ['Aperture', 'Aperture'],
  ['Shutter', 'Shutter speed'],
]
const CAPTION_LIMIT = 2200

/** The upload page: photos and videos in one post, with a quiet drop zone and plain words throughout. */
export default function UploadPage() {
  const { user } = useAuth()
  const { appendPost } = useUserTenant()
  const navigate = useNavigate()
  const upload = useMediaUpload()
  const [caption, setCaption] = useState('')
  const [over, setOver] = useState(false)
  const hasCameraInfo = Object.values(upload.exif).some(Boolean)

  function post() {
    if (!upload.items.length || upload.busy) return
    const data = upload.buildPostData(caption)
    // The post shows up straight away at the top of your page, then goes to your profile.
    appendPost(user.handle, data)
    navigate(profilePath(user.handle))
  }

  return (
    <main id="main" className="wrap pb-4 pt-5 md:pt-6">
      <h1 className="display">Upload</h1>
      <p className="measure mt-4 text-xs text-ink-soft">
        Add photos or videos to share. Camera info is filled in for you when a photo has it, and you can fix
        anything that looks wrong.
      </p>

      <div className="mt-5 grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,40rem)_minmax(0,1fr)]">
        <div>
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
              accept={ACCEPT}
              className="sr-only"
              aria-label="Choose photos or videos"
              disabled={!upload.canAdd}
              onChange={(e) => {
                upload.addFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <span className="headline block">Drop your photos or videos here</span>
            <span className="mt-2 block text-ink-soft">
              or click to choose files. Photos and videos both work, up to {upload.max} in one post.
            </span>
          </label>
          <p className="float-msg" data-tone={upload.error ? 'error' : 'status'} aria-live="polite">
            {upload.error || (upload.busy ? 'Getting your files ready…' : ' ')}
          </p>

          {upload.items.length > 0 && (
            <ul className="mt-2 grid grid-cols-4 gap-[var(--gutter)]">
              {upload.items.map((item, i) => (
                <li key={item.id}>
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-photo-wash" data-kind={item.kind}>
                    {item.kind === 'image' ? (
                      <img src={item.url} alt={`Photo ${i + 1}: ${item.file.name}`} className="h-full w-full object-cover" />
                    ) : item.poster ? (
                      <>
                        <img src={item.poster} alt={`Video ${i + 1}: ${item.file.name}`} className="h-full w-full object-cover" />
                        <span className="media-badge caption flex items-center gap-1">
                          <Play size={10} strokeWidth={1.5} aria-hidden="true" />
                          {item.duration ? formatDuration(item.duration) : 'Video'}
                        </span>
                      </>
                    ) : (
                      <span className="caption grid h-full place-items-center p-2 text-center text-ink-soft">
                        Video: no preview, but it can still be posted
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="link caption mt-1"
                    aria-label={`Remove ${item.file.name}`}
                    onClick={() => upload.remove(item.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4">
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

          {upload.hasPhotos && (
            <details className="mt-4" open={hasCameraInfo}>
              <summary className="link w-fit cursor-pointer">Camera info</summary>
              <p className="caption mt-3 text-ink-soft">
                {hasCameraInfo
                  ? 'Filled in from your photo. Fix anything that’s wrong.'
                  : 'We couldn’t find camera info in this photo. You can add it if you like.'}
              </p>
              <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
                {CAMERA_FIELDS.map(([key, label]) => (
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

          <button type="button" className="btn btn-primary btn-auth mt-5" disabled={!upload.items.length || upload.busy} onClick={post}>
            Post to feed
          </button>
        </div>

        <aside aria-labelledby="details-title" className="lg:sticky lg:top-16 lg:self-start">
          <h2 id="details-title" className="label text-ink-soft">
            Photo details
          </h2>
          {upload.items.length === 0 ? (
            <p className="caption mt-3 text-ink-soft">Add a photo or video and its details show up here.</p>
          ) : (
            upload.items.map((item, i) => (
              <div key={item.id} className="mt-4">
                <p className="font-medium">{item.kind === 'video' ? `Video ${i + 1}` : `Photo ${i + 1}`}</p>
                <p className="caption truncate text-ink-soft">{item.file.name}</p>
                {item.kind === 'video' ? (
                  <>
                    <p className="caption text-ink-soft">
                      {item.playable
                        ? `${item.w}×${item.h} · ${item.duration ? `${formatDuration(item.duration)} · ` : ''}${formatSize(item.file.size)}`
                        : `${formatSize(item.file.size)}. Your browser can’t preview this video, but you can still post it.`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="caption text-ink-soft">
                      {item.w}×{item.h} · {formatSize(item.file.size)}
                    </p>
                    <dl className="mt-2">
                      {CAMERA_FIELDS.map(([key, label]) => (
                        <div key={key} className="flex items-baseline justify-between gap-4 py-1">
                          <dt className="caption text-ink-soft">{label}</dt>
                          <dd className="data">{upload.exifById[item.id]?.[key] || '—'}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}
              </div>
            ))
          )}
        </aside>
      </div>
    </main>
  )
}
