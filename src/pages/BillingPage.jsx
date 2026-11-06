import ClientBilling from '../components/studio/ClientBilling'
import CreatorBilling from '../components/studio/CreatorBilling'
import { useAuth } from '../context/AuthContext'

/** /studio/billing: the same address, a different view for each role. */
export default function BillingPage() {
  const { user } = useAuth()
  return (
    <main id="main" className="wrap pb-4 pt-5 md:pt-6">
      <h1 className="display">Billing</h1>
      <p className="caption mt-4 text-ink-soft">
        Demonstration figures. Payments here are simulated: no money moves.
      </p>
      <div className="mt-5">{user.role === 'client' ? <ClientBilling /> : <CreatorBilling />}</div>
    </main>
  )
}
