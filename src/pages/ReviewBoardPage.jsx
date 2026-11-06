import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatusMark from '../components/studio/StatusMark'
import Switch from '../components/ui/Switch'
import { useAuth } from '../context/AuthContext'
import { useStudioPipeline } from '../context/StudioContext'
import { useUserTenant } from '../context/TenantContext'
import { formatDate } from '../lib/money'

function Notes({ proof }) {
  const { submitProofFeedback } = useStudioPipeline()
  const [text, setText] = useState('')

  async function send(event) {
    event.preventDefault()
    const result = await submitProofFeedback(proof.id, text)
    if (result.ok) setText('')
  }

  return (
    <div className="mt-3">
      {proof.notes.length > 0 && (
        <ul className="space-y-2">
          {proof.notes.map((note) => (
            <li key={note.id} className="caption">
              <span className="font-medium">{note.author}</span> {note.text}
              <span className="text-ink-soft"> · {formatDate(note.at)}</span>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={send} className="mt-2 flex items-end gap-4">
        <div className="flex-1">
          <label htmlFor={`${proof.id}-note`} className="sr-only">
            Note on this proof
          </label>
          <input
            id={`${proof.id}-note`}
            className="field-input !min-h-10"
            placeholder="Add a production note"
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <button type="submit" className="link mb-2 disabled:opacity-40" disabled={!text.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}

/** The client's entry view: proofs to review, select, approve for retouching, and annotate. */
export default function ReviewBoardPage() {
  const { user } = useAuth()
  const { campaignsFor, proofsFor, approveAssetBatch, deliveries } = useStudioPipeline()
  const { photoById } = useUserTenant()
  const [selected, setSelected] = useState(() => new Set())
  const [watermark, setWatermark] = useState(true)

  const campaign = campaignsFor('client', user.handle)[0]
  if (!campaign) {
    return (
      <main id="main" className="wrap pb-4 pt-6 md:pt-8">
        <h1 className="display">Campaign review</h1>
        <p className="measure mt-4 text-ink-soft">There is no active campaign on this account.</p>
      </main>
    )
  }

  const proofs = proofsFor(campaign.id)
  const approvedCount = proofs.filter((p) => p.status === 'approved').length
  const delivery = deliveries[campaign.id]
  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  async function approve() {
    const ids = [...selected].filter((id) => proofs.find((p) => p.id === id)?.status === 'open')
    setSelected(new Set())
    await approveAssetBatch(ids)
  }

  return (
    <main id="main" className="wrap pb-4 pt-5 md:pt-6">
      <h1 className="display">Campaign review</h1>
      <p className="mt-4 text-xs text-ink-soft">
        {campaign.title} · {campaign.season} · {approvedCount} of {proofs.length} proofs approved
      </p>

      {delivery?.status === 'delivered' && (
        <p className="mt-4 border-y border-hairline py-4" role="status">
          Your final campaign was delivered on {formatDate(delivery.deliveredAt)}: {delivery.photoIds.length} files. Downloading
          is not built yet.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-10 gap-y-2 border-b border-hairline pb-4">
        <Switch
          checked={watermark}
          onChange={setWatermark}
          label="Watermark"
          description="Show the proofs with a watermark, as they are shared outside this board."
        />
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="link"
            onClick={() => setSelected(new Set(proofs.filter((p) => p.status === 'open').map((p) => p.id)))}
          >
            Select all open
          </button>
          <button type="button" className="btn btn-primary" disabled={selected.size === 0} onClick={approve}>
            Approve for retouching{selected.size > 0 ? ` (${selected.size})` : ''}
          </button>
        </div>
      </div>

      <ul className="mt-4 grid gap-x-[var(--gutter)] gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {proofs.map((proof, index) => {
          const photo = photoById(proof.photoId)
          const approved = proof.status === 'approved'
          return (
            <li key={proof.id}>
              <div className="photo-frame watermark-host" data-watermark={watermark} style={{ aspectRatio: 0.8 }}>
                <img src={photo.thumb} alt={photo.alt} width={photo.w} height={photo.h} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" />
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="check"
                    checked={selected.has(proof.id)}
                    disabled={approved}
                    onChange={() => toggle(proof.id)}
                  />
                  <span className="caption">Proof {index + 1}</span>
                </label>
                <span className="flex items-center gap-2 caption">
                  <StatusMark state={approved ? 'approved' : 'open'} />
                  {approved ? 'Approved for retouching' : 'Awaiting review'}
                </span>
              </div>
              <Notes proof={proof} />
            </li>
          )
        })}
      </ul>

      <p className="caption mt-6 text-ink-soft">
        Zoom, region notes and downloads are not built yet. <Link to="/studio/billing" className="link text-ink">Go to billing</Link>
      </p>
    </main>
  )
}
