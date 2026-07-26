import { useAuth } from '../../shared/auth/AuthContext'
import { ShellFrame } from '../../shared/ui'
import { PlatformNotificationBell } from '../notifications/NotificationBell'

export function PlatformShell() {
  const { session, logout } = useAuth()
  return (
    <ShellFrame
      badge="Platform"
      email={session?.email}
      links={[
        { to: '/platform', label: 'Dashboard', end: true, section: 'Overview' },
        { to: '/platform/businesses', label: 'Negocios', section: 'Overview' },
        { to: '/platform/log-viewer', label: 'Logs', section: 'Ops' },
        { to: '/platform/health', label: 'Salud', section: 'Ops' },
      ]}
      profileTo="/platform/account"
      headerActions={<PlatformNotificationBell />}
      onLogout={logout}
    />
  )
}
