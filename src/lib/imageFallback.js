// Demo photographs come from picsum.photos, a free placeholder-image host. When that host is slow,
// blocked or down (it accepts the connection and then sends nothing on some networks), every photograph
// in the app would stay empty. This module keeps the pages usable in three steps:
//   1. the moment a picsum image appears, a generated picture (a small painted scene drawn from the same
//      seed, so each keeps its own colours) is painted behind it, so no frame is ever empty and a real
//      photograph, if it arrives, simply covers it;
//   2. an image that fails to load is replaced by that picture;
//   3. if the host does not answer a tiny test image within a few seconds, every picture still waiting
//      is replaced by it too.
// It touches nothing else: uploaded photos, blob URLs and real images from other places are left alone.

const PICSUM = /^https:\/\/(?:fastly\.)?picsum\.photos\/(?:seed\/([^/]+)|id\/(\d+))\/(\d+)\/(\d+)/
const PROBE_URL = 'https://picsum.photos/seed/folio-probe/8/8'
const PROBE_MS = 3500

/** A small stable number from a string (FNV-1a). */
function hashOf(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * A generated stand-in for a picsum URL, or null if the URL is not one. Pure and deterministic: the
 * same seed always gives the same picture. It is a small painted scene (sky, a pool of light, two
 * ridges, film grain), not a pretend photograph, so it reads as a picture and not as a loading smear.
 */
export function placeholderFor(url) {
  const m = PICSUM.exec(url || '')
  if (!m) return null
  const seed = m[1] ?? `id${m[2]}`
  const w = Number(m[3]) || 800
  const h = Number(m[4]) || 800
  const n = hashOf(seed)
  const u = 100 / w // the scene is drawn on a 100-wide sheet; the frame crops it with "slice"
  const H = h * u
  const hue = n % 360
  const hue2 = (hue + 24 + ((n >> 9) % 56)) % 360
  const sat = 40 + ((n >> 5) % 24)
  const sunX = 18 + ((n >> 3) % 64)
  const sunY = H * (0.28 + (((n >> 12) % 24) / 100))
  const horizon = H * (0.56 + (((n >> 16) % 14) / 100))
  // A ridge is a closed path whose top edge wanders around `base`, from a seeded set of heights.
  const ridge = (base, tone, lightness, k) => {
    const r = hashOf(`${seed}:ridge${k}`)
    const pts = [0, 1, 2, 3, 4].map((i) => base + (((r >> (i * 5)) % 17) - 8) * (H / 90))
    const dx = 100 / 4
    let d = `M0 ${H} L0 ${pts[0].toFixed(1)}`
    for (let i = 1; i < 5; i += 1) {
      const cx = (dx * (i - 0.5)).toFixed(1)
      d += ` Q${cx} ${(Math.min(pts[i - 1], pts[i]) - H * 0.05).toFixed(1)} ${(dx * i).toFixed(1)} ${pts[i].toFixed(1)}`
    }
    return `<path d="${d} L100 ${H} Z" fill="hsl(${tone},${sat - 8}%,${lightness}%)"/>`
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 ${H.toFixed(1)}" preserveAspectRatio="xMidYMid slice">` +
    `<defs>` +
    `<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue},${sat}%,34%)"/><stop offset="0.62" stop-color="hsl(${hue2},${sat + 8}%,72%)"/><stop offset="1" stop-color="hsl(${hue2},${sat}%,84%)"/></linearGradient>` +
    `<radialGradient id="l" cx="${sunX}" cy="${sunY.toFixed(1)}" r="${(H * 0.55).toFixed(1)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="hsl(${(hue2 + 12) % 360},90%,92%)" stop-opacity="0.95"/><stop offset="0.35" stop-color="hsl(${hue2},80%,78%)" stop-opacity="0.45"/><stop offset="1" stop-color="hsl(${hue2},70%,60%)" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="v" cx="50" cy="${(H * 0.45).toFixed(1)}" r="${(H * 0.8).toFixed(1)}" gradientUnits="userSpaceOnUse"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.34"/></radialGradient>` +
    `<filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="${n % 97}"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0"/></filter>` +
    `</defs>` +
    `<rect width="100" height="${H.toFixed(1)}" fill="url(#s)"/>` +
    `<rect width="100" height="${H.toFixed(1)}" fill="url(#l)"/>` +
    ridge(horizon - H * 0.06, hue2, 46, 0) +
    ridge(horizon + H * 0.08, hue, 30, 1) +
    ridge(horizon + H * 0.2, hue, 17, 2) +
    `<rect width="100" height="${H.toFixed(1)}" fill="url(#v)"/>` +
    `<rect width="100" height="${H.toFixed(1)}" filter="url(#g)" opacity="0.16"/>` +
    `</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/**
 * Paint the stand-in behind a picsum image the moment it appears, so its frame is never empty while the
 * real photograph travels. A photograph that arrives covers it; one that never arrives leaves it.
 */
function prime(img) {
  const src = img.getAttribute('src') || ''
  if (img.dataset.primed === src) return
  const stand = placeholderFor(src)
  if (!stand) return
  img.dataset.primed = src
  img.style.backgroundImage = `url("${stand}")`
  img.style.backgroundSize = 'cover'
  img.style.backgroundPosition = 'center'
}

/** Replace one failed or waiting image with the stand-in itself. Safe to call twice. */
function swap(img) {
  if (img.dataset.placeholder) return
  const next = placeholderFor(img.getAttribute('src') || img.currentSrc)
  if (!next) return
  img.dataset.placeholder = '1'
  img.removeAttribute('srcset')
  img.src = next
}

/** Call once at start-up. Does nothing outside a browser. */
export function installImageFallback() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  // 1. An image that fails on its own (blocked, 404, offline): error events do not bubble, so listen
  //    on the capture phase.
  document.addEventListener(
    'error',
    (event) => {
      if (event.target instanceof HTMLImageElement) swap(event.target)
    },
    true,
  )

  // 2. Every picture gets its stand-in behind it from the first moment, so no frame is ever empty, and
  //    a picture whose `src` changes (a lightbox reusing one element) is dealt with again.
  let offline = false
  const handle = (img) => {
    const src = img.getAttribute('src') || ''
    if (img.dataset.placeholder && !src.startsWith('data:')) delete img.dataset.placeholder
    prime(img)
    if (offline) swap(img)
  }
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes') handle(record.target)
      for (const node of record.addedNodes) {
        if (node instanceof HTMLImageElement) handle(node)
        else if (node instanceof Element) node.querySelectorAll('img').forEach(handle)
      }
    }
  })
  document.querySelectorAll('img').forEach(handle)
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] })

  // 3. A host that never answers raises no error at all. Ask it for one tiny image; if that has not
  //    arrived after a few seconds, treat the host as unreachable, swap every picture that is waiting
  //    for the stand-in itself, and keep doing so for new ones.
  const goOffline = () => {
    if (offline) return
    offline = true
    document.querySelectorAll('img').forEach(swap)
  }

  const probe = new Image()
  const timer = window.setTimeout(goOffline, PROBE_MS)
  probe.onload = () => window.clearTimeout(timer)
  probe.onerror = () => {
    window.clearTimeout(timer)
    goOffline()
  }
  probe.src = PROBE_URL
}
