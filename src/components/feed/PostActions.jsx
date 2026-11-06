import { Bookmark, Heart, MessageCircle, Send } from 'lucide-react'

export default function PostActions({
  liked,
  saved,
  commentsOpen,
  commentsId,
  status,
  onLike,
  onSave,
  onComment,
  onShare,
}) {
  return (
    <div className="flex items-center">
      <div className="-ml-2.5 flex items-center">
        <button type="button" className="toggle-icon icon-btn" aria-pressed={liked} aria-label="Like" onClick={onLike}>
          <Heart size={24} strokeWidth={1.25} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-expanded={commentsOpen}
          aria-controls={commentsId}
          aria-label="Comment"
          onClick={onComment}
        >
          <MessageCircle size={24} strokeWidth={1.25} aria-hidden="true" />
        </button>
        <button type="button" className="icon-btn" aria-label="Copy link to post" onClick={onShare}>
          <Send size={24} strokeWidth={1.25} aria-hidden="true" />
        </button>
      </div>

      <p className="caption ml-2 text-ink-soft" aria-live="polite">
        {status}
      </p>

      <button
        type="button"
        className="toggle-icon icon-btn -mr-2.5 ml-auto"
        aria-pressed={saved}
        aria-label="Save to mood board"
        onClick={onSave}
      >
        <Bookmark size={24} strokeWidth={1.25} aria-hidden="true" />
      </button>
    </div>
  )
}
