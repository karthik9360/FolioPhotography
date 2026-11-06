import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { site } from '../../config/site'
import { DEMO_IDENTITIES } from '../../config/identities'
import { roleHome, useAuth } from '../../context/AuthContext'
import { useCreativeHub } from '../../context/CreativeHubContext'

/**
 * DEMO ONLY: view the app as each of the three demo identities, without a password. Each identity
 * returns to the page it last had open (see useCreativeHub).
 * Gated by `site.demoAuth`; a real backend must not offer this.
 */
export default function RoleSwitcher() {
  const { user, switchIdentity } = useAuth()
  const { recallFor } = useCreativeHub()
  const navigate = useNavigate()
  const [busy, setBusy] = useState('')

  if (!site.demoAuth) return null

  async function pick(identity) {
    if (busy || user?.id === `u_demo_${identity.role}`) return
    setBusy(identity.role)
    // Read this before switching: return to the page that identity last had open, else their home.
    const target = recallFor(`u_demo_${identity.role}`, 'lastPath', null) ?? roleHome[identity.role]
    try {
      await switchIdentity(identity.role)
      navigate(target)
    } finally {
      setBusy('')
    }
  }

  return (
    <p className="caption text-ink-soft">
      Demo: view the app as{' '}
      {DEMO_IDENTITIES.map((identity, i) => {
        const current = user?.id === `u_demo_${identity.role}`
        return (
          <span key={identity.role}>
            {i > 0 && ' · '}
            <button
              type="button"
              className={current ? 'font-medium text-ink' : 'link'}
              aria-pressed={current}
              disabled={busy !== ''}
              onClick={() => pick(identity)}
            >
              {identity.label}
            </button>
          </span>
        )
      })}
    </p>
  )
}
