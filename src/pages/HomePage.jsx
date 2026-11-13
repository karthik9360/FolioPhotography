import { useLayoutEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import HeroStage from '../components/home/HeroStage'
import LookCards from '../components/home/LookCards'
import { useLeaving } from '../components/ui/CrossfadeOutlet'
import { site } from '../config/site'
import { useStudioTheme } from '../context/StudioThemeContext'
import { useUserTenant } from '../context/TenantContext'
import { photos } from '../data/photos'

// Four frames from the demo set drift behind the lens.
const PRINT_PICKS = [2, 9, 14, 21]

/**
 * The home page for visitors: one screen, no scroll on a wide window. Big cursive titles on the left
 * and right, the lens in the middle, and two look cards that change the whole site's look. The
 * number in the badge is counted from the demo data, not written by hand.
 */
export default function HomePage() {
  const leaving = useLeaving()
  const { theme, setTheme } = useStudioTheme()
  const { postsAll, photographerProfiles } = useUserTenant()
  const switchingRef = useRef(null)

  const prints = useMemo(() => PRINT_PICKS.map((i) => photos[i % photos.length]), [])
  const people = useMemo(() => photographerProfiles().length, [photographerProfiles])

  // The hero shows the gradient at full strength, and the header floats over it. Set before paint, so
  // the header never starts in the page flow and jumps.
  useLayoutEffect(() => {
    if (leaving) return undefined
    document.documentElement.dataset.surface = 'hero'
    return () => {
      delete document.documentElement.dataset.surface
    }
  }, [leaving])

  function pick(next) {
    if (next === theme || switchingRef.current?.()) return
    setTheme(next)
  }

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-content">
        {!leaving && <HeroStage photos={prints} look={theme} switchingRef={switchingRef} />}

        <div className="hero-left">
          <h1 id="hero-title" className="hero-title">
            <span>Pure</span>
            <br />
            Light
          </h1>
          <p className="hero-desc">
            Share your best photos and videos in one clean lookbook, and let clients book you in a few taps.
          </p>
          <div className="cta-group">
            <Link to="/auth/register" className="primary-btn">
              Start sharing
              <span className="plus-icon" aria-hidden="true">
                +
              </span>
            </Link>
          </div>
          <div className="award-badge">
            <div className="award-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className="award-text">
              <span className="award-title">ON {site.name.toUpperCase()} NOW</span>
              <span className="award-subtitle">
                {people} photographers · {postsAll.length} posts
              </span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <LookCards theme={theme} onPick={pick} />
          <h2 className="hero-title side-title">
            <span>Simply</span>
            <br />
            Booked
          </h2>
        </div>
      </div>
      <p className="hero-note caption text-ink-soft">{site.demoNotice}</p>
    </section>
  )
}
