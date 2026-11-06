import { useId, useState } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { useSocial } from '../../context/SocialContext'

export default function CommentPanel({ photo }) {
  const { commentsFor, addComment } = useSocial()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const regionId = useId()
  const comments = commentsFor(photo.id)

  function submit(event) {
    event.preventDefault()
    addComment(photo.id, draft)
    setDraft('')
  }

  return (
    <section aria-label="Comments">
      <button
        type="button"
        className="inline-flex h-11 items-center gap-2"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen((v) => !v)}
      >
        <MessageCircle size={20} strokeWidth={1.25} aria-hidden="true" />
        <span className="data">{comments.length}</span>
        <span className="label">{comments.length === 1 ? 'Comment' : 'Comments'}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.25}
          aria-hidden="true"
          className="transition-transform duration-[220ms]"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      <div id={regionId} className="reveal" data-open={open}>
        <div>
          <ul className="mt-4 space-y-4">
            {comments.length === 0 && (
              <li className="caption text-darkroom-dim">No comments yet. Start the conversation.</li>
            )}
            {comments.map((c) => (
              <li key={c.id}>
                <p className="label text-darkroom-dim">{c.author}</p>
                <p className="mt-1 text-[0.9375rem] leading-snug">{c.text}</p>
              </li>
            ))}
          </ul>

          <form onSubmit={submit} className="mt-6 flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor={`${regionId}-draft`} className="caption text-darkroom-dim">
                Add a comment
              </label>
              <input
                id={`${regionId}-draft`}
                className="field-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Say something kind"
                autoComplete="off"
                tabIndex={open ? 0 : -1}
              />
            </div>
            <button type="submit" className="btn btn-quiet" disabled={!draft.trim()} tabIndex={open ? 0 : -1}>
              Post
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
