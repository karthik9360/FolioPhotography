import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import { useSocial } from '../../context/SocialContext'
import { profilePath } from '../../lib/routes'

export default function PostHeader({ author, location, isSelf }) {
  const { isFollowing, toggleFollow } = useSocial()
  const following = isFollowing(author.handle)

  return (
    <header className="flex items-center gap-3">
      <Link to={profilePath(author.handle)} className="flex min-w-0 items-center gap-3">
        <Avatar user={author} />
        <span className="min-w-0">
          <span className="block truncate font-medium leading-tight">{author.handle}</span>
          {location && <span className="caption block truncate text-ink-soft">{location}</span>}
        </span>
      </Link>

      {!isSelf && (
        <button
          type="button"
          className={`nav-link label ml-auto${following ? '' : ' !text-signal'}`}
          aria-label={`${following ? 'Unfollow' : 'Follow'} ${author.handle}`}
          onClick={() => toggleFollow(author.handle)}
        >
          {following ? 'Following' : 'Follow'}
        </button>
      )}
    </header>
  )
}
