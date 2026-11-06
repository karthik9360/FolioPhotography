import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FloatingField from '../../components/auth/FloatingField'
import { AuthError, useAuth } from '../../context/AuthContext'
import { normalizeHandle, rules } from '../../lib/validation'
import { site } from '../../config/site'

const STEPS = [
  { title: 'Create your account', lead: 'Start with the basics.', fields: ['name', 'email', 'password'] },
  { title: 'Choose your handle', lead: 'It’s how people find and tag you.', fields: ['handle'] },
  { title: 'Choose your role', lead: `How you’ll use ${site.name}. It sets where you land after signing in.`, fields: ['role'] },
]

const ROLES = [
  { id: 'creator', name: 'Photographer', note: 'Publish your work, build a following, and receive booking enquiries.' },
  { id: 'client', name: 'Client', note: 'Review proofs from your photographer and book shoots.' },
  { id: 'follower', name: 'Follower', note: 'Follow photographers, like and save work, and join the conversation.' },
]

const IDLE = { status: 'idle', for: '' }

export default function RegisterPage() {
  const { register, checkHandle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [values, setValues] = useState({ name: '', email: '', password: '', handle: '', role: '' })
  const [touched, setTouched] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [nudges, setNudges] = useState({})
  const [handleState, setHandleState] = useState(IDLE)
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const headingRef = useRef(null)
  const fieldRefs = useRef({})
  const firstRender = useRef(true)

  const handle = normalizeHandle(values.handle)
  const handleTaken = handleState.status === 'taken' && handleState.for === handle

  const errors = {
    name: rules.name(values.name),
    email: serverErrors.email || rules.email(values.email),
    password: rules.password(values.password),
    handle: rules.handle(values.handle) || (handleTaken ? 'That handle is taken. Try another.' : ''),
    role: rules.role(values.role),
  }
  // Errors appear once a field has been left. A taken handle is the exception: it is the result of
  // a live check, so it shows the moment it comes back.
  const shown = (field) => (touched[field] || (field === 'handle' && handleTaken) ? errors[field] : '')

  // Move focus to the new step's heading so screen-reader users hear where they are.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus({ preventScroll: true })
  }, [step])

  // Debounced handle availability check while the handle step is open.
  useEffect(() => {
    if (step !== 1 || rules.handle(handle)) {
      setHandleState(IDLE)
      return undefined
    }
    setHandleState({ status: 'checking', for: handle })
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const { available } = await checkHandle(handle)
        if (!cancelled) setHandleState({ status: available ? 'available' : 'taken', for: handle })
      } catch {
        if (!cancelled) setHandleState(IDLE)
      }
    }, 350)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [handle, step, checkHandle])

  const set = (field) => (event) => {
    setValues((v) => ({ ...v, [field]: event.target.value }))
    setServerErrors((e) => (e[field] ? { ...e, [field]: '' } : e))
    setFormError('')
  }
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }))
  const bump = (fields) =>
    setNudges((n) => ({ ...n, ...Object.fromEntries(fields.map((f) => [f, (n[f] ?? 0) + 1])) }))
  const goTo = (next) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  async function submitAccount() {
    setBusy(true)
    setFormError('')
    try {
      await register(values)
      navigate('/auth/verify', { state: location.state })
    } catch (error) {
      if (error instanceof AuthError && error.field === 'email') {
        setServerErrors({ email: error.message })
        setTouched((t) => ({ ...t, email: true }))
        goTo(0)
      } else if (error instanceof AuthError && error.field === 'handle') {
        setHandleState({ status: 'taken', for: handle })
        setTouched((t) => ({ ...t, handle: true }))
        goTo(1)
      } else {
        setFormError(error instanceof AuthError ? error.message : 'Something went wrong. Try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (busy) return
    const { fields } = STEPS[step]
    setTouched((t) => ({ ...t, ...Object.fromEntries(fields.map((f) => [f, true])) }))

    const invalid = fields.filter((f) => errors[f])
    if (invalid.length) {
      bump(invalid)
      fieldRefs.current[invalid[0]]?.focus()
      return
    }

    if (step === 1 && handleState.status !== 'available') {
      setBusy(true)
      try {
        const { available } = await checkHandle(handle)
        if (!available) {
          setHandleState({ status: 'taken', for: handle })
          bump(['handle'])
          return
        }
      } finally {
        setBusy(false)
      }
    }

    if (step < STEPS.length - 1) goTo(step + 1)
    else await submitAccount()
  }

  const current = STEPS[step]
  const handleStatus =
    handleState.status === 'checking'
      ? 'Checking availability…'
      : handleState.status === 'available' && handleState.for === handle
        ? `@${handle} is available.`
        : ''

  return (
    <section aria-labelledby="register-title">
      <h1 id="register-title" ref={headingRef} tabIndex={-1} className="auth-title">
        {current.title}
      </h1>
      <p className="measure mt-4 text-[1.0625rem] text-ink-soft">{current.lead}</p>

      <div className="mt-8 flex items-center gap-6">
        <div className="flex flex-1 gap-2" role="img" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <span
              key={s.title}
              className="step-seg"
              data-state={i < step ? 'done' : i === step ? 'current' : 'todo'}
            />
          ))}
        </div>
        <p className="caption text-ink-soft" aria-hidden="true">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-8">
        <div key={step} className="step-in" style={{ '--dir': dir }}>
          {step === 0 && (
            <>
              <FloatingField
                label="Full name"
                name="name"
                autoComplete="name"
                inputRef={(el) => (fieldRefs.current.name = el)}
                value={values.name}
                onChange={set('name')}
                onBlur={blur('name')}
                error={shown('name')}
                nudge={nudges.name}
              />
              <div className="mt-2">
                <FloatingField
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputRef={(el) => (fieldRefs.current.email = el)}
                  value={values.email}
                  onChange={set('email')}
                  onBlur={blur('email')}
                  error={shown('email')}
                  nudge={nudges.email}
                />
              </div>
              <div className="mt-2">
                <FloatingField
                  label="Password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  inputRef={(el) => (fieldRefs.current.password = el)}
                  value={values.password}
                  onChange={set('password')}
                  onBlur={blur('password')}
                  error={shown('password')}
                  hint="At least 10 characters, with a letter and a number."
                  nudge={nudges.password}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <FloatingField
              label="Handle"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              inputRef={(el) => (fieldRefs.current.handle = el)}
              value={values.handle}
              onChange={set('handle')}
              onBlur={blur('handle')}
              error={shown('handle')}
              status={handleStatus}
              hint="Letters, numbers, dots, hyphens and underscores."
              nudge={nudges.handle}
            />
          )}

          {step === 2 && (
            <fieldset aria-describedby="role-msg">
              <legend className="sr-only">Your role</legend>
              <div className="border-t border-hairline">
                {ROLES.map((role) => (
                  <label
                    key={role.id}
                    className="flex cursor-pointer items-start gap-4 border-b border-hairline py-5"
                  >
                    <input
                      type="radio"
                      name="role"
                      className="radio mt-1"
                      value={role.id}
                      checked={values.role === role.id}
                      onChange={() => {
                        setValues((v) => ({ ...v, role: role.id }))
                        setTouched((t) => ({ ...t, role: true }))
                      }}
                    />
                    <span>
                      <span className="block text-[1.0625rem] font-medium">{role.name}</span>
                      <span className="caption text-ink-soft">{role.note}</span>
                    </span>
                  </label>
                ))}
              </div>
              <p id="role-msg" className="float-msg" data-tone={shown('role') ? 'error' : 'hint'} aria-live="polite">
                {shown('role') || ' '}
              </p>
            </fieldset>
          )}
        </div>

        <p className="float-msg" data-tone={formError ? 'error' : 'hint'} aria-live="polite">
          {formError || ' '}
        </p>

        <button type="submit" className="btn btn-primary btn-auth mt-2" aria-busy={busy}>
          {step < STEPS.length - 1 ? 'Continue' : busy ? 'Creating account' : 'Create account'}
        </button>

        <div className="mt-6 flex items-center justify-between gap-6">
          {step > 0 ? (
            <button type="button" className="link" onClick={() => goTo(step - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}
          <p className="text-ink-soft">
            Have an account?{' '}
            <Link to="/auth/login" state={location.state} className="link text-ink">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </section>
  )
}
