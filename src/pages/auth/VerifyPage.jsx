import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import OtpInput from '../../components/auth/OtpInput'
import { AuthError, useAuth } from '../../context/AuthContext'
import { RESEND_COOLDOWN_SECONDS } from '../../lib/mockAuthApi'
import { maskEmail } from '../../lib/validation'
import { site } from '../../config/site'

const LENGTH = 6
const empty = () => Array(LENGTH).fill('')

export default function VerifyPage() {
  const { pending, verify, resend, cancelVerification, getDemoCode } = useAuth()
  const navigate = useNavigate()

  const [digits, setDigits] = useState(empty)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [nudge, setNudge] = useState(0)
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const [demoCode, setDemoCode] = useState(() => getDemoCode())

  // Count the resend cooldown down once a second.
  useEffect(() => {
    if (cooldown <= 0) return undefined
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown > 0]) // eslint-disable-line react-hooks/exhaustive-deps

  // Nothing to verify (deep link, or already finished): back to sign in.
  if (!pending) return <Navigate to="/auth/login" replace />

  async function submit(code) {
    if (busy) return
    setBusy(true)
    setError('')
    setInfo('')
    try {
      await verify(code) // on success the route guard redirects by role
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Something went wrong. Try again.')
      setNudge((n) => n + 1)
      setDigits(empty())
    } finally {
      setBusy(false)
    }
  }

  async function onResend() {
    if (cooldown > 0 || busy) return
    setError('')
    try {
      await resend()
      setDemoCode(getDemoCode())
      setDigits(empty())
      setInfo('A new code has been issued.')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Something went wrong. Try again.')
    }
  }

  function startOver() {
    cancelVerification()
    navigate('/auth/register')
  }

  const message = busy ? 'Checking your code…' : error || info
  const tone = error && !busy ? 'error' : 'hint'
  const spaced = demoCode ? `${demoCode.slice(0, 3)} ${demoCode.slice(3)}` : ''

  return (
    <section aria-labelledby="verify-title">
      <h1 id="verify-title" className="auth-title">
        Enter your code
      </h1>
      <p className="measure mt-4 text-[1.0625rem] text-ink-soft">
        {site.demoAuth ? 'Enter the 6-digit code for ' : 'We sent a 6-digit code to '}
        <span className="text-ink">{maskEmail(pending.email)}</span>.
      </p>

      <div className="mt-12">
        <OtpInput
          digits={digits}
          onChange={setDigits}
          onComplete={submit}
          invalid={Boolean(error) && !busy}
          nudge={nudge}
          disabled={busy}
          autoFocus
          focusSignal={nudge}
        />
        <p className="float-msg mt-2" data-tone={tone} aria-live="polite">
          {message || ' '}
        </p>
      </div>

      {demoCode && (
        <p className="caption mt-6 border-t border-hairline pt-4 text-ink-soft">
          Demo mode: nothing is emailed. Your code is <span className="data text-ink">{spaced}</span>.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <button
          type="button"
          className="link disabled:no-underline"
          onClick={onResend}
          aria-disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
        <button type="button" className="link text-ink-soft" onClick={startOver}>
          Use a different email
        </button>
      </div>
    </section>
  )
}
