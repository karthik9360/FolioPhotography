import { formatINR } from '../../lib/money'

/** A campaign's money in plain typographic rows: label left, amount right, a hairline under each. */
export default function SummaryRows({ summary }) {
  const rows = [
    ['Retainer', summary.retainer],
    ['Paid', summary.paid],
    ['Outstanding', summary.outstanding],
    ['Upcoming milestones', summary.upcoming],
  ]
  return (
    <dl className="max-w-[34rem] border-t border-hairline">
      {rows.map(([label, amount]) => (
        <div key={label} className="flex items-baseline justify-between gap-4 border-b border-hairline py-3">
          <dt className="text-ink-soft">{label}</dt>
          <dd className="font-medium tabular-nums">{formatINR(amount)}</dd>
        </div>
      ))}
    </dl>
  )
}
