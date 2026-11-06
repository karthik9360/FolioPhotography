import { Check } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useBooking } from '../../context/BookingContext'
import { useChat } from '../../context/ChatContext'
import { useSocial } from '../../context/SocialContext'
import { formatCount } from '../../data/profile'

/** Instagram/Facebook-style profile header, typeset as an editorial masthead. */
export default function ProfileHeader({ profile, isOwn }) {
  const { isFollowing, toggleFollow } = useSocial()
  const { openBooking } = useBooking()
  const { user } = useAuth()
  const { startThread } = useChat()
  const navigate = useNavigate()
  const location = useLocation()
  const following = isFollowing(profile.handle)
  const followers = profile.followers + (following ? 1 : 0)

  const stats = [
    [profile.photoIds.length, 'photographs'],
    [followers, 'followers'],
    [profile.following, 'following'],
  ]

  function message() {
    if (!user) {
      navigate('/auth/login', { state: { from: location.pathname } })
      return
    }
    navigate(`/messages/${startThread(profile.handle)}`)
  }

  return (
    <section aria-labelledby="profile-name" className="wrap pt-12 md:pt-20">
      <div className="grid gap-8 md:grid-cols-12 md:gap-x-5">
        <div className="md:col-span-3">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="size-28 rounded-full object-cover md:size-40" />
          ) : (
            <div
              aria-hidden="true"
              className="grid size-28 place-items-center rounded-full bg-ink font-display text-4xl tracking-[-0.03em] text-paper md:size-40 md:text-5xl"
            >
              {profile.initials}
            </div>
          )}
        </div>

        <div className="md:col-span-9">
          <h1 id="profile-name" className="display !text-[clamp(2.75rem,7vw,4.5rem)]">
            {profile.name}
          </h1>
          <p className="caption mt-3 text-ink-soft">
            @{profile.handle}
            {profile.location && ` · ${profile.location}`}
          </p>

          <dl className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem] sm:gap-x-10 sm:text-base">
            {stats.map(([count, label]) => (
              <div key={label} className="flex items-baseline gap-2">
                <dt className="order-2 text-ink-soft">{label}</dt>
                <dd className="order-1 font-medium tabular-nums">{formatCount(count)}</dd>
              </div>
            ))}
          </dl>

          {profile.bio && <p className="measure mt-8 text-[1.0625rem]">{profile.bio}</p>}
          {profile.categories.length > 0 && (
            <p className="label mt-4 text-ink-soft">{profile.categories.join(' · ')}</p>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            {isOwn ? (
              <>
                {user.role === 'creator' && (
                  <Link to="/upload" className="btn btn-primary">
                    Upload
                  </Link>
                )}
                <Link to="/settings/profile" className="btn btn-quiet">
                  Edit profile
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-quiet"
                  aria-pressed={following}
                  onClick={() => toggleFollow(profile.handle)}
                >
                  {following && <Check size={14} strokeWidth={1.5} aria-hidden="true" />}
                  Follow
                </button>
                <button type="button" className="btn btn-quiet" onClick={message}>
                  Message
                </button>
                <button type="button" className="btn btn-primary" onClick={openBooking}>
                  Book a shoot
                </button>
              </>
            )}
          </div>

          {profile.isSeeded && <p className="caption mt-6 text-ink-soft">Demonstration profile. Not a real person.</p>}
        </div>
      </div>
    </section>
  )
}
