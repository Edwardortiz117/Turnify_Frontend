import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { me } from '../auth/api'
import { useAuth } from '../../shared/auth/AuthContext'
import { ShellFrame } from '../../shared/ui'
import { BusinessNotificationBell } from '../notifications/NotificationBell'
import { BusinessSwitcher } from './BusinessSwitcher'

const appLinks = [
  { to: '/app', label: 'Dashboard', end: true, section: 'Operación' },
  { to: '/app/appointments', label: 'Agenda', section: 'Operación' },
  { to: '/app/services', label: 'Servicios', section: 'Catálogo' },
  { to: '/app/professionals', label: 'Equipo', section: 'Catálogo' },
  { to: '/app/availability', label: 'Disponibilidad', section: 'Catálogo' },
  { to: '/app/clients', label: 'Clientes', section: 'Relaciones' },
]

export function AppShell() {
  const { session, patchSession, logout } = useAuth()
  const { pathname } = useLocation()
  const onAgenda = pathname.startsWith('/app/appointments')
  const businesses = session?.businesses ?? []
  const activeId = session?.business_id
  const activeName =
    businesses.find((b) => b.id === activeId)?.name ??
    businesses[0]?.name

  // Refresh memberships for sessions created before multi-business support.
  useEffect(() => {
    if (session?.scope !== 'business') return
    let cancelled = false
    void me()
      .then((data) => {
        if (cancelled) return
        patchSession({
          business_id: data.business_id ?? session.business_id,
          email: data.email || session.email,
          businesses: data.businesses ?? session.businesses,
        })
      })
      .catch(() => {
        /* optional bootstrap */
      })
    return () => {
      cancelled = true
    }
    // Only on mount / token change
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: refresh when access token changes
  }, [session?.access_token])

  return (
    <ShellFrame
      email={session?.email}
      links={appLinks}
      profileTo="/app/profile"
      headerTitle={
        businesses.length > 0 ? (
          <BusinessSwitcher businesses={businesses} activeBusinessId={activeId} />
        ) : (
          activeName
        )
      }
      contentKey={activeId}
      menuExtraLinks={[{ to: '/app/businesses/new', label: 'Nuevo negocio' }]}
      primaryAction={
        onAgenda ? undefined : { to: '/app/appointments?new=1', label: 'Nueva cita' }
      }
      headerActions={<BusinessNotificationBell key={activeId ?? 'none'} />}
      onLogout={logout}
    />
  )
}
