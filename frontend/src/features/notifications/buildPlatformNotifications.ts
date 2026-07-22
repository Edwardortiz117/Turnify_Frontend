import type { Business, PlatformDashboard } from '../../shared/api/types'
import type { AppNotification } from './types'

export function buildPlatformNotifications(input: {
  now?: Date
  businesses: Business[]
  dashboard: PlatformDashboard | null
}): AppNotification[] {
  const now = input.now ?? new Date()
  const notes: AppNotification[] = []

  const suspended = input.businesses.filter((b) => b.status === 'suspended')
  for (const b of suspended) {
    notes.push({
      id: `suspended:${b.id}`,
      title: 'Negocio suspendido',
      body: `${b.name} (/ ${b.slug}) está suspendido y no acepta reservas.`,
      href: `/platform/businesses/${b.id}`,
      createdAt: now.toISOString(),
    })
  }

  const suspendedCount = input.dashboard?.businesses_suspended ?? suspended.length
  if (suspendedCount >= 3) {
    notes.push({
      id: `suspended-summary:${suspendedCount}`,
      title: 'Varios negocios suspendidos',
      body: `Hay ${suspendedCount} negocios suspendidos en la plataforma.`,
      href: '/platform/businesses',
      createdAt: now.toISOString(),
    })
  }

  const dayAgo = now.getTime() - 24 * 60 * 60 * 1000
  for (const b of input.dashboard?.recent_businesses ?? []) {
    if (new Date(b.created_at).getTime() < dayAgo) continue
    notes.push({
      id: `new-business:${b.id}`,
      title: 'Nuevo negocio',
      body: `${b.name} se registró recientemente. Revisa su estado y gerente.`,
      href: `/platform/businesses/${b.id}`,
      createdAt: b.created_at,
    })
  }

  return notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
