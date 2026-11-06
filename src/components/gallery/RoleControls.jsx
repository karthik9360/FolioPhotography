import { useId, useState } from 'react'

/** Review tags a client can set on a work. `done` is how the tag reads once chosen. */
export const REVIEW_TAGS = [
  { id: 'approve', label: 'Approve', done: 'Approved' },
  { id: 'revise', label: 'Ask for changes', done: 'Changes requested' },
  { id: 'hold', label: 'Hold', done: 'On hold' },
]
export const reviewLabel = (id) => REVIEW_TAGS.find((t) => t.id === id)?.done ?? ''

function PrivateNote({ assetId, note, onNote }) {
  const inputId = useId()
  const [draft, setDraft] = useState(note ?? '')
  const commit = () => {
    if (draft.trim() !== (note ?? '')) onNote(assetId, draft.trim())
  }
  return (
    <div>
      <label htmlFor={inputId} className="label block">
        Private note
      </label>
      <input
        id={inputId}
        className="lookbook-note"
        value={draft}
        maxLength={140}
        placeholder="Only you can see this"
        autoComplete="off"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit()
          }
        }}
      />
    </div>
  )
}

/**
 * The part of a lookbook cell's overlay that depends on who is looking:
 *  - a photographer on their own work edits a private note (kept for their identity only);
 *  - a client sets a review tag (Approve, Revise, Hold);
 *  - everyone else gets nothing extra here (followers get Follow and "New" elsewhere on the cell).
 * Notes and tags are demo state held in the browser for this session, per identity.
 */
export default function RoleControls({ role, isOwn, assetId, title, note, onNote, review, onReview }) {
  if (role === 'client') {
    return (
      <div role="group" aria-label={`Review ${title}`} className="label flex flex-wrap gap-x-6 gap-y-1">
        {REVIEW_TAGS.map((tag) => (
          <button
            key={tag.id}
            type="button"
            className="nav-link !text-ink"
            aria-pressed={review === tag.id}
            onClick={() => onReview(assetId, review === tag.id ? null : tag.id)}
          >
            {tag.label}
          </button>
        ))}
      </div>
    )
  }
  if (role === 'creator' && isOwn) return <PrivateNote assetId={assetId} note={note} onNote={onNote} />
  return null
}
