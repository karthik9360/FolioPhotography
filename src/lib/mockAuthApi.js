// DEMO ONLY. This stands in for a real auth server so the front end can be built and tested.
//
//  - Accounts live in localStorage. Passwords are stored as salted SHA-256 hashes, never plaintext,
//    but this is NOT a substitute for a server-side password hash such as argon2 or bcrypt.
//  - Tokens are UNSIGNED (`alg: none`). A real backend issues signed tokens (ideally in an
//    httpOnly cookie) and verifies them on every request.
//  - The OTP is generated and checked here, and the demo UI can display it. A real backend
//    sends it by email or SMS and never reveals it to the browser.
//
// Replace this module with calls to the real API. The functions and error codes are the contract.

import { DEMO_IDENTITIES } from '../config/identities'
import { users as seededPhotographers } from '../data/users'
import { b64urlEncode } from './jwt'
import { normalizeHandle, rules } from './validation'

const USERS_KEY = 'folio.mock.users'
const OTP_KEY = 'folio.mock.otp'
const LATENCY_MS = 450
const OTP_TTL_MS = 5 * 60 * 1000
const RESEND_COOLDOWN_MS = 30 * 1000
const MAX_OTP_ATTEMPTS = 5

export const DEMO_PASSWORD = 'Demo-pass-2026'
export const DEMO_ACCOUNTS = DEMO_IDENTITIES.map(({ email, role, username }) => ({ email, role, username }))
const SEED_KEY = 'folio.mock.seedVersion'
const SEED_VERSION = '2' // bump to re-seed the demo accounts in browsers that hold an older set

export class AuthError extends Error {
  constructor(code, message, field) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.field = field
  }
}

const wait = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms))
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))
const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
const randomHex = (n = 16) => hex(crypto.getRandomValues(new Uint8Array(n)))

async function hashPassword(password, salt) {
  if (!crypto?.subtle) throw new AuthError('insecure_context', 'Signing in needs a secure connection. Please open this site over https.')
  const data = new TextEncoder().encode(`${salt}:${password}`)
  return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', data)))
}

async function ensureSeed() {
  if (localStorage.getItem(SEED_KEY) === SEED_VERSION && read(USERS_KEY, null)) return
  // Replace the demo accounts; keep anyone who registered themselves.
  const kept = read(USERS_KEY, []).filter((u) => !u.id.startsWith('u_demo_'))
  const demos = []
  for (const d of DEMO_IDENTITIES) {
    const salt = randomHex()
    demos.push({
      id: `u_demo_${d.role}`,
      email: d.email,
      name: d.name,
      handle: d.username,
      role: d.role,
      verified: true,
      salt,
      hash: await hashPassword(DEMO_PASSWORD, salt),
      createdAt: Date.now(),
    })
  }
  write(USERS_KEY, [...demos, ...kept])
  localStorage.setItem(SEED_KEY, SEED_VERSION)
}

/**
 * DEMO ONLY: a session for one of the three demo accounts without a password, for the role switcher.
 * A real backend must not have this.
 */
export async function loginAsDemo(role) {
  await wait(150)
  await ensureSeed()
  const user = users().find((u) => u.id === `u_demo_${role}`)
  if (!user) throw new AuthError('not_demo', 'That isn’t a demo account.')
  return { token: issueToken(user, false) }
}

const users = () => read(USERS_KEY, [])

// The seeded photographers' handles are always taken, whether or not they have a login.
const SEEDED_HANDLES = new Set(seededPhotographers.map((u) => u.handle))
const handleTaken = (handle, exceptId) =>
  SEEDED_HANDLES.has(handle) || users().some((u) => u.handle === handle && u.id !== exceptId)
const findByEmail = (email) => users().find((u) => u.email === email.trim().toLowerCase())

function issueToken(user, remember) {
  const now = Math.floor(Date.now() / 1000)
  const ttl = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8
  const header = { alg: 'none', typ: 'JWT' } // unsigned: demo only
  const claims = {
    sub: user.id,
    email: user.email,
    name: user.name,
    handle: user.handle,
    role: user.role,
    iat: now,
    exp: now + ttl,
    demo: true,
  }
  return `${b64urlEncode(JSON.stringify(header))}.${b64urlEncode(JSON.stringify(claims))}.`
}

function issueOtp(user) {
  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0')
  write(OTP_KEY, { userId: user.id, code, issuedAt: Date.now(), expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 })
  return code
}

const pendingFor = (user, remember = false) => ({ userId: user.id, email: user.email, remember })

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function login({ email, password, remember }) {
  await wait()
  await ensureSeed()
  const user = findByEmail(email)
  const ok = user && (await hashPassword(password, user.salt)) === user.hash
  // One message for both cases, so the form never reveals which emails exist.
  if (!ok) throw new AuthError('invalid_credentials', 'That email and password don’t match.')
  if (!user.verified) {
    issueOtp(user)
    return { verificationRequired: true, pending: pendingFor(user, remember) }
  }
  return { token: issueToken(user, remember) }
}

export async function register({ name, email, password, handle, role }) {
  await wait()
  await ensureSeed()
  const clean = { name: name.trim(), email: email.trim().toLowerCase(), handle: normalizeHandle(handle) }
  const invalid =
    rules.name(clean.name) || rules.email(clean.email) || rules.password(password) || rules.handle(clean.handle) || rules.role(role)
  if (invalid) throw new AuthError('invalid', invalid)
  if (findByEmail(clean.email)) throw new AuthError('email_taken', 'An account with that email already exists.', 'email')
  if (handleTaken(clean.handle)) throw new AuthError('handle_taken', 'That username is taken.', 'handle')

  const salt = randomHex()
  const user = {
    id: `u_${randomHex(6)}`,
    ...clean,
    role,
    verified: false,
    salt,
    hash: await hashPassword(password, salt),
    createdAt: Date.now(),
  }
  write(USERS_KEY, [...users(), user])
  issueOtp(user)
  return { pending: pendingFor(user) }
}

export async function checkHandle(handle) {
  await wait(300)
  await ensureSeed()
  const h = normalizeHandle(handle)
  return { available: !handleTaken(h) }
}

export async function verifyOtp({ userId, code }) {
  await wait()
  const record = read(OTP_KEY, null)
  if (!record || record.userId !== userId || record.expiresAt < Date.now()) {
    throw new AuthError('otp_expired', 'That code has expired. Request a new one.')
  }
  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    throw new AuthError('too_many_attempts', 'Too many attempts. Request a new code.')
  }
  if (record.code !== code) {
    write(OTP_KEY, { ...record, attempts: record.attempts + 1 })
    throw new AuthError('otp_invalid', 'That code isn’t right. Check it and try again.')
  }
  const all = users()
  const user = all.find((u) => u.id === userId)
  if (!user) throw new AuthError('otp_expired', 'That code has expired. Request a new one.')
  write(USERS_KEY, all.map((u) => (u.id === userId ? { ...u, verified: true } : u)))
  localStorage.removeItem(OTP_KEY)
  return { token: issueToken({ ...user, verified: true }, false) }
}

export async function resendOtp({ userId }) {
  await wait()
  const record = read(OTP_KEY, null)
  const since = record && record.userId === userId ? Date.now() - record.issuedAt : Infinity
  if (since < RESEND_COOLDOWN_MS) {
    const seconds = Math.ceil((RESEND_COOLDOWN_MS - since) / 1000)
    throw new AuthError('cooldown', `Wait ${seconds}s before requesting another code.`)
  }
  const user = users().find((u) => u.id === userId)
  if (!user) throw new AuthError('otp_expired', 'That code has expired. Start again.')
  issueOtp(user)
  return { ok: true }
}

/** Demo only: lets the UI show the code because nothing is emailed. A real server never does this. */
export function getDemoCode(userId) {
  const record = read(OTP_KEY, null)
  return record && record.userId === userId ? record.code : null
}

export const RESEND_COOLDOWN_SECONDS = RESEND_COOLDOWN_MS / 1000

/* ------------------------------------------------------------------ */
/* Account and public-profile edits. Two separate writes to the same   */
/* users table: account fields (email, password, visibility) never     */
/* touch profile fields (name, handle, bio, categories, avatar).       */
/* ------------------------------------------------------------------ */

/** Public fields of every registered user, for rendering profiles. Never includes credentials. */
export function getDirectory() {
  return users().map(({ id, handle, name, role, bio, categories, avatar, isPrivate }) => ({
    id, handle, name, role, bio, categories, avatar, isPrivate: Boolean(isPrivate),
  }))
}

export async function updateAccount({ userId, currentPassword, email, newPassword, isPrivate, remember }) {
  await wait()
  const all = users()
  const user = all.find((u) => u.id === userId)
  if (!user) throw new AuthError('not_found', 'That account no longer exists.')

  const nextEmail = email == null ? user.email : email.trim().toLowerCase()
  const emailChanged = nextEmail !== user.email
  const passwordChanging = Boolean(newPassword)

  // Sensitive changes need the current password.
  if (emailChanged || passwordChanging) {
    const ok = (await hashPassword(currentPassword ?? '', user.salt)) === user.hash
    if (!ok) throw new AuthError('invalid_credentials', 'That password isn’t right.', 'currentPassword')
  }

  const next = { ...user }
  if (emailChanged) {
    const invalid = rules.email(nextEmail)
    if (invalid) throw new AuthError('invalid', invalid, 'email')
    if (all.some((u) => u.id !== userId && u.email === nextEmail)) {
      throw new AuthError('email_taken', 'An account with that email already exists.', 'email')
    }
    next.email = nextEmail
  }
  if (passwordChanging) {
    const invalid = rules.password(newPassword)
    if (invalid) throw new AuthError('invalid', invalid, 'newPassword')
    next.salt = randomHex()
    next.hash = await hashPassword(newPassword, next.salt)
  }
  if (typeof isPrivate === 'boolean') next.isPrivate = isPrivate

  write(USERS_KEY, all.map((u) => (u.id === userId ? next : u)))
  return { token: issueToken(next, remember) }
}

export async function updateProfile({ userId, name, handle, bio, categories, avatar, remember }) {
  await wait()
  const all = users()
  const user = all.find((u) => u.id === userId)
  if (!user) throw new AuthError('not_found', 'That account no longer exists.')

  const cleanHandle = normalizeHandle(handle)
  const invalid = rules.name(name) || rules.handle(cleanHandle)
  if (invalid) throw new AuthError('invalid', invalid)
  if ((bio ?? '').length > 150) throw new AuthError('invalid', 'Keep your bio to 150 characters.', 'bio')
  // Keeping your own handle is always fine; anyone else's, or a seeded photographer's, is taken.
  if (cleanHandle !== user.handle && handleTaken(cleanHandle, userId)) {
    throw new AuthError('handle_taken', 'That username is taken.', 'handle')
  }

  const next = {
    ...user,
    name: name.trim(),
    handle: cleanHandle,
    bio: (bio ?? '').trim(),
    categories: categories ?? [],
    avatar: avatar || '',
  }
  write(USERS_KEY, all.map((u) => (u.id === userId ? next : u)))
  return { token: issueToken(next, remember) }
}
