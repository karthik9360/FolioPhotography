import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import PhotoViewer from '../gallery/PhotoViewer'
import BookingDrawer from '../booking/BookingDrawer'
import CrossfadeOutlet from '../ui/CrossfadeOutlet'
import { useAuth } from '../../context/AuthContext'
import { useCreativeHub } from '../../context/CreativeHubContext'

const KNOWN = new Set(['feed', 'explore', 'post', 'upload', 'messages', 'settings'])

/** Which workspace a path belongs to. A change of workspace cross-fades; moving within one does not. */
export function workspaceOf(pathname) {
  const [first = '', second = ''] = pathname.split('/').filter(Boolean)
  if (first === 'studio') return second ? `studio/${second}` : 'studio'
  if (first === 'client') return 'client'
  if (first === '') return 'home'
  return KNOWN.has(first) ? first : 'profile'
}

export default function AppShell() {
  const { pathname, search } = useLocation()
  const { user } = useAuth()
  const { remember } = useCreativeHub()
  const userId = user?.id

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Remember where this identity was, so switching role and back returns them to the same page.
  // The render in which the identity changes still shows the previous identity's page, so it is
  // skipped: that page must not be filed under the new identity.
  const lastUser = useRef(userId)
  useEffect(() => {
    if (lastUser.current !== userId) {
      lastUser.current = userId
      return
    }
    if (userId) remember('lastPath', pathname + search)
  }, [userId, pathname, search, remember])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
      >
        Skip to content
      </a>
      <SiteHeader />
      <CrossfadeOutlet className="workspace-stage" layerClass="workspace-layer" outMs={130} layerKey={workspaceOf} />
      <SiteFooter />
      <PhotoViewer />
      <BookingDrawer />
    </>
  )
}
