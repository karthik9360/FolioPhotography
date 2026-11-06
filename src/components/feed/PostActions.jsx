/**
 * The post's actions, set as type rather than an icon row: Like, Comment, Share, and Save. A pressed
 * action keeps its underline. The accessible names are unchanged ("Like", "Comment", "Share post",
 * "Save to mood board"), and each contains its visible word.
 */
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
    <div className="label flex flex-wrap items-center gap-x-8 gap-y-1">
      <button type="button" className="nav-link" aria-pressed={liked} aria-label="Like" onClick={onLike}>
        Like
      </button>
      <button
        type="button"
        className="nav-link"
        aria-expanded={commentsOpen}
        aria-controls={commentsId}
        aria-label="Comment"
        onClick={onComment}
      >
        Comment
      </button>
      <button type="button" className="nav-link" aria-label="Share post" onClick={onShare}>
        Share
      </button>

      <p className="caption normal-case tracking-normal text-ink-soft" aria-live="polite">
        {status}
      </p>

      <button type="button" className="nav-link ml-auto" aria-pressed={saved} aria-label="Save to mood board" onClick={onSave}>
        Save
      </button>
    </div>
  )
}
