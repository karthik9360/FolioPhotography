import { useRef, useState } from 'react'
import { Paperclip, X } from 'lucide-react'

const MAX_FILES = 4
const MAX_BYTES = 15 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

const measure = (url) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => resolve({ w: 0, h: 0 })
    img.src = url
  })

/** The message box: text (Enter sends, Shift+Enter adds a line) and up to four photographs. */
export default function Composer({ onSend, name }) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState([]) // [{ id, url, w, h, alt }]
  const [error, setError] = useState('')
  const picker = useRef(null)

  async function addFiles(list) {
    setError('')
    const room = MAX_FILES - files.length
    const valid = [...list].filter((f) => TYPES.includes(f.type) && f.size <= MAX_BYTES)
    if (valid.length < list.length) setError('Use JPEG, PNG or WebP images under 15 MB.')
    if (valid.length > room) setError(`You can share up to ${MAX_FILES} photographs at a time.`)
    const added = await Promise.all(
      valid.slice(0, Math.max(0, room)).map(async (file) => {
        const url = URL.createObjectURL(file)
        return { id: crypto.randomUUID(), url, alt: 'Shared photograph', ...(await measure(url)) }
      }),
    )
    setFiles((prev) => [...prev, ...added])
  }

  function removeFile(id) {
    setFiles((prev) => {
      const gone = prev.find((f) => f.id === id)
      if (gone) URL.revokeObjectURL(gone.url)
      return prev.filter((f) => f.id !== id)
    })
  }

  function submit(event) {
    event?.preventDefault()
    if (!text.trim() && files.length === 0) return
    onSend({ text, attachments: files }) // the sent message keeps these URLs
    setText('')
    setFiles([])
    setError('')
  }

  return (
    <form onSubmit={submit} className="border-t border-hairline pt-4">
      {files.length > 0 && (
        <ul className="mb-3 flex gap-3">
          {files.map((file, i) => (
            <li key={file.id} className="relative">
              <img src={file.url} alt={`Photograph ${i + 1} to share`} className="size-14 object-cover" />
              <button
                type="button"
                className="absolute -right-2 -top-2 grid size-6 place-items-center bg-ink text-paper"
                aria-label={`Remove photograph ${i + 1}`}
                onClick={() => removeFile(file.id)}
              >
                <X size={14} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          className="icon-btn -ml-2.5"
          aria-label="Attach photographs"
          disabled={files.length >= MAX_FILES}
          onClick={() => picker.current?.click()}
        >
          <Paperclip size={22} strokeWidth={1.25} aria-hidden="true" />
        </button>
        <input
          ref={picker}
          type="file"
          multiple
          accept={TYPES.join(',')}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />

        <div className="flex-1">
          <label htmlFor="message-input" className="sr-only">
            Message {name}
          </label>
          <textarea
            id="message-input"
            className="field-input min-h-12 resize-none"
            style={{ fieldSizing: 'content', maxHeight: 128 }}
            rows={1}
            placeholder="Write a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) submit(e)
            }}
          />
        </div>

        <button type="submit" className="btn btn-primary !h-11 !px-5" disabled={!text.trim() && files.length === 0}>
          Send
        </button>
      </div>
      <p className="float-msg" data-tone="error" aria-live="polite">
        {error || ' '}
      </p>
    </form>
  )
}
