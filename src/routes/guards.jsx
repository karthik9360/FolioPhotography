import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { roleHome, useAuth } from '../context/AuthContext'
import { useCreativeHub } from '../context/CreativeHubContext'
import { useLeaving } from '../components/ui/CrossfadeOutlet'

/*
 * Route guards. These shape the UI only; the server must enforce access to real data.
 */

/**
 * Where to send a signed-in user who landed somewhere their role cannot use: the page they last had
 * open (see useCreativeHub), unless that is the page they are on, otherwise their role's home. This
 * is what returns a photographer to /studio/curate after switching Creator -> Client -> Creator.
 */
function useResume(user) {
  const { recall } = useCreativeHub()
  const { pathname } = useLocation()
  const last = recall('lastPath', null)
  return last && last.split('?')[0] !== pathname ? last : roleHome[user.role]
}

/** Signed-in users only, optionally limited to certain roles. */
export function RequireAuth({ roles }) {
  const { status, user } = useAuth()
  const location = useLocation()
  const resume = useResume(user ?? { role: 'follower' })
  const leaving = useLeaving()

  // A view that is fading out still follows the rules (never show a page to someone who may not see
  // it), but it must not navigate: it just shows nothing instead.
  if (leaving) {
    const allowed = status === 'authenticated' && (!roles || roles.includes(user.role))
    return allowed ? <Outlet /> : null
  }
  if (status !== 'authenticated') {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
  }
  // Wrong role: send them to their own landing page rather than showing a dead end.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={resume} replace />
  }
  return <Outlet />
}

/** "/" goes to the role's home: the studio, the review board, or the feed. Visitors get the feed. */
export function RoleIndex() {
  const { status, user } = useAuth()
  if (useLeaving()) return null
  return <Navigate to={status === 'authenticated' ? roleHome[user.role] : '/feed'} replace />
}

/** Public pages that some roles are routed away from (clients never see the public feed). */
export function ForbidRoles({ roles }) {
  const { user } = useAuth()
  const resume = useResume(user ?? { role: 'follower' })
  if (useLeaving()) return user && roles.includes(user.role) ? null : <Outlet />
  if (user && roles.includes(user.role)) return <Navigate to={resume} replace />
  return <Outlet />
}

/** Sign-in screens for signed-out users. Signed-in users go where they were headed, or home. */
export function GuestOnly() {
  const { status, user } = useAuth()
  const location = useLocation()

  if (useLeaving()) return status === 'authenticated' ? null : <Outlet />
  if (status === 'authenticated') {
    const from = location.state?.from
    return <Navigate to={from && from !== '/auth/login' ? from : roleHome[user.role]} replace />
  }
  return <Outlet />
}
