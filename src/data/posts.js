// Synthetic feed posts, built from the photographs. A post is one to four photographs by one
// photographer (a carousel), with a caption, a place, a time, and a few comments.

import { photos } from './photos'
import { users } from './users'

const HOUR = 3_600_000
const BUILD_TIME = Date.now() // relative times ("2 hours ago") stay sensible whenever the app loads
const SIZES = [1, 3, 2, 1, 4, 1, 2, 3]

const CAPTIONS = [
  'Ten minutes of good light and a very patient subject. Everything else was editing.',
  'From the roll we almost did not develop. Shot on location, no assistants, one reflector, and a lot of waiting for the wind.',
  'Quiet morning, loud colour.',
  'The fabric did the directing. We only had to keep up with it, and for once the weather agreed with us for the whole afternoon.',
  'Borrowed room, borrowed window, borrowed hour.',
  'Last frame of the night, shot from the edge of the room when everyone had finally stopped performing for the camera.',
  'Small set, big sky.',
  'Testing a new series. Tell me which frame you would keep.',
  'A hem, a gust of wind, and exactly one usable frame.',
  'Between courses is where the real pictures happen. Everyone leans in, nobody poses, and the candlelight does all of the work.',
  'Window light through tracing paper, again. I keep coming back to it.',
  'Early start, long lens, cold hands.',
]

const COMMENTS = [
  'The light in this is unreal.',
  'This is exactly the kind of frame I keep saving.',
  'Love the colour here.',
  'Which lens was this?',
  'Quiet and sharp at the same time.',
  'The crop is perfect.',
  'Would happily hang this on my wall.',
  'Great set, the second frame especially.',
  'How long did you have the location for?',
  'Beautiful work.',
]

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

const raw = users.flatMap((user, u) => {
  const mine = photos.filter((p) => p.userHandle === user.handle)
  const out = []
  let index = 0
  let n = 0
  while (index < mine.length) {
    const media = mine.slice(index, index + SIZES[(n + u) % SIZES.length])
    index += media.length
    // Newest posts land within a day or two; older ones trail back over a couple of weeks.
    out.push({ user, media, hoursAgo: 1 + u * 5 + (u % 3) + n * 41 })
    n += 1
  }
  return out
})

export const posts = raw
  .sort((a, b) => a.hoursAgo - b.hoursAgo)
  .map(({ user, media, hoursAgo }, i) => {
    const others = users.filter((u) => u.handle !== user.handle)
    return {
      id: `post-${i + 1}`,
      userHandle: user.handle,
      photoIds: media.map((m) => m.id),
      ratio: clamp(media[0].ratio, 0.8, 1.5), // Instagram-style limits: 4:5 portrait to 3:2 landscape
      location: media[0].location,
      caption: CAPTIONS[(i * 5 + 2) % CAPTIONS.length],
      createdAt: BUILD_TIME - hoursAgo * HOUR,
      likes: 120 + ((i * 733) % 8800),
      seedComments: Array.from({ length: 2 + (i % 3) }, (_, k) => ({
        id: `post-${i + 1}-c${k}`,
        author: others[(i + k * 2) % others.length].handle,
        text: COMMENTS[(i * 3 + k * 4) % COMMENTS.length],
      })),
    }
  })

export const postsById = Object.fromEntries(posts.map((p) => [p.id, p]))
