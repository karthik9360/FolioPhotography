import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import LookbookGrid from '../components/gallery/LookbookGrid'
import NotFoundPage from './NotFoundPage'
import { useAuth } from '../context/AuthContext'
import { useSocial } from '../context/SocialContext'
import { useUserTenant } from '../context/TenantContext'
import { modelsFor } from '../data/models'
import { profilePath } from '../lib/routes'

/**
 * /:username/feed: one photographer's lookbook, their posts and 3D nodes in a single asymmetric
 * stream, newest first. Open to every role (a client reviews a photographer's work here); a private
 * account stays gated for anyone who does not follow it.
 */
export default function ProfileFeedPage() {
  const { username } = useParams()
  const tenant = useUserTenant()
  const { user: me } = useAuth()
  const { isFollowing } = useSocial()

  const profile = tenant.profileFor(username)
  const isOwn = me?.handle === username
  const locked = Boolean(profile?.isPrivate) && !isOwn && !isFollowing(username)

  const entries = tenant.postsAll
  const items = useMemo(() => {
    const posts = entries
      .filter((post) => post.userHandle === username)
      .map((post) => ({ photo: tenant.photoById(post.photoIds[0]), post, to: `/post/${post.id}`, frames: post.photoIds.length, at: post.createdAt }))
    const nodes = modelsFor(username).map((model) => ({ photo: model, model, at: model.createdAt }))
    return [...posts, ...nodes].sort((a, b) => b.at - a.at)
  }, [entries, tenant, username])

  if (!profile) return <NotFoundPage />

  return (
    <main id="main" className="wrap pt-5 md:pt-8">
      <h1 className="display">{profile.name}</h1>
      <p className="caption mt-4 text-ink-soft">
        <Link to={profilePath(profile.handle)} className="link">
          @{profile.handle}
        </Link>
        {profile.location && ` · ${profile.location}`} · Lookbook feed
      </p>

      <div className="mt-6 md:mt-8">
        {locked ? (
          <div className="py-6">
            <h2 className="headline">This account is private.</h2>
            <p className="measure mt-4 text-ink-soft">Follow {profile.name} to see their lookbook.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-6">
            <h2 className="headline">Nothing here yet.</h2>
            <p className="measure mt-4 text-ink-soft">{profile.name} has not posted yet.</p>
          </div>
        ) : (
          <LookbookGrid items={items} label={`Lookbook feed by ${profile.name}`} />
        )}
      </div>
    </main>
  )
}
