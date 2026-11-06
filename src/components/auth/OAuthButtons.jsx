import { useState } from 'react'

const PROVIDERS = ['Google', 'Apple']

/**
 * Google and Apple sign-in need OAuth credentials and a backend callback, which this demo does not
 * have. The buttons say so instead of faking a sign-in. Text only: the providers' logos have
 * brand-usage rules that should be followed when real sign-in is wired up.
 */
export default function OAuthButtons({ verb = 'Continue' }) {
  const [notice, setNotice] = useState('')

  return (
    <div>
      <div className="flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-hairline" />
        <span className="label text-ink-soft">or</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <div className="mt-4 grid gap-3">
        {PROVIDERS.map((provider) => (
          <button
            key={provider}
            type="button"
            className="btn btn-quiet w-full"
            onClick={() =>
              setNotice(`${provider} sign-in isn’t connected in this demo. It needs OAuth credentials from ${provider}.`)
            }
          >
            {verb} with {provider}
          </button>
        ))}
      </div>

      <p className="float-msg" data-tone="hint" aria-live="polite">
        {notice || ' '}
      </p>
    </div>
  )
}
