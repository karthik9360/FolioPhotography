import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FloatingField from '../../components/auth/FloatingField'
import OAuthButtons from '../../components/auth/OAuthButtons'
import { AuthError, useAuth } from '../../context/AuthContext'
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../../lib/mockAuthApi'
import { rules } from '../../lib/validation'
import { site } from '../../config/site'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [values, setValues] = useState({ email: '', password: '', remember: false })
  const [touched, setTouched] = useState({})
  const [nudges, setNudges] = useState({ email: 0, password: 0 })
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const refs = { email: emailRef, password: passwordRef }

  const errors = {
    email: rules.email(values.email),
    password: rules.loginPassword(values.password),
  }
  // Errors appear once a field has been left, then update live as the user types.
  const shown = (field) => (touched[field] ? errors[field] : '')

  const set = (field) => (event) => {
    setValues((v) => ({ ...v, [field]: event.target.value }))
    setFormError('')
  }
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }))

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    setTouched({ email: true, password: true })

    const invalid = ['email', 'password'].filter((f) => errors[f])
    if (invalid.length) {
      setNudges((n) => ({ ...n, ...Object.fromEntries(invalid.map((f) => [f, n[f] + 1])) }))
      refs[invalid[0]].current?.focus()
      return
    }

    setBusy(true)
    setFormError('')
    try {
      const result = await login({
        email: values.email.trim(),
        password: values.password,
        remember: values.remember,
      })
      // On success the route guard redirects once the session exists.
      if (result.verificationRequired) navigate('/auth/verify', { state: location.state })
    } catch (error) {
      setFormError(error instanceof AuthError ? error.message : 'Something went wrong. Try again.')
      setNudges((n) => ({ email: n.email + 1, password: n.password + 1 }))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="login-title">
      <h1 id="login-title" className="auth-title">
        Sign in
      </h1>
      <p className="measure mt-4 text-[1.0625rem] text-ink-soft">Welcome back. Pick up where you left off.</p>

      <form onSubmit={submit} noValidate className="mt-12">
        <FloatingField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          inputRef={emailRef}
          value={values.email}
          onChange={set('email')}
          onBlur={blur('email')}
          error={shown('email')}
          nudge={nudges.email}
        />
        <div className="mt-2">
          <FloatingField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            inputRef={passwordRef}
            value={values.password}
            onChange={set('password')}
            onBlur={blur('password')}
            error={shown('password')}
            nudge={nudges.password}
          />
        </div>

        <label className="mt-4 flex w-fit cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            className="check"
            checked={values.remember}
            onChange={(e) => setValues((v) => ({ ...v, remember: e.target.checked }))}
          />
          <span>Keep me signed in on this device</span>
        </label>

        <p className="float-msg mt-4" data-tone={formError ? 'error' : 'hint'} aria-live="polite">
          {formError || ' '}
        </p>

        <button type="submit" className="btn btn-primary btn-auth mt-2" aria-busy={busy}>
          {busy ? 'Signing in' : 'Sign in'}
        </button>
      </form>

      <div className="mt-10">
        <OAuthButtons verb="Continue" />
      </div>

      <p className="mt-8 text-ink-soft">
        New here?{' '}
        <Link to="/auth/register" state={location.state} className="link text-ink">
          Create an account
        </Link>
      </p>

      {site.demoAuth && (
        <details className="caption mt-8 text-ink-soft">
          <summary className="link w-fit cursor-pointer">Demo accounts</summary>
          <ul className="mt-3 space-y-1">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email} className="flex flex-wrap items-baseline gap-x-3">
                <span className="data text-ink">{account.email}</span>
                <span>{account.role}</span>
                <button
                  type="button"
                  className="link"
                  onClick={() => setValues((v) => ({ ...v, email: account.email, password: DEMO_PASSWORD }))}
                >
                  Use
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Password for all three: <span className="data text-ink">{DEMO_PASSWORD}</span>
          </p>
        </details>
      )}
    </section>
  )
}
