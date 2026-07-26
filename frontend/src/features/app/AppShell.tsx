import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getProfile } from '../../shared/api/business'
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
  const [businessName, setBusinessName] = useState<string | undefined>()

  useEffect(() => {
    let cancelled = false
    void getProfile()
      .then((profile) => {
        if (!cancelled && profile.name) setBusinessName(profile.name)
      })
      .catch(() => {
        /* header title is optional */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <ShellFrame
      email={session?.email}
      links={appLinks}
      profileTo="/app/profile"
      headerTitle={businessName}
      primaryAction={
        onAgenda ? undefined : { to: '/app/appointments?new=1', label: 'Nueva cita' }
      }
      headerActions={<BusinessNotificationBell />}
      onLogout={logout}
    />
  )
}
