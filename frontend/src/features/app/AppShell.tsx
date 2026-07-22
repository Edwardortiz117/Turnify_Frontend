import { useAuth } from '../../shared/auth/AuthContext'
import { ShellFrame } from '../../shared/ui/layouts'
import { BusinessNotificationBell } from '../notifications/NotificationBell'

const appLinks = [
  { to: '/app', label: 'Dashboard', end: true },
  { to: '/app/appointments', label: 'Agenda' },
  { to: '/app/services', label: 'Servicios' },
  { to: '/app/professionals', label: 'Profesionales' },
  { to: '/app/availability', label: 'Disponibilidad' },
  { to: '/app/clients', label: 'Clientes' },
]

export function AppShell() {
  const { session, logout } = useAuth()
  return (
    <ShellFrame
      brand="Turnify"
      email={session?.email}
      links={appLinks}
      profileTo="/app/profile"
      headerActions={<BusinessNotificationBell />}
      onLogout={logout}
    />
  )
}
