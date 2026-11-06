import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import { useAuth } from '../../context/AuthContext'
import { useSocial } from '../../context/SocialContext'
import { useUserTenant } from '../../context/TenantContext'
import { profilePath } from '../../lib/routes'

/** Suggested photographers to follow. A borderless list with generous rows; the order never changes
 *  when you follow someone, so nothing jumps. */
export default function SuggestedUsers({ limit = 5 }) {
  const { isFollowing, toggleFollow } = useSocial()
  const { user: me } = useAuth()
  const { seededProfiles } = useUserTenant()
  const suggestions = seededProfiles().filter((u) => u.handle !== me?.handle).slice(0, limit)

  return (
    <section aria-labelledby="suggested-title">
      <h2 id="suggested-title" className="label font-sans text-ink-soft">
        Suggested photographers
      </h2>
      <ul className="mt-2">
        {suggestions.map((person) => {
          const following = isFollowing(person.handle)
          return (
            <li key={person.handle} className="flex items-center gap-3 py-3">
              <Avatar user={person} />
              <Link to={profilePath(person.handle)} className="min-w-0 flex-1">
                <span className="block truncate font-medium leading-tight">{person.handle}</span>
                <span className="caption block truncate text-ink-soft">
                  {person.specialty} · {person.location}
                </span>
              </Link>
              <button
                type="button"
                className={`nav-link label${following ? '' : ' !text-signal'}`}
                aria-label={`${following ? 'Unfollow' : 'Follow'} ${person.handle}`}
                onClick={() => toggleFollow(person.handle)}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
