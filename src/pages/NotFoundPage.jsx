import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main id="main" className="wrap pb-4 pt-8 md:pt-8">
      <h1 className="display">Page not found</h1>
      <p className="measure mt-4 text-xs text-ink-soft">
        That address does not lead anywhere. The portfolio is a good place to start again.
      </p>
      <Link to="/" className="btn btn-primary mt-4">
        Back to portfolio
      </Link>
    </main>
  )
}
