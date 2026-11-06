import RoleSwitcher from './RoleSwitcher'
import ThemeToggle from './ThemeToggle'
import { site } from '../../config/site'

export default function SiteFooter() {
  return (
    <footer className="mt-8 md:mt-8">
      <div className="wrap flex flex-col gap-4 py-4 md:flex-row md:items-baseline md:justify-between">
        <p className="font-display text-sm uppercase tracking-[0.32em]">{site.name}</p>
        <div className="flex flex-col gap-3 md:items-end md:text-right">
          <p className="caption measure text-ink-soft">
            {site.demoNotice} “{site.name}” is a working title.
          </p>
          <ThemeToggle variant="pair" />
          <RoleSwitcher />
        </div>
      </div>
    </footer>
  )
}
