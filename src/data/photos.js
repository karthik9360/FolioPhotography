// Synthetic demonstration data. Images are random stand-ins from picsum.photos,
// deterministic per seed. Replace with each photographer's real uploads.

import { users } from './users'

const THUMB_W = 800
const FULL_W = 1600

const HANDLES = users.map((u) => u.handle)

const COMMENT_POOL = [
  'The shadows on the left are doing so much work here.',
  'Would love to see the contact sheet from this roll.',
  'The wall against the fabric is perfect.',
  'That edge light is lovely.',
  'Quiet and sharp at the same time.',
  'Great frame.',
  'This is the one. The crop is exactly right.',
  'How did you get the light to fall off like that?',
  'Saving this for the next mood board.',
  'The colour here is unreal.',
]

// [title, category, series, [w, h], location, year, story] for the featured photographer.
const FEATURED_ROWS = [
  ['Harbour, 6 a.m.', 'Editorial', 'Salt Season', [4, 5], 'Lisbon', 2024, 'First light on the quay, before the crew arrived. One reflector, no assistants.'],
  ['Linen and Wind', 'Editorial', 'Salt Season', [3, 2], 'Marseille', 2024, 'The fabric did the directing; we only had to keep up with it.'],
  ['Stairwell Study', 'Portrait', 'Quiet Rooms', [2, 3], 'Osaka', 2023, 'A borrowed stairwell and ten minutes of window light.'],
  ['The Long Table', 'Event', 'After Hours', [3, 2], 'Mumbai', 2024, 'Forty guests, one table, and the moment the toasts began.'],
  ['Second Skin', 'Editorial', 'Salt Season', [4, 5], 'Reykjavik', 2023, 'Wet wool, cold air, a very patient model.'],
  ['Window Seat', 'Portrait', 'Quiet Rooms', [1, 1], 'Lisbon', 2024, 'She asked not to be directed, so I stopped talking.'],
  ['Last Dance', 'Event', 'After Hours', [4, 5], 'Mumbai', 2023, 'Shot at the end of the night, when the room finally let go.'],
  ['Kerchief', 'Portrait', 'Quiet Rooms', [3, 4], 'Marseille', 2024, 'A single scarf, three poses, and the first one was the keeper.'],
  ['Low Tide Walk', 'Editorial', 'Salt Season', [2, 3], 'Reykjavik', 2024, 'The tide gave us twenty minutes of dry sand.'],
  ['Cutlery Hour', 'Event', 'After Hours', [1, 1], 'Osaka', 2023, 'Between courses, everyone leans in. That is the picture.'],
  ['Paper Light', 'Portrait', 'Quiet Rooms', [4, 5], 'Lisbon', 2023, 'Window light through a sheet of tracing paper.'],
  ['Rooftop Hem', 'Editorial', 'Salt Season', [3, 2], 'Mumbai', 2024, 'Wind from the east, a hem lifting at exactly the right second.'],
  ['Toast', 'Event', 'After Hours', [3, 4], 'Marseille', 2024, 'Glasses up, faces turned away from the camera on purpose.'],
  ['Open Door', 'Portrait', 'Quiet Rooms', [2, 3], 'Osaka', 2024, 'The door was never meant to be in frame. It stayed.'],
  ['Gold Hour Coat', 'Editorial', 'Salt Season', [4, 5], 'Lisbon', 2024, 'Ten minutes of low sun and a coat that caught all of it.'],
  ['Confetti Floor', 'Event', 'After Hours', [3, 2], 'Mumbai', 2023, 'The aftermath is often the better photograph.'],
  ['Profile in Steam', 'Portrait', 'Quiet Rooms', [3, 4], 'Reykjavik', 2023, 'A hot spring, a cold morning, and a long lens from the bank.'],
  ['Veil', 'Editorial', 'Salt Season', [1, 1], 'Marseille', 2023, 'Shot through a curtain that was only supposed to be a prop.'],
].map((row) => [...row, HANDLES[0]])

// The other photographers get six photographs each, generated from word lists.
const CATEGORIES = ['Editorial', 'Portrait', 'Event']
const SERIES = {
  Editorial: ['Salt Season', 'Linen Weather', 'Northern Hem'],
  Portrait: ['Quiet Rooms', 'Borrowed Light', 'Paper Faces'],
  Event: ['After Hours', 'Long Tables', 'Late Songs'],
}
const ADJECTIVES = ['Quiet', 'Gilded', 'Salt', 'Paper', 'Low', 'Open', 'Second', 'Late', 'Glass', 'Linen', 'Amber', 'North', 'Velvet', 'Static', 'Slow']
const NOUNS = ['Hour', 'Coat', 'Window', 'Stairwell', 'Tide', 'Table', 'Veil', 'Door', 'Roof', 'Lane', 'Light', 'Room', 'Steps', 'Fabric', 'Shore']
const PLACES = ['Lisbon', 'Osaka', 'Marseille', 'Mumbai', 'Reykjavik', 'Porto', 'Kyoto', 'Oslo']
const RATIOS = [[4, 5], [3, 2], [2, 3], [1, 1], [3, 4]]
const STORIES = [
  'A short walk, a long lens, and the light holding for exactly one more frame.',
  'Shot on the way to somewhere else, which is usually when it works.',
  'We had the room for an hour. This was the last ten minutes.',
  'No plan, one reflector, a patient subject.',
  'The weather changed twice during this set. This is the second change.',
  'Taken between takes, which is where I find most of my favourites.',
  'Natural light only. The window did all of the lighting design.',
  'A quiet moment during a very loud afternoon.',
  'The first frame of the roll, and the one I kept.',
  'Cold hands, warm light, and a model who never complained once.',
  'I almost cut this one. Then I looked at it again the next morning.',
  'Made with borrowed time and a borrowed room.',
]

const GENERATED_ROWS = HANDLES.slice(1).flatMap((handle, u) =>
  Array.from({ length: 6 }, (_, k) => {
    const n = u * 6 + k
    const category = CATEGORIES[(u + k) % 3]
    return [
      `${ADJECTIVES[n % 15]} ${NOUNS[(n * 7 + Math.floor(n / 15) * 5) % 15]}`,
      category,
      SERIES[category][u % 3],
      RATIOS[(n + u) % RATIOS.length],
      PLACES[(n + 2 * u) % PLACES.length],
      2023 + (n % 2),
      STORIES[n % STORIES.length],
      handle,
    ]
  }),
)

const FOCALS = ['24 mm', '35 mm', '50 mm', '85 mm', '35 mm', '50 mm']
const APERTURES = ['f/1.4', 'f/2', 'f/2.8', 'f/1.8', 'f/4', 'f/2']
const SHUTTERS = ['1/250 s', '1/500 s', '1/125 s', '1/1000 s', '1/200 s', '1/320 s']
const ISOS = ['100', '200', '400', '640', '125', '800']

export const photos = [...FEATURED_ROWS, ...GENERATED_ROWS].map(
  ([title, category, series, [rw, rh], location, year, story, userHandle], i) => {
    const seed = `folio-${String(i + 1).padStart(2, '0')}`
    const h = Math.round((THUMB_W * rh) / rw)
    const fullH = Math.round((FULL_W * rh) / rw)
    const commentCount = (i % 3) + 1
    const m = i % 6
    const others = HANDLES.filter((handle) => handle !== userHandle)
    return {
      id: `p${i + 1}`,
      userHandle,
      title,
      category,
      series,
      ratio: rw / rh,
      w: THUMB_W,
      h,
      fullW: FULL_W,
      fullH,
      thumb: `https://picsum.photos/seed/${seed}/${THUMB_W}/${h}`,
      full: `https://picsum.photos/seed/${seed}/${FULL_W}/${fullH}`,
      alt: `Placeholder photograph for “${title}”, ${location}, ${year}`,
      location,
      year,
      story,
      exif: {
        Camera: 'Full-frame body',
        Lens: `${FOCALS[m]} prime`,
        'Focal length': FOCALS[m],
        Aperture: APERTURES[m],
        Shutter: SHUTTERS[m],
        ISO: ISOS[m],
      },
      likes: 84 + ((i * 197) % 1900),
      seedComments: Array.from({ length: commentCount }, (_, k) => ({
        id: `${seed}-c${k}`,
        author: others[(i + k * 3) % others.length],
        text: COMMENT_POOL[(i + k * 2) % COMMENT_POOL.length],
      })),
    }
  },
)

export const photosById = Object.fromEntries(photos.map((p) => [p.id, p]))
export const categories = ['All', 'Editorial', 'Portrait', 'Event']
