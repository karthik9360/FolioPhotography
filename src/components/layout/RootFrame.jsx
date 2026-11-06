import CrossfadeOutlet from '../ui/CrossfadeOutlet'
import { AuthContext, useAuth } from '../../context/AuthContext'

/**
 * The outermost frame. When the shell changes (signing in or out) or the role changes (the demo role
 * switcher), the old frame slides slightly left and fades out while the new one fades up into view.
 * Ordinary navigation inside a frame is untouched, because the layer key only changes with the shell
 * and the role. The viewport never goes blank.
 */
export default function RootFrame() {
  const auth = useAuth()
  const role = auth.user?.role ?? 'anon'
  return (
    <CrossfadeOutlet
      className="frame-stage"
      layerClass="frame-layer"
      layerKey={(pathname) => (pathname.startsWith('/auth') ? 'auth' : `app:${role}`)}
      freeze={[[AuthContext, auth]]}
    />
  )
}
