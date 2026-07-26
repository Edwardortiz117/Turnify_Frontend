import { useLocation } from 'react-router-dom'
import { useAuth } from '../../shared/auth/AuthContext'
import { ShellFrame } from '../../shared/ui'
import { BusinessNotificationBell } from '../notifications/NotificationBell'

const appLinks = [
  { to: '/app', label: 'Dashboard', end: true, section: 'Operación' },
  { to: '/app/appointments', label: 'Agenda', section: 'Operación' },
  { to: '/app/services', label: 'Servicios', section: 'Catálogo' },
  { to: '/app/professionals', label: 'Equipo', section: 'Catálogo' },
  { to: '/app/availability', label: 'Disponibilidad', section: 'Catálogo' },
  { to: '/app/clients', label: 'Clientes', section: 'Relaciones' },
]

export function AppShell() {
  const { session, logout } = useAuth()
  const { pathname } = useLocation()
  const onAgenda = pathname.startsWith('/app/appointments')

  return (
    <ShellFrame
      brand="Turnify"
      email={session?.email}
      links={appLinks}
      profileTo="/app/profile"
      primaryAction={
        onAgenda ? undefined : { to: '/app/appointments?new=1', label: 'Nueva cita' }
      }
      headerActions={<BusinessNotificationBell />}
      onLogout={logout}
    />
  )
}
