/**
 * A live miniature of the public profile, driven by the form's current (unsaved) values.
 * Photographs fill the grid; with none yet, quiet placeholders hold the shape.
 */
export default function ProfilePreview({ name, handle, bio, categories, avatar, initials, photos }) {
  const tiles = Array.from({ length: 6 }, (_, i) => photos[i] ?? null)

  return (
    <section aria-labelledby="preview-title">
      <h2 id="preview-title" className="label text-ink-soft">
        Live preview
      </h2>

      <div className="mt-4 flex items-center gap-4">
        {avatar ? (
          <img src={avatar} alt="" className="size-[72px] flex-none object-cover" />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-[72px] flex-none place-items-center bg-ink font-display text-base tracking-[0.06em] text-paper"
          >
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-display text-base leading-tight tracking-[0.01em]">{name || 'Your name'}</p>
          <p className="caption truncate text-ink-soft">@{handle || 'username'}</p>
        </div>
      </div>

      <p className="mt-5 max-w-[30rem] text-xs leading-relaxed">
        {bio || <span className="text-ink-soft">Your biography will appear here.</span>}
      </p>
      <p className="label mt-3 min-h-4 text-ink-soft">{categories.join(' · ')}</p>

      <ul className="mt-4 grid max-w-[30rem] grid-cols-3 gap-[var(--gutter)]" aria-hidden="true">
        {tiles.map((photo, i) => (
          <li key={photo?.id ?? `empty-${i}`} className="bg-photo-wash" style={{ aspectRatio: 0.8 }}>
            {photo && <img src={photo.thumb} alt="" className="h-full w-full object-cover" />}
          </li>
        ))}
      </ul>
    </section>
  )
}
