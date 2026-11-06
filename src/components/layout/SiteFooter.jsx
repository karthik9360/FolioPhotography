import { site } from '../../config/site'

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-hairline md:mt-40">
      <div className="wrap flex flex-col gap-3 py-10 md:flex-row md:items-baseline md:justify-between">
        <p className="font-display text-xl tracking-[-0.02em]">{site.name}</p>
        <p className="caption measure text-ink-soft">
          {site.demoNotice} “{site.name}” is a working title.
        </p>
      </div>
    </footer>
  )
}
