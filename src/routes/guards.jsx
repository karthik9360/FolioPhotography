import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { roleHome, useAuth } from '../context/AuthContext'

/*
 * Route guards. These shape the UI only; the server must enforce access to real data.
 */

/** Signed-in users only, optionally limited to certain roles. */
export function RequireAuth({ roles }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status !== 'authenticated') {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
  }
  // Wrong role: send them to their own landing page rather than showing a dead end.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={roleHome[user.role]} replace />
  }
  return <Outlet />
}

/** Sign-in screens for signed-out users. Signed-in users go where they were headed, or home. */
export function GuestOnly() {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'authenticated') {
    const from = location.state?.from
    return <Navigate to={from && from !== '/auth/login' ? from : roleHome[user.role]} replace />
  }
  return <Outlet />
}
