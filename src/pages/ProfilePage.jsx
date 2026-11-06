import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProfileHeader from '../components/profile/ProfileHeader'
import ProfileTabs, { panelId, tabId } from '../components/profile/ProfileTabs'
import SeriesList from '../components/profile/SeriesList'
import LookbookGrid from '../components/gallery/LookbookGrid'
import NotFoundPage from './NotFoundPage'
import { useAuth } from '../context/AuthContext'
import { useSocial } from '../context/SocialContext'
import { useUserTenant } from '../context/TenantContext'

/** A profile at /:username for any user: seeded photographers and everyone who registers. */
export default function ProfilePage() {
  const { username } = useParams()
  const tenant = useUserTenant()
  const { user: me } = useAuth()
  const { isFollowing } = useSocial()
  const [tab, setTab] = useState('grid')

  const profile = tenant.profileFor(username)
  if (!profile) return <NotFoundPage />

  const isOwn = me?.handle === username
  const locked = profile.isPrivate && !isOwn && !isFollowing(username)
  const items = tenant.photosFor(username).map((photo) => ({ photo }))

  return (
    <main id="main">
      <ProfileHeader profile={profile} isOwn={isOwn} />

      <div className="wrap mt-5 md:mt-6">
        {locked ? (
          <div className="py-6">
            <h2 className="headline">This account is private.</h2>
            <p className="measure mt-4 text-ink-soft">Follow {profile.name} to see their photographs and posts.</p>
          </div>
        ) : (
          <>
            <ProfileTabs value={tab} onChange={setTab} />

            <div role="tabpanel" id={panelId('grid')} aria-labelledby={tabId('grid')} hidden={tab !== 'grid'} className="pt-4 md:pt-4">
              {tab === 'grid' &&
                (items.length === 0 ? (
                  <div className="py-6">
                    <h2 className="headline">No photographs yet.</h2>
                    <p className="measure mt-4 text-ink-soft">
                      {isOwn && me.role === 'creator' ? (
                        <>
                          <Link to="/upload" className="link text-ink">Upload your first photograph</Link> and it will appear here.
                        </>
                      ) : (
                        'Check back soon.'
                      )}
                    </p>
                  </div>
                ) : (
                  <LookbookGrid items={items} label={`Photographs by ${profile.name}`} />
                ))}
            </div>

            <div role="tabpanel" id={panelId('series')} aria-labelledby={tabId('series')} hidden={tab !== 'series'} className="pt-4 md:pt-4">
              {tab === 'series' && <SeriesList series={profile.series} />}
            </div>

            <div role="tabpanel" id={panelId('tagged')} aria-labelledby={tabId('tagged')} hidden={tab !== 'tagged'}>
              {tab === 'tagged' && (
                <div className="py-6 md:py-8">
                  <h2 className="headline">Nothing tagged yet.</h2>
                  <p className="measure mt-4 text-ink-soft">
                    Photographs that other people tag {profile.name} in will appear here.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
