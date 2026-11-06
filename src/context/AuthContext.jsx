import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { decodeJwt, isExpired } from '../lib/jwt'
import * as api from '../lib/mockAuthApi'
import { site } from '../config/site'

/*
 * useAuth: session state, JWT handling, persistence, and the sign-in / register / verify flow.
 *
 * Security notes for when a real backend replaces ../lib/mockAuthApi:
 *  - The role in the token only drives the UI. Every request must be authorised on the server.
 *  - Tokens kept in web storage are readable by any script on the page (XSS). Prefer a server-set
 *    httpOnly, Secure, SameSite cookie and keep only non-sensitive profile data here.
 *  - Add refresh-token rotation if sessions need to outlive the access token.
 */

const SESSION_KEY = 'folio.auth.session'
const PENDING_KEY = 'folio.auth.pending'
const MAX_TIMEOUT_MS = 2_000_000_000 // setTimeout overflows past ~24.8 days

const AuthContext = createContext(null)

/** Where each role lands after signing in. */
export const roleHome = {
  creator: '/studio',
  client: '/client/dashboard',
  follower: '/feed',
}

/* ---------------------------- storage helpers ---------------------------- */

function readSession() {
  for (const store of [localStorage, sessionStorage]) {
    try {
      const raw = store.getItem(SESSION_KEY)
      if (!raw) continue
      const { token } = JSON.parse(raw)
      const claims = decodeJwt(token)
      if (claims && !isExpired(claims)) return { token, claims }
      store.removeItem(SESSION_KEY) // expired or malformed: drop it
    } catch {
      store.removeItem(SESSION_KEY)
    }
  }
  return null
}

function writeSession(token, remember) {
  clearSession()
  ;(remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify({ token }))
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

function readPending() {
  try {
    return JSON.parse(sessionStorage.getItem(PENDING_KEY))
  } catch {
    return null
  }
}

const toUser = (claims) =>
  claims && {
    id: claims.sub,
    email: claims.email,
    name: claims.name,
    handle: claims.handle,
    role: claims.role,
    expiresAt: claims.exp * 1000,
  }

/* -------------------------------- provider -------------------------------- */

export function AuthProvider({ children }) {
  // Storage is synchronous, so the first render already knows who is signed in: no loading flash.
  const [session, setSession] = useState(readSession)
  const [pending, setPending] = useState(readPending)

  const signOut = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const startSession = useCallback((token, remember) => {
    writeSession(token, remember)
    sessionStorage.removeItem(PENDING_KEY)
    setPending(null)
    setSession({ token, claims: decodeJwt(token) })
  }, [])

  // Sign out automatically when the token lapses.
  useEffect(() => {
    if (!session) return undefined
    let timer
    const arm = () => {
      const remaining = session.claims.exp * 1000 - Date.now()
      if (remaining <= 0) {
        signOut()
        return
      }
      timer = setTimeout(arm, Math.min(remaining, MAX_TIMEOUT_MS))
    }
    arm()
    return () => clearTimeout(timer)
  }, [session, signOut])

  // Keep tabs in step: signing out or in elsewhere updates this one.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === SESSION_KEY || event.key === null) setSession(readSession())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = useCallback(
    async ({ email, password, remember }) => {
      const result = await api.login({ email, password, remember })
      if (result.verificationRequired) {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(result.pending))
        setPending(result.pending)
        return { verificationRequired: true }
      }
      startSession(result.token, remember)
      return { verificationRequired: false }
    },
    [startSession],
  )

  const register = useCallback(async (details) => {
    const { pending: next } = await api.register(details)
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(next))
    setPending(next)
  }, [])

  const verify = useCallback(
    async (code) => {
      if (!pending) throw new api.AuthError('otp_expired', 'That code has expired. Start again.')
      const { token } = await api.verifyOtp({ userId: pending.userId, code })
      startSession(token, pending.remember)
    },
    [pending, startSession],
  )

  const resend = useCallback(async () => {
    if (!pending) throw new api.AuthError('otp_expired', 'That code has expired. Start again.')
    await api.resendOtp({ userId: pending.userId })
  }, [pending])

  const cancelVerification = useCallback(() => {
    sessionStorage.removeItem(PENDING_KEY)
    setPending(null)
  }, [])

  // Account and profile edits can change the token's claims (email, name, handle), so the server
  // answers with a fresh token and the session is restarted in the same storage it lived in.
  const saveAccount = useCallback(
    async (fields) => {
      const remember = Boolean(localStorage.getItem(SESSION_KEY))
      const { token } = await api.updateAccount({ userId: session.claims.sub, remember, ...fields })
      startSession(token, remember)
    },
    [session, startSession],
  )
  const saveProfile = useCallback(
    async (fields) => {
      const remember = Boolean(localStorage.getItem(SESSION_KEY))
      const { token } = await api.updateProfile({ userId: session.claims.sub, remember, ...fields })
      startSession(token, remember)
    },
    [session, startSession],
  )

  const value = useMemo(
    () => ({
      status: session ? 'authenticated' : 'anonymous',
      user: toUser(session?.claims) ?? null,
      token: session?.token ?? null,
      pending,
      login,
      register,
      verify,
      resend,
      cancelVerification,
      updateAccount: saveAccount,
      updateProfile: saveProfile,
      logout: signOut,
      checkHandle: api.checkHandle,
      // Demo only: nothing is emailed, so the UI can show the code. Null when demoAuth is off.
      getDemoCode: () => (site.demoAuth && pending ? api.getDemoCode(pending.userId) : null),
    }),
    [session, pending, login, register, verify, resend, cancelVerification, saveAccount, saveProfile, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export { AuthError } from '../lib/mockAuthApi'
