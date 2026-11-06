import { profilePath } from '../lib/routes'

/*
 * The navigation each role sees. `primary` items stay in the header on wide screens; `home` is the
 * item shown on small screens. A role only gets destinations it can actually use:
 *  - creator:  the studio tools, plus the public feed and Explore
 *  - client:   the Campaign Review Board and Billing; no public feed, no Book button
 *  - follower: the feed and Explore
 *  - anonymous: the public pages
 */
export function navFor(role, { handle } = {}) {
  const profile = { to: profilePath(handle), label: 'Profile', end: true }
  switch (role) {
    case 'creator':
      return [
        { to: '/studio', label: 'Studio', end: true, home: true },
        { to: '/upload', label: 'Upload' },
        { to: '/studio/curate', label: 'Curate' },
        { to: '/studio/billing', label: 'Billing' },
        { to: '/messages', label: 'Messages', badge: 'unread' },
        { to: '/feed', label: 'Feed' },
        { to: '/explore', label: 'Explore' },
        profile,
      ]
    case 'client':
      return [
        { to: '/client/dashboard', label: 'Review', home: true },
        { to: '/studio/billing', label: 'Billing' },
        { to: '/messages', label: 'Messages', badge: 'unread' },
      ]
    case 'follower':
      return [
        { to: '/feed', label: 'Feed', home: true },
        { to: '/explore', label: 'Explore' },
        { to: '/messages', label: 'Messages', badge: 'unread' },
        profile,
      ]
    default:
      return [
        { to: '/feed', label: 'Feed', home: true },
        { to: '/explore', label: 'Explore' },
        profile,
      ]
  }
}

/** Only visitors and followers get the "Book a shoot" button; creators take bookings, clients have campaigns. */
export const canBook = (role) => !role || role === 'follower'
