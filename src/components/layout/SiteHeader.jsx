import { Link, NavLink } from 'react-router-dom'
import { navFor } from '../../config/navigation'
import { site } from '../../config/site'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import ThemeToggle from './ThemeToggle'

/**
 * The header adapts to the signed-in role: each role gets only the destinations it can use. Signing
 * out (or in) is always on screen, at every width. Booking lives on each photographer's page, not here.
 */
export default function SiteHeader() {
  const { status, user, logout } = useAuth()
  const { unreadTotal } = useChat()
  const signedIn = status === 'authenticated'
  const role = signedIn ? user.role : null
  const items = navFor(role, { handle: signedIn ? user.handle : site.featuredHandle })

  // Small screens show only the role's home; medium screens add two more; wide screens show all.
  const visibility = (index) => (index === 0 ? '' : index < 3 ? 'hidden sm:inline-block' : 'hidden lg:inline-block')

  return (
    <header className="sticky top-0 z-30 bg-paper">
      <div className="wrap flex h-12 items-center justify-between gap-4">
        <Link to="/" className="font-display text-sm uppercase leading-none tracking-[0.32em]">
          {site.name}
        </Link>

        <nav aria-label="Primary" className="label flex items-center gap-4">
          {items.map((item, i) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={`nav-link ${visibility(i)}`}>
              {item.label}
              {item.badge === 'unread' && unreadTotal > 0 && (
                <span className="data ml-1.5 font-medium text-ink" aria-label={`${unreadTotal} unread`}>
                  {unreadTotal}
                </span>
              )}
            </NavLink>
          ))}

          {signedIn ? (
            <>
              <NavLink to="/settings" className="nav-link hidden lg:inline-block">
                Settings
              </NavLink>
              <button type="button" className="nav-link" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/auth/login" className="nav-link">
              Sign in / Join
            </NavLink>
          )}

          <ThemeToggle className="hidden lg:inline-block" />
        </nav>
      </div>
    </header>
  )
}
