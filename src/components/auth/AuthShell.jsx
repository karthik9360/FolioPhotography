import { Link } from 'react-router-dom'
import AuthMedia from './AuthMedia'
import CrossfadeOutlet from '../ui/CrossfadeOutlet'
import { site } from '../../config/site'

/** 60/40 split on desktop: imagery left, form right. Imagery becomes a short band on small screens. */
export default function AuthShell() {
  return (
    <div className="auth-shell">
      <a
        href="#auth-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
      >
        Skip to form
      </a>
      <AuthMedia />
      <div className="auth-panel">
        <header>
          <Link to="/" className="font-display text-sm uppercase leading-none tracking-[0.32em]">
            {site.name}
          </Link>
        </header>
        <CrossfadeOutlet as="main" id="auth-main" className="auth-stage" layerClass="auth-layer" />
        <footer>
          <p className="caption measure text-ink-soft">{site.demoNotice}</p>
        </footer>
      </div>
    </div>
  )
}
