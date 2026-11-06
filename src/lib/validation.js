// Shared form rules. Each returns an error message, or '' when the value is fine.
// The mock API re-checks the same rules, as a real backend must.

export const RESERVED_HANDLES = new Set([
  'admin', 'root', 'support', 'folio', 'studio', 'client', 'feed', 'auth',
  'login', 'register', 'verify', 'journal', 'moodboards', 'api', 'profile',
  // every top-level route, since profiles now live at /:username
  'explore', 'post', 'settings', 'upload', 'messages', 'stories', 'reels', 'notifications',
])

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const normalizeHandle = (value) => value.trim().toLowerCase().replace(/^@/, '')

export const rules = {
  name: (v) => {
    const name = v.trim()
    if (!name) return 'Enter your full name.'
    if (name.length < 2) return 'Your name needs at least two characters.'
    return ''
  },

  email: (v) => {
    const email = v.trim()
    if (!email) return 'Enter your email address.'
    if (!EMAIL.test(email)) return 'That doesn’t look like an email address. Try name@example.com.'
    return ''
  },

  // New passwords: length first, then at least one letter and one number.
  password: (v) => {
    if (!v) return 'Create a password.'
    if (v.length < 10) return 'Use at least 10 characters.'
    if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Include at least one letter and one number.'
    return ''
  },

  // Signing in only needs something to check; the server judges correctness.
  loginPassword: (v) => (v ? '' : 'Enter your password.'),

  handle: (v) => {
    const h = normalizeHandle(v)
    if (!h) return 'Choose a handle.'
    if (h.length < 3) return 'Handles need at least 3 characters.'
    if (h.length > 24) return 'Handles can be at most 24 characters.'
    if (!/^[a-z0-9][a-z0-9._-]*[a-z0-9]$/.test(h)) {
      return 'Use letters, numbers, dots, hyphens and underscores. Start and end with a letter or number.'
    }
    if (/[._-]{2}/.test(h)) return 'No two dots, hyphens or underscores in a row.'
    if (RESERVED_HANDLES.has(h)) return 'That handle is reserved. Try another.'
    return ''
  },

  role: (v) => (v ? '' : 'Choose how you’ll use the platform.'),
}

export const maskEmail = (email) => {
  const [local, domain = ''] = email.split('@')
  if (!domain) return email
  const shown = local.slice(0, Math.min(2, local.length))
  return `${shown}${'•'.repeat(Math.max(2, local.length - shown.length))}@${domain}`
}
