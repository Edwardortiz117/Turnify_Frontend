import { useAuth } from '../../shared/auth/AuthContext'
import { ShellFrame } from '../../shared/ui/layouts'
import { PlatformNotificationBell } from '../notifications/NotificationBell'

export function PlatformShell() {
  const { session, logout } = useAuth()
  return (
    <ShellFrame
      brand="Turnify"
      badge="Plataforma"
      email={session?.email}
      links={[
        { to: '/platform', label: 'Dashboard', end: true },
        { to: '/platform/businesses', label: 'Negocios' },
      ]}
      profileTo="/platform/account"
      headerActions={<PlatformNotificationBell />}
      onLogout={logout}
    />
  )
}
