import { useState } from 'react'
import AssetTile from '../components/studio/AssetTile'
import { useCreativeHub } from '../context/CreativeHubContext'

/** /studio/curate: stage a batch, see it grouped by mood with duplicates flagged, and sort it into piles. */
export default function CuratePage() {
  const hub = useCreativeHub()
  const [over, setOver] = useState(false)
  const nameOf = (id) => hub.assets.find((a) => a.id === id)?.name
  const hasAssets = hub.assets.length > 0

  const status = hub.busy
    ? `Analysing ${hub.busy.done} of ${hub.busy.total}…`
    : hasAssets
      ? `${hub.assets.length} ${hub.assets.length === 1 ? 'photograph' : 'photographs'} · ${hub.clusters.length} mood ${hub.clusters.length === 1 ? 'group' : 'groups'} · ${hub.duplicates} possible ${hub.duplicates === 1 ? 'duplicate' : 'duplicates'}`
      : ''

  return (
    <main id="main" className="wrap pb-4 pt-5 md:pt-6">
      <h1 className="display">Curate</h1>
      <p className="measure mt-4 text-xs text-ink-soft">
        Drop a lookbook or campaign batch. Each photograph is analysed in your browser for colour, light and near-duplicates,
        and nothing is uploaded. The assistant is rule-based (colour, light and camera data), not a generative model.
      </p>

      <label
        className="drop mt-5 max-w-[48rem]"
        data-over={over}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          hub.stageAssets(e.dataTransfer.files)
        }}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Choose a batch of photographs"
          onChange={(e) => {
            hub.stageAssets(e.target.files)
            e.target.value = ''
          }}
        />
        <span className="headline block">Drop a batch here</span>
        <span className="mt-2 block text-ink-soft">or click to choose. JPEG, PNG or WebP, up to 60 photographs.</span>
      </label>

      <p className="float-msg" data-tone={hub.message ? 'error' : 'hint'} aria-live="polite">
        {hub.message || status || ' '}
      </p>

      {hasAssets && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button type="button" className="btn btn-primary" disabled={Boolean(hub.busy)} onClick={() => hub.generateTonalMetadata()}>
              Generate tonal notes
            </button>
            <button type="button" className="link text-ink-soft" onClick={hub.clearAll}>
              Clear all
            </button>
          </div>

          {/* Sticky, so the piles stay in reach while you scroll a long batch. */}
          <section className="sticky top-16 z-10 mt-6 bg-paper pb-4 pt-2" aria-labelledby="piles-title">
            <h2 id="piles-title" className="label text-ink-soft">
              Mood piles
            </h2>
            <p className="caption mt-1 text-ink-soft">Drag a photograph onto a pile, or use the buttons under it.</p>
            <div className="mt-3 grid gap-x-[var(--gutter)] gap-y-4 md:grid-cols-3">
              {hub.piles.map((pile) => (
                <div key={pile.id} className="pile" data-pile-target={pile.id}>
                  <p className="flex items-baseline justify-between">
                    <span className="font-medium">{pile.label}</span>
                    <span className="data text-ink-soft">{pile.assets.length}</span>
                  </p>
                  <ul className="mt-3 flex min-h-14 flex-wrap gap-1.5">
                    {pile.assets.map((asset) => (
                      <li key={asset.id}>
                        <img src={asset.url} alt={asset.name} className="h-14 w-11 object-cover" />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {hub.clusters.map((cluster) => (
            <section key={cluster.key} className="mt-6" aria-label={cluster.key}>
              <h2 className="headline">{cluster.key}</h2>
              <p className="caption mt-1 text-ink-soft">
                {cluster.assets.length} {cluster.assets.length === 1 ? 'photograph' : 'photographs'}
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-5 md:grid-cols-3 lg:grid-cols-4">
                {cluster.assets.map((asset) => (
                  <AssetTile
                    key={asset.id}
                    asset={asset}
                    duplicateName={asset.duplicateOf ? nameOf(asset.duplicateOf) : ''}
                    onMove={(pile) => hub.movePile(asset.id, pile)}
                    onRemove={() => hub.removeAsset(asset.id)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </main>
  )
}
