import { colourName, moodOf } from './imageAnalysis'

/*
 * The tonal assistant. It is rule-based, not a generative model: it turns measured colour, light and
 * camera data into a short description and up to three tags, and says why it chose each tag.
 */

const shutterDenominator = (shutter) => {
  const match = /1\/(\d+)/.exec(shutter ?? '')
  return match ? Number(match[1]) : 0
}

export function tonalNotes(asset) {
  const { analysis: a, exif } = asset
  const mood = moodOf(a)
  const aperture = parseFloat(String(exif?.Aperture ?? '').replace('f/', '')) || 0
  const fast = shutterDenominator(exif?.Shutter) >= 500
  const wide = aperture > 0 && aperture <= 2.8
  const hasExif = Boolean(exif && Object.values(exif).some(Boolean))

  const colours = [...new Set(a.palette.map(colourName))].slice(0, 2).join(' and ')
  const sentences = [`${mood.tonality} frame with a ${mood.temperature} cast, built on ${colours}.`]
  if (a.contrast > 0.28) sentences.push('Strong tonal contrast.')
  else if (a.contrast < 0.12) sentences.push('Soft, even tonality.')
  if (wide) sentences.push('Shot wide open, so the depth of field is shallow.')
  if (fast) sentences.push('A fast shutter holds any movement still.')
  if (!hasExif) sentences.push('No camera data was found in the file.')

  const candidates = [
    {
      name: 'Cinematic',
      score: (mood.tonality === 'Low key') + wide + (a.contrast > 0.25),
      reason: [mood.tonality === 'Low key' && 'low-key light', wide && 'wide aperture', a.contrast > 0.25 && 'strong contrast'],
    },
    {
      name: 'Runway',
      score: (mood.tonality === 'High key') + (a.saturation < 0.3) + (a.ratio < 0.85),
      reason: [mood.tonality === 'High key' && 'high-key light', a.saturation < 0.3 && 'restrained colour', a.ratio < 0.85 && 'tall frame'],
    },
    {
      name: 'Avant-Garde',
      score: (a.saturation > 0.55) + (Math.abs(a.warmth) > 0.2) + (a.contrast > 0.3),
      reason: [a.saturation > 0.55 && 'rich colour', Math.abs(a.warmth) > 0.2 && 'strong colour cast', a.contrast > 0.3 && 'hard contrast'],
    },
    {
      name: 'Editorial',
      score: 1 + (mood.tonality === 'Mid-tone') + (a.saturation >= 0.25 && a.saturation <= 0.55),
      reason: ['balanced frame', mood.tonality === 'Mid-tone' && 'mid-tone light', a.saturation >= 0.25 && a.saturation <= 0.55 && 'moderate colour'],
    },
    {
      name: 'Documentary',
      score: fast + (a.saturation < 0.35) + (a.contrast < 0.2),
      reason: [fast && 'fast shutter', a.saturation < 0.35 && 'natural colour', a.contrast < 0.2 && 'even light'],
    },
  ]

  const tags = candidates
    .filter((c) => c.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, 3)
    .map((c) => ({ name: c.name, reason: c.reason.filter(Boolean).join(', ') }))

  return { description: sentences.join(' '), tags }
}
