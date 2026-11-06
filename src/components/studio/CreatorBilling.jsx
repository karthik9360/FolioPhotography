import { useState } from 'react'
import FloatingField from '../auth/FloatingField'
import InvoiceLine from './InvoiceLine'
import SummaryRows from './SummaryRows'
import { useStudioPipeline } from '../../context/StudioContext'
import { formatINR } from '../../lib/money'

const TIERS = ['Lookbook', 'Campaign', 'Editorial retainer']

function PackageEditor({ campaign }) {
  const { updatePackage } = useStudioPipeline()
  const [tier, setTier] = useState(campaign.tier)
  const [retainer, setRetainer] = useState(String(campaign.retainer))
  const dirty = tier !== campaign.tier || Number(retainer) !== campaign.retainer

  return (
    <form
      className="mt-4 grid max-w-[34rem] items-end gap-x-8 gap-y-2 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        updatePackage(campaign.id, { tier, retainer })
      }}
    >
      <div>
        <label htmlFor={`${campaign.id}-tier`} className="caption">
          Package tier
        </label>
        <select
          id={`${campaign.id}-tier`}
          className="field-input"
          value={tier}
          onChange={(e) => setTier(e.target.value)}
        >
          {TIERS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <FloatingField
        label="Retainer (INR)"
        name={`${campaign.id}-retainer`}
        inputMode="numeric"
        value={retainer}
        dirty={Number(retainer) !== campaign.retainer}
        onChange={(e) => setRetainer(e.target.value.replace(/[^\d]/g, ''))}
      />
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-quiet" disabled={!dirty}>
          Save package
        </button>
      </div>
    </form>
  )
}

function IssueInvoiceForm({ campaignId }) {
  const { issueInvoice } = useStudioPipeline()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [days, setDays] = useState('14')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    const result = await issueInvoice({ campaignId, title, amount, dueInDays: Number(days) || 14 })
    if (result.ok) {
      setTitle('')
      setAmount('')
      setError('')
    } else {
      setError(result.message)
    }
  }

  return (
    <details className="mt-4 max-w-[34rem]">
      <summary className="link w-fit cursor-pointer">Issue a new invoice</summary>
      <form onSubmit={submit} noValidate className="mt-4">
        <FloatingField label="What is it for" name={`${campaignId}-title`} value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="mt-2 grid gap-x-8 sm:grid-cols-2">
          <FloatingField
            label="Amount (INR)"
            name={`${campaignId}-amount`}
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
          />
          <FloatingField
            label="Due in (days)"
            name={`${campaignId}-days`}
            inputMode="numeric"
            value={days}
            onChange={(e) => setDays(e.target.value.replace(/[^\d]/g, ''))}
          />
        </div>
        <p className="float-msg" data-tone="error" aria-live="polite">
          {error || ' '}
        </p>
        <button type="submit" className="btn btn-primary mt-2">
          Issue invoice
        </button>
      </form>
    </details>
  )
}

/** The photographer's command deck: balances across clients, packages, invoices, and the Paid switch. */
export default function CreatorBilling() {
  const { campaigns, summary, invoicesFor, setInvoicePaid, issueInvoice } = useStudioPipeline()

  return (
    <div>
      <section aria-labelledby="balances-title" className="max-w-[34rem]">
        <h2 id="balances-title" className="label text-ink-soft">
          Outstanding across clients
        </h2>
        <dl className="mt-2 border-t border-hairline">
          {campaigns.map((c) => (
            <div key={c.id} className="flex items-baseline justify-between gap-4 border-b border-hairline py-3">
              <dt>{c.clientName}</dt>
              <dd className="font-medium tabular-nums">{formatINR(summary(c.id).outstanding)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-8 space-y-8">
        {campaigns.map((campaign) => (
          <section key={campaign.id} aria-labelledby={`${campaign.id}-title`}>
            <h2 id={`${campaign.id}-title`} className="headline">
              {campaign.title}
            </h2>
            <p className="caption mt-2 text-ink-soft">
              {campaign.clientName} · {campaign.season}
              {campaign.clientHandle ? '' : ' · no client portal account'}
            </p>

            <div className="mt-4">
              <SummaryRows summary={summary(campaign.id)} />
            </div>
            <PackageEditor key={`${campaign.tier}-${campaign.retainer}`} campaign={campaign} />

            <h3 className="label mt-5 text-ink-soft">Invoices</h3>
            <ul className="mt-2 max-w-[44rem] border-t border-hairline">
              {invoicesFor(campaign.id).map((invoice) => (
                <InvoiceLine key={invoice.id} invoice={invoice}>
                  {invoice.status === 'draft' && (
                    <button type="button" className="btn btn-quiet mt-4" onClick={() => issueInvoice({ draftId: invoice.id })}>
                      Issue invoice
                    </button>
                  )}
                  {(invoice.status === 'issued' || invoice.status === 'paid' || invoice.status === 'processing') && (
                    <div className="mt-3 flex items-center gap-3">
                      <span id={`${invoice.id}-paid`} className="caption text-ink-soft">
                        Invoice paid
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={invoice.status === 'paid'}
                        aria-labelledby={`${invoice.id}-paid`}
                        className="switch"
                        disabled={invoice.status === 'processing'}
                        onClick={() => setInvoicePaid(invoice.id, invoice.status !== 'paid')}
                      >
                        <span className="switch-thumb" />
                      </button>
                    </div>
                  )}
                </InvoiceLine>
              ))}
            </ul>
            <IssueInvoiceForm campaignId={campaign.id} />
          </section>
        ))}
      </div>
    </div>
  )
}
