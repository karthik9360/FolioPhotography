// Client-side JWT helpers. Decoding is for reading claims (expiry, role) to drive the UI.
// It proves nothing: only a server that verifies the signature can trust a token.

const pad = (s) => s + '='.repeat((4 - (s.length % 4)) % 4)

export function b64urlEncode(text) {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  bytes.forEach((b) => {
    bin += String.fromCharCode(b)
  })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(segment) {
  const bin = atob(pad(segment.replace(/-/g, '+').replace(/_/g, '/')))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

/** Returns the claims object, or null when the token is malformed. */
export function decodeJwt(token) {
  try {
    const [, payload] = String(token).split('.')
    return payload ? JSON.parse(b64urlDecode(payload)) : null
  } catch {
    return null
  }
}

/** A token with no `exp` is treated as expired. `skewSeconds` avoids using a token about to lapse. */
export function isExpired(claims, skewSeconds = 5) {
  return !claims || typeof claims.exp !== 'number' || claims.exp <= Date.now() / 1000 + skewSeconds
}
