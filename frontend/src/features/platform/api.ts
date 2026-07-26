import { apiRequest } from '../../shared/api/client'
import type {
  Business,
  BusinessStatus,
  Paginated,
  PlatformDashboard,
  PlatformHealth,
  PlatformLogViewer,
} from '../../shared/api/types'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim())
}

export function getPlatformDashboard() {
  return apiRequest<PlatformDashboard>('/platform/dashboard', { auth: true })
}

export function getPlatformHealth() {
  return apiRequest<PlatformHealth>('/platform/health', { auth: true })
}

export function getPlatformLogs(params?: {
  level?: string
  limit?: number
  q?: string
}) {
  const q = new URLSearchParams()
  if (params?.level) q.set('level', params.level)
  if (params?.limit) q.set('limit', String(params.limit))
  if (params?.q) q.set('q', params.q)
  const qs = q.toString()
  return apiRequest<PlatformLogViewer>(`/platform/log-viewer${qs ? `?${qs}` : ''}`, {
    auth: true,
  })
}

export function listBusinesses(limit = 20, offset = 0) {
  const q = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  return apiRequest<Paginated<Business>>(`/platform/businesses?${q}`, { auth: true })
}

export function createBusiness(body: {
  name: string
  slug: string
  timezone?: string
  manager_document?: string
}) {
  return apiRequest<Business>('/platform/businesses', { method: 'POST', auth: true, body })
}

export function getBusiness(businessId: string) {
  return apiRequest<Business>(`/platform/businesses/${businessId}`, { auth: true })
}

export function patchBusinessStatus(
  businessId: string,
  body: { status: BusinessStatus; reason?: string },
) {
  return apiRequest<{
    id: string
    status: BusinessStatus
    suspended_at?: string | null
    suspension_reason?: string | null
    managers_access_enabled?: boolean
  }>(`/platform/businesses/${businessId}/status`, {
    method: 'PATCH',
    auth: true,
    body,
  })
}

export function createManager(body: { email: string; password: string; document: string }) {
  return apiRequest<{ id: string; email: string; document: string; scope: string }>(
    '/platform/managers',
    { method: 'POST', auth: true, body },
  )
}

/** Link manager: document | user_id | create+assign (email+password+document). */
export function assignManager(
  businessId: string,
  body:
    | { document: string }
    | { user_id: string }
    | { email: string; password: string; document: string },
) {
  return apiRequest<{
    business_id?: string
    manager?: { id: string; email: string; document?: string | null }
    ok?: boolean
  }>(`/platform/businesses/${businessId}/manager`, {
    method: 'POST',
    auth: true,
    body,
  })
}
