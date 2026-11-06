import { Heart } from 'lucide-react'
import { useSocial } from '../../context/SocialContext'

export default function LikeButton({ photo }) {
  const { isLiked, toggleLike, likeCount } = useSocial()
  return (
    <button
      type="button"
      className="toggle-icon inline-flex h-11 items-center gap-2"
      aria-pressed={isLiked(photo.id)}
      aria-label="Like photograph"
      onClick={() => toggleLike(photo.id)}
    >
      <Heart size={20} strokeWidth={1.25} aria-hidden="true" />
      <span className="data">{likeCount(photo).toLocaleString('en-US')}</span>
    </button>
  )
}
