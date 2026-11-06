import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWorkspaceState } from '../context/CreativeHubContext'
import { useSocial } from '../context/SocialContext'
import { useUserTenant } from '../context/TenantContext'
import { models } from '../data/models'
import { searchFeeds, searchPhotographers } from '../lib/indexSearch'
import { lookbookPath, profilePath } from '../lib/routes'

const MODES = [
  { id: 'photographers', label: 'Photographers', noun: 'photographers' },
  { id: 'feeds', label: 'Posts', noun: 'posts' },
]
const tabId = (id) => `index-tab-${id}`

/**
 * Explore is a search index, not a grid. It opens to one large text field and two index modes, with
 * nothing pre-loaded. Typing filters the chosen index; the filtering runs in a React transition, so
 * the field never waits on the results. Results are flat, borderless rows.
 */
export default function ExplorePage() {
  const tenant = useUserTenant()
  const { user: me } = useAuth()
  const { isFollowing } = useSocial()
  const [mode, setMode] = useWorkspaceState('explore.mode', 'photographers')
  const [query, setQuery] = useWorkspaceState('explore.query', '')
  const [applied, setApplied] = useState(query)
  const [pending, startTransition] = useTransition()
  const input = useRef(null)
  const tabs = useRef({})

  // A desktop visitor lands in the field; on a phone that would only raise the keyboard.
  useEffect(() => {
    if (window.matchMedia('(hover: hover)').matches) input.current?.focus()
  }, [])

  function onChange(event) {
    const value = event.target.value
    setQuery(value) // the field updates at once
    startTransition(() => setApplied(value)) // the results follow without blocking it
  }

  function onTabKeyDown(event) {
    const index = MODES.findIndex((m) => m.id === mode)
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % MODES.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + MODES.length) % MODES.length
    else return
    event.preventDefault()
    setMode(MODES[next].id)
    tabs.current[MODES[next].id]?.focus()
  }

  // Source rows. Private accounts stay out of the feeds index unless you may see them.
  const photographers = useMemo(() => tenant.photographerProfiles(), [tenant])
  const feedRows = useMemo(() => {
    const visible = (handle) => !tenant.isPrivate(handle) || handle === me?.handle || isFollowing(handle)
    const posts = tenant.postsAll
      .filter((post) => visible(post.userHandle))
      .map((post) => {
        const cover = tenant.photoById(post.photoIds[0])
        return {
          id: post.id,
          title: cover?.title ?? 'Untitled',
          handle: post.userHandle,
          category: cover?.category ?? '',
          series: cover?.series ?? '',
          location: post.location,
          caption: post.caption,
          thumb: cover?.thumb ?? '',
          href: `/post/${post.id}`,
          at: post.createdAt,
        }
      })
    const nodes = models
      .filter((m) => visible(m.userHandle))
      .map((m) => ({ ...m, handle: m.userHandle, thumb: '', href: lookbookPath(m.userHandle), at: m.createdAt }))
    return [...posts, ...nodes].sort((a, b) => b.at - a.at)
  }, [tenant, me?.handle, isFollowing])

  const results = useMemo(
    () => (mode === 'photographers' ? searchPhotographers(photographers, applied) : searchFeeds(feedRows, applied)),
    [mode, applied, photographers, feedRows],
  )
  const searching = applied.trim() !== ''
  const noun = MODES.find((m) => m.id === mode).noun

  return (
    <main id="main" className="wrap pt-6 md:pt-8">
      <h1 className="sr-only">Explore</h1>

      <div className="index-field">
        <label htmlFor="explore-search" className="sr-only">
          Search
        </label>
        <input
          ref={input}
          id="explore-search"
          type="search"
          className="index-input"
          placeholder="Search"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={query}
          onChange={onChange}
        />
      </div>

      <div role="tablist" aria-label="Search in" className="label mt-4 flex flex-wrap gap-x-10 gap-y-2" onKeyDown={onTabKeyDown}>
        {MODES.map((m) => (
          <button
            key={m.id}
            ref={(el) => {
              tabs.current[m.id] = el
            }}
            type="button"
            role="tab"
            id={tabId(m.id)}
            aria-selected={mode === m.id}
            aria-controls="index-panel"
            tabIndex={mode === m.id ? 0 : -1}
            className="nav-link"
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <section
        id="index-panel"
        role="tabpanel"
        aria-labelledby={tabId(mode)}
        aria-busy={pending}
        data-pending={pending}
        className="index-results mt-6 md:mt-8"
      >
        <p className="caption min-h-5 text-ink-soft" aria-live="polite">
          {!searching
            ? `Type a ${mode === 'photographers' ? 'username, name, place or word from a bio' : 'title, username, category or place'} to search ${noun}.`
            : results.length === 0
              ? `No ${noun} match “${applied.trim()}”.`
              : `${results.length} ${results.length === 1 ? 'result' : 'results'}`}
        </p>

        {results.length > 0 && mode === 'photographers' && (
          <>
            <div aria-hidden="true" className="index-row index-row--people index-head label mt-4 hidden text-ink-soft md:grid">
              <span>Username</span>
              <span>Name</span>
              <span>Bio</span>
              <span>Location</span>
              <span />
            </div>
            <ul className="index-list mt-4 md:mt-0" aria-label="Photographers">
              {results.map((person) => {
                const cover = tenant.photosFor(person.handle)[0]
                return (
                  <li key={person.handle}>
                    <Link to={profilePath(person.handle)} className="index-row index-row--people">
                      <span className="font-medium">{person.handle}</span>
                      <span>{person.name}</span>
                      <span className="line-clamp-2 text-ink-soft">{person.bio}</span>
                      <span className="text-ink-soft">{person.location}</span>
                      <span className="index-reveal" aria-hidden="true">
                        {cover ? (
                          <img src={cover.thumb} alt="" width={44} height={55} className="h-[55px] w-[44px] object-cover" />
                        ) : (
                          <ArrowUpRight size={18} strokeWidth={1.25} />
                        )}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {results.length > 0 && mode === 'feeds' && (
          <>
            <div aria-hidden="true" className="index-row index-row--feeds index-head label mt-4 hidden text-ink-soft md:grid">
              <span>Title</span>
              <span>By</span>
              <span>Category</span>
              <span />
              <span />
            </div>
            <ul className="index-list mt-4 md:mt-0" aria-label="Feeds">
              {results.map((row) => (
                <li key={row.id}>
                  <Link to={row.href} className="index-row index-row--feeds">
                    <span className="font-display text-sm leading-tight tracking-[0.01em]">{row.title}</span>
                    <span>@{row.handle}</span>
                    <span className="text-ink-soft">{row.category}</span>
                    <span className="index-thumb" aria-hidden="true">
                      {row.thumb ? (
                        <img src={row.thumb} alt="" width={40} height={50} className="h-[50px] w-[40px] object-cover" />
                      ) : (
                        <span className="data grid h-[50px] w-[40px] place-items-center bg-photo-wash text-ink">3D</span>
                      )}
                    </span>
                    <span className="index-reveal" aria-hidden="true">
                      <ArrowUpRight size={18} strokeWidth={1.25} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  )
}
