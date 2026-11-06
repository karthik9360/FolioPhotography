import { useState } from 'react'
import { timeAgo } from '../../lib/time'

const CAPTION_LIMIT = 110

/** Likes, caption, comment preview, the expandable comment region, and the timestamp. */
export default function PostBody({ post, handle, likes, comments, now, open, regionId, onToggleComments, onAddComment }) {
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState('')
  const preview = comments.slice(0, 2)
  const rest = comments.slice(2)
  const long = post.caption.length > CAPTION_LIMIT

  function submit(event) {
    event.preventDefault()
    if (!draft.trim()) return
    onAddComment(draft)
    setDraft('')
  }

  return (
    <div className="mt-1">
      <p className="font-medium tabular-nums">{likes.toLocaleString('en-US')} likes</p>

      <p className={`mt-1 whitespace-pre-line ${expanded ? '' : 'line-clamp-2'}`}>
        <span className="font-medium">{handle}</span> {post.caption}
      </p>
      {long && !expanded && (
        <button type="button" className="text-ink-soft" onClick={() => setExpanded(true)}>
          more
        </button>
      )}

      {comments.length > 0 && (
        <ul className="mt-3 space-y-1">
          {preview.map((c) => (
            <li key={c.id}>
              <span className="font-medium">{c.author}</span> {c.text}
            </li>
          ))}
        </ul>
      )}

      {comments.length > 2 && (
        <button
          type="button"
          className="mt-2 text-ink-soft"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={onToggleComments}
        >
          {open ? 'Hide comments' : `View all ${comments.length} comments`}
        </button>
      )}

      <div id={regionId} className="reveal" data-open={open}>
        <div inert={open ? undefined : true}>
          {rest.length > 0 && (
            <ul className="mt-3 space-y-1">
              {rest.map((c) => (
                <li key={c.id}>
                  <span className="font-medium">{c.author}</span> {c.text}
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={submit} className="mt-3 flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor={`${regionId}-input`} className="sr-only">
                Add a comment
              </label>
              <input
                id={`${regionId}-input`}
                className="field-input"
                placeholder="Add a comment"
                autoComplete="off"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </div>
            <button type="submit" className="link mb-3 disabled:opacity-40" disabled={!draft.trim()}>
              Post
            </button>
          </form>
        </div>
      </div>

      <p className="mt-3">
        <time dateTime={new Date(post.createdAt).toISOString()} className="label text-ink-soft">
          {timeAgo(post.createdAt, now)}
        </time>
      </p>
    </div>
  )
}
