import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import PhotoViewer from '../gallery/PhotoViewer'
import BookingDrawer from '../booking/BookingDrawer'

export default function AppShell() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
      >
        Skip to content
      </a>
      <SiteHeader />
      <Outlet />
      <SiteFooter />
      <PhotoViewer />
      <BookingDrawer />
    </>
  )
}
