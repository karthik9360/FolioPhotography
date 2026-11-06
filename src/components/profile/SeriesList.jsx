import { useUserTenant } from '../../context/TenantContext'
import { useViewer } from '../../context/ViewerContext'

/** Collections as editorial rows: cover, title, note. Deliberately not cards. */
export default function SeriesList({ series }) {
  const { openPhoto } = useViewer()
  const { photoById } = useUserTenant()

  if (series.length === 0) {
    return <p className="py-6 text-ink-soft">No series yet.</p>
  }

  return (
    <ul>
      {series.map((s) => {
        const cover = photoById(s.photoIds[0])
        const open = () => openPhoto(s.photoIds[0], s.photoIds)
        return (
          <li
            key={s.id}
            className="grid gap-4 py-5 md:grid-cols-12 md:gap-x-5 md:py-6"
          >
            <div className="md:col-span-4">
              <button
                type="button"
                className="photo-tile"
                aria-label={`Open the series ${s.title}`}
                onClick={open}
              >
                <span className="relative block">
                  <span className="photo-frame block" style={{ aspectRatio: '4 / 5' }}>
                    <img src={cover.thumb} alt={cover.alt} width={cover.w} height={cover.h} loading="lazy" decoding="async" />
                  </span>
                  <span className="crop-marks" aria-hidden="true" />
                </span>
              </button>
            </div>

            <div className="flex flex-col justify-end md:col-span-7 md:col-start-6">
              <h3 className="headline">{s.title}</h3>
              <p className="measure mt-4 text-ink-soft">{s.note}</p>
              <p className="caption mt-4 text-ink-soft">{s.photoIds.length} photographs</p>
              <div className="mt-4">
                <button type="button" className="btn btn-quiet" onClick={open}>
                  View series
                </button>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
