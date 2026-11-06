import { Link, NavLink } from 'react-router-dom'
import { User } from 'lucide-react'
import { site } from '../../config/site'
import { roleHome, useAuth } from '../../context/AuthContext'
import { useBooking } from '../../context/BookingContext'
import { useChat } from '../../context/ChatContext'
import { useUserTenant } from '../../context/TenantContext'
import { profilePath } from '../../lib/routes'

export default function SiteHeader() {
  const { openBooking } = useBooking()
  const { status, user, logout } = useAuth()
  const { profileFor } = useUserTenant()
  const { unreadTotal } = useChat()
  const signedIn = status === 'authenticated'
  const accountPath = signedIn ? roleHome[user.role] : '/auth/login'
  // A signed-in user's Profile link is their own; everyone else sees the featured profile.
  const profileHandle = signedIn && profileFor(user.handle) ? user.handle : site.featuredHandle

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-paper">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Link to="/" className="font-display text-[1.625rem] leading-none tracking-[-0.03em]">
          {site.name}
        </Link>

        <nav aria-label="Primary" className="label flex items-center gap-4 sm:gap-6 lg:gap-9">
          {/* Narrow screens drop what the wordmark and the account icon already cover. */}
          <NavLink to="/feed" className="nav-link hidden sm:inline-block">
            Feed
          </NavLink>
          <NavLink to="/explore" className="nav-link">
            Explore
          </NavLink>
          <NavLink to={profilePath(profileHandle)} end className="nav-link hidden sm:inline-block">
            Profile
          </NavLink>

          {signedIn && (
            <>
              <NavLink to="/messages" className="nav-link hidden lg:inline-block">
                Messages
                {unreadTotal > 0 && (
                  <span className="data ml-1.5 text-signal" aria-label={`${unreadTotal} unread`}>
                    {unreadTotal}
                  </span>
                )}
              </NavLink>
              {user.role === 'creator' && (
                <NavLink to="/upload" className="nav-link hidden lg:inline-block">
                  Upload
                </NavLink>
              )}
              <NavLink to={accountPath} className="nav-link hidden lg:inline-block">
                Account
              </NavLink>
              <button type="button" className="nav-link hidden lg:inline-block" onClick={logout}>
                Sign out
              </button>
            </>
          )}
          {!signedIn && (
            <NavLink to="/auth/login" className="nav-link hidden lg:inline-block">
              Sign in
            </NavLink>
          )}

          <NavLink
            to={accountPath}
            className="icon-btn -mx-2 lg:hidden"
            aria-label={signedIn ? 'Your account' : 'Sign in'}
          >
            <User size={20} strokeWidth={1.25} aria-hidden="true" />
          </NavLink>

          <button type="button" className="btn btn-primary !px-4 sm:!px-6" onClick={openBooking}>
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline">Book a shoot</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
