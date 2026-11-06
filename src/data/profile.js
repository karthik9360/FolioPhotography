import { photos } from './photos'
import { users } from './users'

const SERIES_NOTES = {
  'Salt Season': 'Coastal editorial work shot over two winters.',
  'Linen Weather': 'Fabric, wind and the hours before a storm.',
  'Northern Hem': 'Cold-weather fashion made close to the water.',
  'Quiet Rooms': 'Portraits made in borrowed rooms with whatever window was available.',
  'Borrowed Light': 'Portraits lit by other people’s windows.',
  'Paper Faces': 'Close portraits, soft light, very little retouching.',
  'After Hours': 'Evenings and events, photographed from the edge of the room.',
  'Long Tables': 'Dinners, toasts and the minutes between courses.',
  'Late Songs': 'The last hour of the night, when the room lets go.',
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

// One profile per user, built from the same photographs the feed and Explore use.
export const profiles = Object.fromEntries(
  users.map((user) => {
    const mine = photos.filter((p) => p.userHandle === user.handle)
    const seriesNames = [...new Set(mine.map((p) => p.series))]
    return [
      user.handle,
      {
        ...user,
        photoIds: mine.map((p) => p.id),
        tagged: [],
        series: seriesNames.map((name) => ({
          id: slug(name),
          title: name,
          note: SERIES_NOTES[name] ?? 'A series of related photographs.',
          photoIds: mine.filter((p) => p.series === name).map((p) => p.id),
        })),
      },
    ]
  }),
)

export function formatCount(n) {
  if (n >= 10000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toLocaleString('en-US')
}
