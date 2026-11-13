import { Link, NavLink } from 'react-router-dom'
import { navFor } from '../../config/navigation'
import { site } from '../../config/site'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import ThemeToggle from './ThemeToggle'

/** The Folio mark: a lens seen from the front. */
function Mark() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  )
}

/**
 * The header adapts to the signed-in role: each role gets only the destinations it can use, in a glass
 * pill. Signing out (or in) is one pill button that is always on screen, at every width. Booking
 * lives on each photographer's page, not here.
 */
export default function SiteHeader() {
  const { status, user, logout } = useAuth()
  const { unreadTotal } = useChat()
  const signedIn = status === 'authenticated'
  const role = signedIn ? user.role : null
  const items = navFor(role, { handle: signedIn ? user.handle : site.featuredHandle })

  // Small screens show only the role's home; medium screens add two more; wide screens show all.
  const visibility = (index) => (index === 0 ? '' : index < 3 ? 'hidden sm:inline-flex' : 'hidden lg:inline-flex')

  return (
    <header className="site-header">
      <div className="header-bar">
        <Link to="/" className="logo" aria-label={`${site.name}, home`}>
          <Mark />
          <span>{site.name}</span>
        </Link>

        <nav aria-label="Primary" className="nav-pill glass">
          {items.map((item, i) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={`nav-item ${visibility(i)}`}>
              {item.label}
              {item.badge === 'unread' && unreadTotal > 0 && (
                <span
                  className="data ml-2 rounded-full bg-paper px-1.5 py-0.5 font-medium text-ink"
                  aria-label={`${unreadTotal} unread`}
                >
                  {unreadTotal}
                </span>
              )}
            </NavLink>
          ))}
          {signedIn && (
            <NavLink to="/settings" className="nav-item hidden lg:inline-flex">
              Settings
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden lg:inline-block" />
          {signedIn ? (
            <button type="button" className="pill-btn" onClick={logout}>
              Sign out
            </button>
          ) : (
            <Link to="/auth/login" className="pill-btn">
              Sign in / Join
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
