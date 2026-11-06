// Local image analysis for curation. Everything runs in the browser; nothing is uploaded.
// It measures a three-colour palette, light, saturation and warmth from a 32x32 sample, and a 64-bit
// difference hash (dHash) so near-identical frames can be flagged as duplicates.

const SAMPLE = 32
const HASH_W = 9
const HASH_H = 8

const lum = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
const mean = (list) => list.reduce((n, v) => n + v, 0) / (list.length || 1)
const toHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`

/** Simple k-means over RGB pixels, seeded from luminance quantiles so results are repeatable. */
function kmeans(pixels, k = 3, iterations = 8) {
  const sorted = [...pixels].sort((a, b) => lum(a) - lum(b))
  let centers = Array.from({ length: k }, (_, i) => sorted[Math.floor(((i + 0.5) / k) * sorted.length)].slice())
  let groups = []
  for (let it = 0; it < iterations; it += 1) {
    groups = Array.from({ length: k }, () => [])
    for (const p of pixels) {
      let best = 0
      let bestDistance = Infinity
      centers.forEach((c, i) => {
        const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2
        if (d < bestDistance) {
          bestDistance = d
          best = i
        }
      })
      groups[best].push(p)
    }
    centers = centers.map((c, i) =>
      groups[i].length ? [0, 1, 2].map((ch) => mean(groups[i].map((p) => p[ch]))) : c,
    )
  }
  return centers
    .map((rgb, i) => ({ rgb, share: groups[i].length / pixels.length }))
    .sort((a, b) => b.share - a.share)
}

function drawTo(bitmap, w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(bitmap, 0, 0, w, h)
  return ctx.getImageData(0, 0, w, h).data
}

export async function analyzeImage(file) {
  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap

  const data = drawTo(bitmap, SAMPLE, SAMPLE)
  const pixels = []
  for (let i = 0; i < data.length; i += 4) pixels.push([data[i], data[i + 1], data[i + 2]])
  const clusters = kmeans(pixels)

  const lums = pixels.map(lum)
  const avgL = mean(lums)
  const contrast = Math.sqrt(mean(lums.map((l) => (l - avgL) ** 2)))
  const saturation = mean(pixels.map(([r, g, b]) => (Math.max(r, g, b) === 0 ? 0 : (Math.max(r, g, b) - Math.min(r, g, b)) / Math.max(r, g, b))))
  const warmth = mean(pixels.map(([r, , b]) => (r - b) / 255))

  const small = drawTo(bitmap, HASH_W, HASH_H)
  const gray = []
  for (let i = 0; i < small.length; i += 4) gray.push(lum([small[i], small[i + 1], small[i + 2]]))
  let hash = ''
  for (let y = 0; y < HASH_H; y += 1) {
    for (let x = 0; x < HASH_W - 1; x += 1) hash += gray[y * HASH_W + x] > gray[y * HASH_W + x + 1] ? '1' : '0'
  }

  bitmap.close?.()
  return {
    width,
    height,
    ratio: width / height,
    palette: clusters.map((c) => toHex(c.rgb)),
    avgL,
    contrast,
    saturation,
    warmth,
    hash,
  }
}

/** Number of differing bits between two hashes. Small means visually near-identical. */
export const hamming = (a, b) => {
  let n = 0
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) n += 1
  return n
}

export const DUPLICATE_DISTANCE = 6

/** Light and temperature, as words, plus a key used to group photographs into mood clusters. */
export function moodOf(analysis) {
  const tonality = analysis.avgL < 0.35 ? 'Low key' : analysis.avgL > 0.65 ? 'High key' : 'Mid-tone'
  const temperature = analysis.warmth > 0.08 ? 'warm' : analysis.warmth < -0.08 ? 'cool' : 'neutral'
  return { tonality, temperature, key: `${tonality} · ${temperature}` }
}

const HUES = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'teal', 'cyan', 'blue', 'indigo', 'violet', 'magenta']

/** A plain-language colour name for a hex value. */
export function colourName(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (l < 0.14) return 'black'
  if (l > 0.9) return 'white'
  if (d < 0.08) return l < 0.4 ? 'charcoal' : l > 0.7 ? 'pale grey' : 'grey'
  let h = 0
  if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  h = (h * 60 + 360) % 360
  const name = HUES[Math.round(h / 30) % 12]
  return l < 0.3 ? `deep ${name}` : l > 0.75 ? `pale ${name}` : name
}
