import { formatDate, formatINR } from '../../lib/money'

export function invoiceStatus(invoice, now = Date.now()) {
  if (invoice.status === 'paid') return { key: 'paid', label: 'Paid' }
  if (invoice.status === 'processing') return { key: 'processing', label: 'Processing' }
  if (invoice.status === 'draft') return { key: 'draft', label: 'Upcoming' }
  return invoice.dueAt < now
    ? { key: 'overdue', label: 'Overdue' }
    : { key: 'issued', label: `Due ${formatDate(invoice.dueAt)}` }
}

/** One invoice as a row of type: title and number, amount, status. `children` holds its actions. */
export default function InvoiceLine({ invoice, children }) {
  const status = invoiceStatus(invoice)
  return (
    <li className="border-b border-hairline py-5">
      <div className="grid items-baseline gap-x-6 gap-y-1 sm:grid-cols-[minmax(0,1fr)_8rem_9rem]">
        <div>
          <p className="font-medium">{invoice.title}</p>
          <p className="caption text-ink-soft">
            {invoice.number || 'Not issued yet'}
            {invoice.status === 'paid' && invoice.paidVia ? ` · ${invoice.paidVia}` : ''}
          </p>
        </div>
        <p className="font-medium tabular-nums sm:text-right">{formatINR(invoice.amount)}</p>
        <p className="status caption sm:text-right" data-status={status.key}>
          {status.label}
        </p>
      </div>
      {children}
    </li>
  )
}
