import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocial } from '../context/SocialContext'
import { useStudioPipeline } from '../context/StudioContext'
import { useUserTenant } from '../context/TenantContext'
import { formatCount } from '../data/profile'
import { formatDate, formatINR } from '../lib/money'
import { profilePath } from '../lib/routes'

const rowClass = 'flex items-baseline justify-between gap-4 border-b border-hairline py-3'

/** The photographer's studio: campaigns and proofing activity, private analytics, and the tools. */
export function PhotographerDashboardPage() {
  const { user, logout } = useAuth()
  const { profileFor, postsAll, photoById } = useUserTenant()
  const { likeCount, commentsFor } = useSocial()
  const { campaigns, proofsFor, summary, deliveries, deliverFinalCampaign } = useStudioPipeline()

  const profile = profileFor(user.handle)
  const myPosts = postsAll.filter((p) => p.userHandle === user.handle)
  const ranked = [...myPosts].sort((a, b) => likeCount(b) - likeCount(a)).slice(0, 3)
  const likes = myPosts.reduce((n, p) => n + likeCount(p), 0)
  const comments = myPosts.reduce((n, p) => n + commentsFor(p.id).length, 0)

  const analytics = [
    ['Followers', formatCount(profile?.followers ?? 0)],
    ['Photographs', formatCount(profile?.photoIds.length ?? 0)],
    ['Posts', formatCount(myPosts.length)],
    ['Likes received', formatCount(likes)],
    ['Comments received', formatCount(comments)],
  ]

  return (
    <main id="main" className="wrap pb-4 pt-5 md:pt-6">
      <h1 className="display">Studio</h1>
      <p className="caption mt-4 text-ink-soft">
        Signed in as {user.name} (@{user.handle}).
      </p>

      <section className="mt-6" aria-labelledby="campaigns-title">
        <h2 id="campaigns-title" className="headline">
          Campaigns
        </h2>
        <ul className="mt-4 max-w-[48rem] border-t border-hairline">
          {campaigns.map((campaign) => {
            const proofs = proofsFor(campaign.id)
            const approved = proofs.filter((p) => p.status === 'approved').length
            const notes = proofs.reduce((n, p) => n + p.notes.length, 0)
            const delivery = deliveries[campaign.id]
            const generating = delivery?.status === 'generating'
            return (
              <li key={campaign.id} className="border-b border-hairline py-4">
                <p className="font-medium">
                  {campaign.title} <span className="font-normal text-ink-soft">· {campaign.clientName}</span>
                </p>
                <p className="caption mt-1 text-ink-soft">
                  {proofs.length > 0
                    ? `${approved} of ${proofs.length} proofs approved · ${notes} ${notes === 1 ? 'note' : 'notes'} · `
                    : ''}
                  {formatINR(summary(campaign.id).outstanding)} outstanding
                </p>
                {proofs.length > 0 && (
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      type="button"
                      className="btn btn-quiet"
                      disabled={approved === 0 || generating}
                      aria-busy={generating}
                      onClick={() => deliverFinalCampaign(campaign.id)}
                    >
                      {generating ? `Delivering ${Math.round(delivery.progress * 100)}%` : 'Deliver campaign'}
                    </button>
                    {delivery?.status === 'delivered' && (
                      <span className="caption text-ink-soft" role="status">
                        Delivered {formatDate(delivery.deliveredAt)} · {delivery.photoIds.length} files
                      </span>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-6" aria-labelledby="analytics-title">
        <h2 id="analytics-title" className="headline">
          Analytics
        </h2>
        <p className="caption mt-2 text-ink-soft">Private to you. Computed from this session’s data, not real analytics.</p>
        <dl className="mt-4 max-w-[34rem] border-t border-hairline">
          {analytics.map(([label, value]) => (
            <div key={label} className={rowClass}>
              <dt className="text-ink-soft">{label}</dt>
              <dd className="font-medium tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {ranked.length > 0 && (
          <>
            <h3 className="label mt-5 text-ink-soft">Most-liked posts</h3>
            <ol className="mt-2 max-w-[34rem] border-t border-hairline">
              {ranked.map((post) => {
                const cover = photoById(post.photoIds[0])
                return (
                  <li key={post.id} className="flex items-center gap-4 border-b border-hairline py-3">
                    <img src={cover.thumb} alt="" className="size-14 flex-none object-cover" />
                    <p className="line-clamp-2 min-w-0 flex-1 text-xs">{post.caption || cover.title}</p>
                    <p className="font-medium tabular-nums">{formatCount(likeCount(post))}</p>
                  </li>
                )
              })}
            </ol>
          </>
        )}
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/upload" className="btn btn-primary">
          Upload work
        </Link>
        <Link to="/studio/curate" className="btn btn-quiet">
          Curate
        </Link>
        <Link to="/studio/billing" className="btn btn-quiet">
          Billing
        </Link>
        <Link to="/messages" className="btn btn-quiet">
          Messages
        </Link>
        {profile && (
          <Link to={profilePath(profile.handle)} className="btn btn-quiet">
            Public profile
          </Link>
        )}
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
