import { useState } from 'react'
import FloatingField from '../auth/FloatingField'
import { useStudioPipeline } from '../../context/StudioContext'
import { formatINR } from '../../lib/money'

/** A minimal, SIMULATED UPI payment. The UPI ID stays in this form and is never stored. */
export default function PaymentPanel({ invoice, onClose }) {
  const { payInvoice } = useStudioPipeline()
  const [upi, setUpi] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reference, setReference] = useState('')

  async function pay(event) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    const result = await payInvoice(invoice.id, { upiId: upi.trim() })
    setBusy(false)
    if (result.ok) setReference(result.reference)
    else setError(result.message)
  }

  if (reference) {
    return (
      <p className="caption mt-4" role="status">
        Paid. Simulated reference <span className="data">{reference}</span>. No money moved.
      </p>
    )
  }

  return (
    <form onSubmit={pay} noValidate className="mt-5 max-w-[26rem]">
      <FloatingField
        label="UPI ID"
        name="upi"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        value={upi}
        onChange={(e) => setUpi(e.target.value)}
        error={error}
        hint="For example name@bank. An ID starting with “decline” shows a declined payment."
      />
      <p className="caption text-ink-soft">Simulated payment: the gateway is pretend and nothing is charged.</p>
      <div className="mt-4 flex items-center gap-4">
        <button type="submit" className="btn btn-primary" aria-busy={busy}>
          {busy ? 'Validating' : `Pay ${formatINR(invoice.amount)}`}
        </button>
        <button type="button" className="link" onClick={onClose} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  )
}
