import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTopProgress } from '../components/ui/TopProgress'
import { useAuth } from './AuthContext'
import { readExif } from '../lib/exif'
import { DUPLICATE_DISTANCE, analyzeImage, hamming, moodOf } from '../lib/imageAnalysis'
import { tonalNotes } from '../lib/tonal'

/*
 * useCreativeHub: the curation engine and the context-preservation layer.
 *
 * Curation: a photographer stages a batch; each photograph is analysed in the browser (palette,
 * light, a duplicate hash, EXIF) and grouped into mood clusters. Near-identical frames are flagged,
 * and the tonal assistant writes notes and tag suggestions. Photographs can be moved into mood piles.
 * Staged assets live in memory for the session (blob: URLs).
 *
 * Preservation: everything here is kept per identity. Switching Creator -> Client -> Creator returns
 * the photographer to their staged batch and piles, to the feed tab and Explore filter they had, and
 * to the page they left, and one identity never sees another's staged work. Small view state
 * (`recall` / `remember`) also survives a reload, in sessionStorage.
 */

const MEMORY_KEY = 'folio.hub.v1'
const GUEST = 'guest'
const NO_ASSETS = []

function readMemory() {
  try {
    return JSON.parse(sessionStorage.getItem(MEMORY_KEY)) ?? {}
  } catch {
    return {}
  }
}

const MAX_ASSETS = 60
const MAX_BYTES = 25 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const PILES = [
  { id: 'lead', label: 'Lead' },
  { id: 'alternates', label: 'Alternates' },
  { id: 'hold', label: 'Hold' },
]

const CreativeHubContext = createContext(null)

/** Marks each asset that looks like an earlier one. */
function withDuplicates(list) {
  return list.map((asset, i) => {
    const earlier = list.slice(0, i).find((other) => hamming(other.analysis.hash, asset.analysis.hash) <= DUPLICATE_DISTANCE)
    return { ...asset, duplicateOf: earlier?.id ?? null }
  })
}

export function CreativeHubProvider({ children }) {
  const progress = useTopProgress()
  const { user } = useAuth()
  const ownerId = user?.id ?? GUEST
  const [byOwner, setByOwner] = useState({}) // identity id -> staged assets
  const [busy, setBusy] = useState(null) // { done, total } while analysing
  const [message, setMessage] = useState('')
  const assets = byOwner[ownerId] ?? NO_ASSETS
  const assetsRef = useRef(assets)
  assetsRef.current = assets
  const allRef = useRef(byOwner)
  allRef.current = byOwner

  // Edits apply to the identity that was active when the work started, even if the role switches mid-analysis.
  const setAssetsFor = useCallback(
    (owner, update) =>
      setByOwner((prev) => {
        const current = prev[owner] ?? NO_ASSETS
        return { ...prev, [owner]: typeof update === 'function' ? update(current) : update }
      }),
    [],
  )
  const setAssets = useCallback((update) => setAssetsFor(ownerId, update), [setAssetsFor, ownerId])

  // View memory per identity: { [identityId]: { [key]: json } }.
  const memory = useRef(readMemory())
  const ownerRef = useRef(ownerId)
  ownerRef.current = ownerId
  const recallFor = useCallback((owner, key, fallback) => memory.current[owner]?.[key] ?? fallback, [])
  const recall = useCallback((key, fallback) => recallFor(ownerRef.current, key, fallback), [recallFor])
  const remember = useCallback((key, value) => {
    const owner = ownerRef.current
    memory.current = { ...memory.current, [owner]: { ...memory.current[owner], [key]: value } }
    try {
      sessionStorage.setItem(MEMORY_KEY, JSON.stringify(memory.current))
    } catch {
      /* storage full or blocked: the memory lasts for this page load only */
    }
  }, [])

  // Free the object URLs when the app closes.
  useEffect(
    () => () => Object.values(allRef.current).forEach((list) => list.forEach((a) => URL.revokeObjectURL(a.url))),
    [],
  )

  /** Stage a batch: validate, analyse each photograph locally, and add it to the canvas. */
  const stageAssets = useCallback(
    async (fileList) => {
      const owner = ownerRef.current
      setMessage('')
      const files = [...fileList]
      const valid = files.filter((f) => TYPES.includes(f.type) && f.size <= MAX_BYTES)
      const room = MAX_ASSETS - assetsRef.current.length
      const chosen = valid.slice(0, Math.max(0, room))
      if (valid.length < files.length) setMessage('Some files were skipped: use JPEG, PNG or WebP images under 25 MB.')
      if (valid.length > room) setMessage(`The canvas holds up to ${MAX_ASSETS} photographs. The rest were skipped.`)
      if (chosen.length === 0) return { added: 0 }

      setBusy({ done: 0, total: chosen.length })
      progress.start()
      let added = 0
      for (let i = 0; i < chosen.length; i += 1) {
        const file = chosen[i]
        const url = URL.createObjectURL(file)
        try {
          const [analysis, exif] = await Promise.all([analyzeImage(file), readExif(file)])
          const asset = { id: crypto.randomUUID(), name: file.name, url, w: analysis.width, h: analysis.height, analysis, exif, pile: null, tonal: null, duplicateOf: null }
          setAssetsFor(owner, (prev) => withDuplicates([...prev, asset]))
          added += 1
        } catch {
          URL.revokeObjectURL(url)
        }
        setBusy({ done: i + 1, total: chosen.length })
        progress.set((i + 1) / chosen.length)
      }
      progress.finish()
      setBusy(null)
      return { added }
    },
    [progress, setAssetsFor],
  )

  /** Write tonal notes and tag suggestions for the given assets (all of them by default). */
  const generateTonalMetadata = useCallback(async (ids) => {
    const wanted = ids ? new Set(ids) : null
    let count = 0
    setAssets((prev) =>
      prev.map((asset) => {
        if (wanted && !wanted.has(asset.id)) return asset
        count += 1
        return { ...asset, tonal: tonalNotes(asset) }
      }),
    )
    return { count }
  }, [setAssets])

  const movePile = useCallback(
    (id, pile) => {
      setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, pile: a.pile === pile ? null : pile } : a)))
    },
    [setAssets],
  )

  const removeAsset = useCallback(
    (id) => {
      const gone = assetsRef.current.find((a) => a.id === id)
      if (gone) URL.revokeObjectURL(gone.url)
      setAssets((prev) => withDuplicates(prev.filter((a) => a.id !== id)))
    },
    [setAssets],
  )

  const clearAll = useCallback(() => {
    assetsRef.current.forEach((a) => URL.revokeObjectURL(a.url))
    setAssets([])
    setMessage('')
  }, [setAssets])

  const value = useMemo(() => {
    const clusters = []
    for (const asset of assets) {
      const key = moodOf(asset.analysis).key
      const found = clusters.find((c) => c.key === key)
      if (found) found.assets.push(asset)
      else clusters.push({ key, assets: [asset] })
    }
    return {
      assets,
      clusters,
      piles: PILES.map((p) => ({ ...p, assets: assets.filter((a) => a.pile === p.id) })),
      duplicates: assets.filter((a) => a.duplicateOf).length,
      busy,
      message,
      stageAssets,
      generateTonalMetadata,
      movePile,
      removeAsset,
      clearAll,
      recall,
      recallFor,
      remember,
    }
  }, [assets, busy, message, stageAssets, generateTonalMetadata, movePile, removeAsset, clearAll, recall, recallFor, remember])

  return <CreativeHubContext.Provider value={value}>{children}</CreativeHubContext.Provider>
}

export function useCreativeHub() {
  const ctx = useContext(CreativeHubContext)
  if (!ctx) throw new Error('useCreativeHub must be used inside CreativeHubProvider')
  return ctx
}

/**
 * Like useState, but the value is kept for the current identity: leave a workspace and come back (or
 * switch role and switch back) and it is as you left it.
 */
export function useWorkspaceState(key, initial) {
  const { recall, remember } = useCreativeHub()
  const [value, setValue] = useState(() => recall(key, initial))
  const set = useCallback(
    (next) => {
      setValue(next)
      remember(key, next)
    },
    [key, remember],
  )
  return [value, set]
}
