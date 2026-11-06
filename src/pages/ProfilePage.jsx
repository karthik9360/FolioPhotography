import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProfileHeader from '../components/profile/ProfileHeader'
import ProfileTabs, { panelId, tabId } from '../components/profile/ProfileTabs'
import SeriesList from '../components/profile/SeriesList'
import PhotoTile from '../components/gallery/PhotoTile'
import NotFoundPage from './NotFoundPage'
import { useAuth } from '../context/AuthContext'
import { useSocial } from '../context/SocialContext'
import { useUserTenant } from '../context/TenantContext'
import { useViewer } from '../context/ViewerContext'

/** A profile at /:username for any user: seeded photographers and everyone who registers. */
export default function ProfilePage() {
  const { username } = useParams()
  const tenant = useUserTenant()
  const { user: me } = useAuth()
  const { isFollowing } = useSocial()
  const { openPhoto } = useViewer()
  const [tab, setTab] = useState('grid')

  const profile = tenant.profileFor(username)
  if (!profile) return <NotFoundPage />

  const isOwn = me?.handle === username
  const locked = profile.isPrivate && !isOwn && !isFollowing(username)
  const items = tenant.photosFor(username)
  const ids = items.map((p) => p.id)

  return (
    <main id="main">
      <ProfileHeader profile={profile} isOwn={isOwn} />

      <div className="wrap mt-14 md:mt-20">
        {locked ? (
          <div className="border-t border-hairline py-16">
            <h2 className="headline">This account is private.</h2>
            <p className="measure mt-4 text-ink-soft">Follow {profile.name} to see their photographs and posts.</p>
          </div>
        ) : (
          <>
            <ProfileTabs value={tab} onChange={setTab} />

            <div role="tabpanel" id={panelId('grid')} aria-labelledby={tabId('grid')} hidden={tab !== 'grid'} className="pt-8 md:pt-10">
              {tab === 'grid' &&
                (items.length === 0 ? (
                  <div className="py-16">
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
                  <ul className="grid grid-cols-3 gap-[var(--gutter)]">
                    {items.map((photo, i) => (
                      <li key={photo.id}>
                        <PhotoTile
                          photo={photo}
                          index={i}
                          variant="grid"
                          showCaption={false}
                          onOpen={(id) => openPhoto(id, ids)}
                        />
                      </li>
                    ))}
                  </ul>
                ))}
            </div>

            <div role="tabpanel" id={panelId('series')} aria-labelledby={tabId('series')} hidden={tab !== 'series'} className="pt-4 md:pt-6">
              {tab === 'series' && <SeriesList series={profile.series} />}
            </div>

            <div role="tabpanel" id={panelId('tagged')} aria-labelledby={tabId('tagged')} hidden={tab !== 'tagged'}>
              {tab === 'tagged' && (
                <div className="py-20 md:py-32">
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
