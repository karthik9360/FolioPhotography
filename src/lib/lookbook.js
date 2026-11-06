// The lookbook cadence. Photographs are not poured into equal squares: each one is given a frame that
// suits its own shape, and the frames alternate in pairs across a 12-column grid.
//
//   hero  spans 8 columns, aspect 16:9    (a cinematic spread)
//   tall  spans 4 columns, aspect 4:5     (a narrow portrait column)
//
// Row 1 is hero + tall, row 2 is tall + hero, and so on (a portrait lead starts tall + hero). Wide photographs fill hero slots and
// portrait or square ones fill tall slots; if one kind runs out, the other fills the gap.

export const HERO = 'hero'
export const TALL = 'tall'
const WIDE_AT = 1.2 // width / height at or above which a photograph counts as wide

export const isWide = (photo) => photo.w / photo.h >= WIDE_AT

/**
 * The slot kind at position n. The cadence is hero, tall, tall, hero, hero, tall, tall, hero ...
 * `shift` 2 starts it on a tall column instead (tall, hero, hero, tall ...), so the newest item can
 * lead in a frame that suits its shape without breaking the alternating pairs.
 */
export const slotAt = (n, shift = 0) => ((n + 1 + shift) % 4 < 2 ? HERO : TALL)

/**
 * Lays items out in cadence order. Each item is `{ photo, ... }`. Returns `[{ item, variant, row }]`
 * where `row` counts the pairs (0, 1, 2 ...), so callers can stagger alternate rows.
 * The first item always leads (the newest work stays first); after that, wide photographs fill hero
 * slots and portrait or square ones fill tall slots, in their original order.
 */
export function arrangeLookbook(items) {
  if (items.length === 0) return []
  const [lead, ...rest] = items
  const shift = isWide(lead.photo) ? 0 : 2
  const wide = rest.filter((it) => isWide(it.photo))
  const narrow = rest.filter((it) => !isWide(it.photo))
  const arranged = [{ item: lead, variant: slotAt(0, shift), row: 0 }]
  for (let n = 1; n < items.length; n += 1) {
    const variant = slotAt(n, shift)
    const own = variant === HERO ? wide : narrow
    const other = variant === HERO ? narrow : wide
    const item = own.length > 0 ? own.shift() : other.shift()
    arranged.push({ item, variant, row: Math.floor(n / 2) })
  }
  return arranged
}

/**
 * A catalogue reference for a photograph: owner initials, year, and a three-digit serial derived from
 * its id, for example "SK-24-007". It is a label for the grid, not a booking or invoice number.
 */
export function projectCode(photo) {
  const initials = String(photo.userHandle ?? '')
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 3)
  const digits = String(photo.id).match(/^[pm](\d+)$/)?.[1]
  let serial = digits
  if (!serial) {
    let hash = 0
    for (const ch of String(photo.id)) hash = (hash * 31 + ch.charCodeAt(0)) % 1000
    serial = String(hash)
  }
  const year = photo.year ? String(photo.year).slice(-2) : ''
  return [initials || 'FO', year, serial.padStart(3, '0').slice(-3)].filter(Boolean).join('-')
}

/** Camera tokens for the hover overlay, in reading order. Missing values are skipped. */
export function exifTokens(exif = {}) {
  const iso = exif.ISO ? `ISO ${exif.ISO}` : ''
  return [exif.Camera, exif.Lens, exif.Aperture, exif.Shutter, iso].filter(Boolean)
}
