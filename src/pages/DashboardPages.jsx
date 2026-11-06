import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUserTenant } from '../context/TenantContext'
import { profilePath } from '../lib/routes'

// Role landing pages for photographers and clients. (Followers land on the public feed.)
// They say plainly what is and is not built yet.

function Frame({ title, children, actions }) {
  const { user, logout } = useAuth()
  return (
    <main id="main" className="wrap pb-10 pt-16 md:pt-24">
      <h1 className="display">{title}</h1>
      <p className="caption mt-4 text-ink-soft">
        Signed in as {user.name} (@{user.handle}).
      </p>
      <div className="measure mt-8 text-[1.0625rem] text-ink-soft">{children}</div>
      <div className="mt-10 flex flex-wrap gap-3">
        {actions}
        <Link to="/messages" className="btn btn-quiet">
          Messages
        </Link>
        <Link to="/settings" className="btn btn-quiet">
          Settings
        </Link>
        <button type="button" className="btn btn-quiet" onClick={logout}>
          Sign out
        </button>
      </div>
    </main>
  )
}

export function PhotographerDashboardPage() {
  const { user } = useAuth()
  const { profileFor } = useUserTenant()
  const profile = profileFor(user.handle)
  return (
    <Frame
      title="Studio"
      actions={
        <>
          <Link to="/upload" className="btn btn-primary">
            Upload work
          </Link>
          {profile && (
            <Link to={profilePath(profile.handle)} className="btn btn-quiet">
              View your public profile
            </Link>
          )}
        </>
      }
    >
      <p>
        This is the photographer landing page. Managing bookings and viewing activity are not built yet.
      </p>
    </Frame>
  )
}

export function ClientPortalPage() {
  return (
    <Frame title="Client portal">
      <p>Proofing galleries and your selections will appear here. They are not built yet.</p>
    </Frame>
  )
}
