// Synthetic demonstration conversations. None of this is real correspondence.

import { photos } from './photos'
import { users } from './users'

const MIN = 60_000
const BUILD_TIME = Date.now()

// Presence is made up for the demo.
const ONLINE = new Set(['mika.sato', 'asha.rao', 'noor_haddad'])
export const isOnline = (handle) => ONLINE.has(handle)

// [from ('me' | 'them'), text, minutes ago, number of photographs attached]
const SCRIPTS = [
  [
    ['them', 'Hi! I saw your set from Lisbon. Are you free for a portrait session next month?', 3200],
    ['me', 'Thank you, I am. What did you have in mind?', 3150],
    ['them', 'Something quiet: window light, two outfits, an afternoon. Maybe four hours in total.', 3100],
    ['me', 'That sounds lovely. I can do the second week. I will send a short plan.', 3090],
  ],
  [
    ['me', 'Sending the first selects from Saturday.', 1500],
    ['me', '', 1499, 3],
    ['them', 'These are beautiful. The second and third are exactly what we talked about.', 1380],
    ['them', 'Could you retouch those two and send them over at full size?', 1375],
  ],
  [
    ['them', 'Would you like to second-shoot an event with me in June? Evening, long tables, candlelight.', 640],
    ['me', 'I would. Send me the date when you have it.', 600],
    ['them', 'Will do. I am confirming the venue this week.', 590],
  ],
  [
    ['them', 'Your latest series is beautiful. How did you light the stairwell frame?', 240],
    ['me', 'Only window light and a sheet of tracing paper.', 200],
    ['them', 'Of course it was. Thank you.', 190],
  ],
  [['them', 'Quick question about licensing for the harbour photograph.', 80]],
]

const attachment = (photo) => ({ id: photo.id, url: photo.thumb, w: photo.w, h: photo.h, alt: photo.alt })

/** A set of conversations between `self` and the first few other photographers. Keyed by thread id. */
export function seedThreadsFor(self) {
  const partners = users.filter((u) => u.handle !== self).slice(0, SCRIPTS.length)
  const entries = partners.map((partner, i) => {
    const id = `t-${partner.handle}`
    const messages = SCRIPTS[i].map(([from, text, minutesAgo, attached = 0], k) => ({
      id: `${id}-m${k}`,
      from: from === 'me' ? 'me' : partner.handle,
      text,
      createdAt: BUILD_TIME - minutesAgo * MIN,
      status: 'read',
      attachments: photos.slice(i * 3, i * 3 + attached).map(attachment),
    }))
    // Unread = the run of incoming messages at the end.
    let unread = 0
    for (let k = messages.length - 1; k >= 0 && messages[k].from !== 'me'; k -= 1) unread += 1
    if (i === 0 || i === 2 || i === 3) unread = 0 // keep the demo mixed: some read, some not
    return [id, { id, with: partner.handle, unread, messages }]
  })
  return Object.fromEntries(entries)
}
