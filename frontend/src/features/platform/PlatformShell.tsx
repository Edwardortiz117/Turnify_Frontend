import { useAuth } from '../../shared/auth/AuthContext'
import { ShellFrame } from '../../shared/ui/layouts'
import { PlatformNotificationBell } from '../notifications/NotificationBell'

export function PlatformShell() {
  const { session, logout } = useAuth()
  return (
    <ShellFrame
      brand="Turnify"
      email={session?.email}
      links={[
        { to: '/platform', label: 'Dashboard', end: true },
        { to: '/platform/businesses', label: 'Negocios' },
        { to: '/platform/log-viewer', label: 'Logs' },
        { to: '/platform/health', label: 'Salud' },
      ]}
      profileTo="/platform/account"
      headerActions={<PlatformNotificationBell />}
      onLogout={logout}
    />
  )
}
