import { NavLink } from 'react-router-dom'
import CrossfadeOutlet from '../../components/ui/CrossfadeOutlet'

const ORDER = ['/settings/account', '/settings/profile']

/** The settings hub: two editors, Account (sensitive) and Profile (public), that slide and fade between each other. */
export default function SettingsLayout() {
  return (
    <main id="main" className="wrap pb-4 pt-5 md:pt-6">
      <h1 className="display">Settings</h1>

      <nav aria-label="Settings sections" className="label mt-4 border-b border-hairline">
        <NavLink to="/settings/account" className="tab">
          Account
        </NavLink>
        <NavLink to="/settings/profile" className="tab">
          Profile
        </NavLink>
      </nav>

      <CrossfadeOutlet className="settings-stage mt-4 md:mt-5" layerClass="settings-layer" order={ORDER} />
    </main>
  )
}
