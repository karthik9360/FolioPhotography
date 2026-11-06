/** Holds a post's place while the next page loads, so the feed never jumps. */
export default function PostSkeleton() {
  return (
    <div aria-hidden="true" className="mb-12 pb-12">
      <div className="flex items-center gap-3">
        <span className="size-10 rounded-full bg-photo-wash" />
        <span className="h-3 w-32 bg-photo-wash" />
      </div>
      <div className="mt-4 bg-photo-wash" style={{ aspectRatio: 0.8 }} />
      <div className="mt-6 space-y-2">
        <span className="block h-3 w-24 bg-photo-wash" />
        <span className="block h-3 w-full bg-photo-wash" />
        <span className="block h-3 w-2/3 bg-photo-wash" />
      </div>
    </div>
  )
}
