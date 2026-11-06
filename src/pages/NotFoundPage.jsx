import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main id="main" className="wrap pb-10 pt-24 md:pt-40">
      <h1 className="display">Page not found</h1>
      <p className="measure mt-6 text-[1.0625rem] text-ink-soft">
        That address does not lead anywhere. The portfolio is a good place to start again.
      </p>
      <Link to="/" className="btn btn-primary mt-10">
        Back to portfolio
      </Link>
    </main>
  )
}
