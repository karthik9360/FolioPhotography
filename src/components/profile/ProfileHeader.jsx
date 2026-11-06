import { Check } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { canBook } from '../../config/navigation'
import { useAuth } from '../../context/AuthContext'
import { useBooking } from '../../context/BookingContext'
import { useChat } from '../../context/ChatContext'
import { lookbookPath } from '../../lib/routes'
import { useSocial } from '../../context/SocialContext'
import { formatCount } from '../../data/profile'

/** The profile masthead: a square monogram plate, the name in display capitals, and the facts as type. */
export default function ProfileHeader({ profile, isOwn }) {
  const { isFollowing, toggleFollow } = useSocial()
  const { openBooking } = useBooking()
  const { user } = useAuth()
  const { startThread } = useChat()
  const navigate = useNavigate()
  const location = useLocation()
  const following = isFollowing(profile.handle)
  const followers = profile.followers + (following ? 1 : 0)

  function message() {
    if (!user) {
      navigate('/auth/login', { state: { from: location.pathname } })
      return
    }
    navigate(`/messages/${startThread(profile.handle)}`)
  }

  const facts = [
    `${formatCount(profile.photoIds.length)} photographs`,
    `${formatCount(followers)} followers`,
    `${formatCount(profile.following)} following`,
  ]

  return (
    <section aria-labelledby="profile-name" className="wrap pt-5 md:pt-8">
      <div className="max-w-[60rem]">
        <h1 id="profile-name" className="display">
          {profile.name}
        </h1>
        <p className="caption mt-4 text-ink-soft">
          @{profile.handle}
          {profile.location && ` · ${profile.location}`}
        </p>
        <p className="label mt-4 text-ink-soft">{facts.join(' · ')}</p>

        {profile.bio && <p className="measure mt-4 text-xs">{profile.bio}</p>}
        {profile.categories.length > 0 && <p className="label mt-4 text-ink-soft">{profile.categories.join(' · ')}</p>}
        <p className="mt-4">
          <Link to={lookbookPath(profile.handle)} className="link">
            Open the lookbook feed
          </Link>
        </p>

          <div className="mt-4 flex flex-wrap gap-3">
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
                {/* Clients are here to work, not to follow: no feed-tracking actions for them. */}
                {user?.role !== 'client' && (
                  <button
                    type="button"
                    className="btn btn-quiet"
                    aria-pressed={following}
                    onClick={() => toggleFollow(profile.handle)}
                  >
                    {following && <Check size={14} strokeWidth={1.5} aria-hidden="true" />}
                    Follow
                  </button>
                )}
                <button type="button" className="btn btn-quiet" onClick={message}>
                  Message
                </button>
                {canBook(user?.role) && (
                  <button type="button" className="btn btn-primary" onClick={openBooking}>
                    Book a shoot
                  </button>
                )}
              </>
            )}
          </div>

          {profile.isSeeded && <p className="caption mt-4 text-ink-soft">Demonstration profile. Not a real person.</p>}
      </div>
    </section>
  )
}
