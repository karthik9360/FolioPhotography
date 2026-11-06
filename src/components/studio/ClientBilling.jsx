import { useState } from 'react'
import InvoiceLine from './InvoiceLine'
import PaymentPanel from './PaymentPanel'
import SummaryRows from './SummaryRows'
import { useAuth } from '../../context/AuthContext'
import { useStudioPipeline } from '../../context/StudioContext'

/** The client's view: where the campaign stands financially, and a way to pay what is due. */
export default function ClientBilling() {
  const { user } = useAuth()
  const { campaignsFor, invoicesFor, summary } = useStudioPipeline()
  const [payingId, setPayingId] = useState(null)
  const campaigns = campaignsFor('client', user.handle)

  if (campaigns.length === 0) {
    return <p className="measure text-ink-soft">There are no active campaigns on this account.</p>
  }

  return (
    <div className="space-y-8">
      {campaigns.map((campaign) => (
        <section key={campaign.id} aria-labelledby={`${campaign.id}-title`}>
          <h2 id={`${campaign.id}-title`} className="headline">
            {campaign.title}
          </h2>
          <p className="caption mt-2 text-ink-soft">
            {campaign.tier} tier · {campaign.season} · with Studio Karthik
          </p>

          <div className="mt-4">
            <SummaryRows summary={summary(campaign.id)} />
          </div>

          <h3 className="label mt-5 text-ink-soft">Milestones</h3>
          <ul className="mt-2 max-w-[44rem] border-t border-hairline">
            {invoicesFor(campaign.id).map((invoice) => (
              <InvoiceLine key={invoice.id} invoice={invoice}>
                {/* The panel stays mounted through Processing and Paid, so its result is never lost. */}
                {payingId === invoice.id ? (
                  <PaymentPanel invoice={invoice} onClose={() => setPayingId(null)} />
                ) : (
                  invoice.status === 'issued' && (
                    <button type="button" className="btn btn-quiet mt-4" onClick={() => setPayingId(invoice.id)}>
                      Pay now
                    </button>
                  )
                )}
              </InvoiceLine>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
