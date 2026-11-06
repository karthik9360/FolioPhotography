// The three demo identities, as hardcoded payloads. The mock auth seeds its users table from this,
// and the sign-in screen, the role switcher and the navigation read it.
// Real accounts come from the server; replace this file's role with the real user's role claim.
//
// "Editorial Desk" is a generic client. The username follows the brief, but nothing here uses any
// publication's name, logo or branding.
export const DEMO_IDENTITIES = [
  { email: 'photographer@demo.test', role: 'creator', username: 'studio_karthik', name: 'Studio Karthik', label: 'Creator' },
  { email: 'client@demo.test', role: 'client', username: 'vogue_editorial', name: 'Editorial Desk', label: 'Client' },
  { email: 'follower@demo.test', role: 'follower', username: 'anand_kumar', name: 'Anand Kumar', label: 'Follower' },
]

export const identityForRole = (role) => DEMO_IDENTITIES.find((i) => i.role === role)
