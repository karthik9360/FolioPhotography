import { useRef, useState } from 'react'

const SIZE = 320
const MAX_BYTES = 10 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Centre-crops an image to a square and returns a small JPEG data URL. */
async function cropToSquare(file) {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#f2f2ef' // so a transparent PNG does not turn black
  ctx.fillRect(0, 0, SIZE, SIZE)
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE)
  bitmap.close?.()
  return canvas.toDataURL('image/jpeg', 0.86)
}

/**
 * A circular drop target for the avatar. Drop an image on it, or click it to choose one; it is
 * cropped to a square and shown straight away. Nothing is uploaded: the result is a data URL.
 */
export default function AvatarDrop({ value, initials, onChange, dirty = false }) {
  const [over, setOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  async function handleFile(file) {
    setError('')
    if (!file) return
    if (!TYPES.includes(file.type)) return setError('Use a JPEG, PNG or WebP image.')
    if (file.size > MAX_BYTES) return setError('That image is over 10 MB.')
    try {
      onChange(await cropToSquare(file))
    } catch {
      setError('Couldn’t read that image.')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-6">
        <label
          className="avatar-drop"
          data-over={over}
          data-dirty={dirty}
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setOver(false)
            handleFile(e.dataTransfer.files[0])
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={TYPES.join(',')}
            className="sr-only"
            aria-label="Replace avatar"
            onChange={(e) => {
              handleFile(e.target.files[0])
              e.target.value = '' // let the same file be chosen again
            }}
          />
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden="true" className="font-display text-4xl tracking-[-0.03em]">
              {initials}
            </span>
          )}
        </label>

        <div>
          <p className="font-medium">Avatar</p>
          <p className="caption mt-1 max-w-[16rem] text-ink-soft">
            Drop an image on the circle, or click it. It is cropped to a square for you.
          </p>
          {value && (
            <button type="button" className="link mt-2" onClick={() => onChange('')}>
              Remove
            </button>
          )}
        </div>
      </div>
      <p className="float-msg" data-tone={error ? 'error' : 'hint'} aria-live="polite">
        {error || ' '}
      </p>
    </div>
  )
}
