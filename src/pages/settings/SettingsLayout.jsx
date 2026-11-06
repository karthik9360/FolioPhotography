import { NavLink } from 'react-router-dom'
import CrossfadeOutlet from '../../components/ui/CrossfadeOutlet'

const ORDER = ['/settings/account', '/settings/profile']

/** The settings hub: two editors, Account (sensitive) and Profile (public), that slide and fade between each other. */
export default function SettingsLayout() {
  return (
    <main id="main" className="wrap pb-10 pt-12 md:pt-20">
      <h1 className="display">Settings</h1>

      <nav aria-label="Settings sections" className="label mt-10 border-b border-hairline">
        <NavLink to="/settings/account" className="tab">
          Account
        </NavLink>
        <NavLink to="/settings/profile" className="tab">
          Profile
        </NavLink>
      </nav>

      <CrossfadeOutlet className="settings-stage mt-10 md:mt-14" layerClass="settings-layer" order={ORDER} />
    </main>
  )
}
