import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocial } from '../../context/SocialContext'
import { useUserTenant } from '../../context/TenantContext'
import { profilePath } from '../../lib/routes'

/** Suggested photographers as one typographic row: name, specialty, Follow. No avatars, no boxes. The
 *  order never changes when you follow someone, so nothing jumps. */
export default function SuggestedUsers({ limit = 4 }) {
  const { isFollowing, toggleFollow } = useSocial()
  const { user: me } = useAuth()
  const { seededProfiles } = useUserTenant()
  const suggestions = seededProfiles().filter((u) => u.handle !== me?.handle).slice(0, limit)

  return (
    <section aria-labelledby="suggested-title">
      <h2 id="suggested-title" className="label text-ink-soft">
        Suggested photographers
      </h2>
      <ul className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-2 sm:gap-y-5 lg:grid-cols-4">
        {suggestions.map((person) => {
          const following = isFollowing(person.handle)
          return (
            <li key={person.handle} className="flex items-baseline justify-between gap-4">
              <Link to={profilePath(person.handle)} className="min-w-0">
                <span className="block truncate font-medium leading-tight">{person.handle}</span>
                <span className="caption block truncate text-ink-soft">
                  {person.specialty} · {person.location}
                </span>
              </Link>
              <button
                type="button"
                className="nav-link label"
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
