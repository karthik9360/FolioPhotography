// Camera metadata for an uploaded photograph. The result uses the keys the upload contract names:
// Camera, Lens, ISO, Aperture, Shutter. Missing values come back as '' (many images carry no EXIF).

const EMPTY = { Camera: '', Lens: '', ISO: '', Aperture: '', Shutter: '' }

/** Turns raw EXIF tags into display strings. Pure, so it is easy to test. */
export function formatExif(raw = {}) {
  const make = String(raw.Make ?? '').trim()
  const model = String(raw.Model ?? '').trim()
  const camera = model.toLowerCase().startsWith(make.toLowerCase()) ? model : `${make} ${model}`.trim()

  const f = Number(raw.FNumber)
  const aperture = f > 0 ? `f/${f.toFixed(1).replace(/\.0$/, '')}` : ''

  const t = Number(raw.ExposureTime)
  const shutter = t > 0 ? (t >= 1 ? `${t} s` : `1/${Math.round(1 / t)} s`) : ''

  const isoValue = Array.isArray(raw.ISO) ? raw.ISO[0] : raw.ISO

  return {
    Camera: camera,
    Lens: String(raw.LensModel ?? '').trim(),
    ISO: isoValue ? String(isoValue) : '',
    Aperture: aperture,
    Shutter: shutter,
  }
}

/** Reads EXIF from a File in the browser. The reader is loaded on demand, so it stays out of the main bundle. */
export async function readExif(file) {
  try {
    const mod = await import('exifr')
    const exifr = mod.default ?? mod
    const raw = await exifr.parse(file, ['Make', 'Model', 'LensModel', 'ISO', 'FNumber', 'ExposureTime'])
    return formatExif(raw ?? {})
  } catch {
    return { ...EMPTY }
  }
}

export const EMPTY_EXIF = EMPTY
