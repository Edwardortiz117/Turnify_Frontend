import { apiRequest } from '../../shared/api/client'
import type {
  Business,
  BusinessStatus,
  OkTrue,
  Paginated,
  PlatformDashboard,
} from '../../shared/api/types'

export function getPlatformDashboard() {
  return apiRequest<PlatformDashboard>('/platform/dashboard', { auth: true })
}

export function listBusinesses(limit = 20, offset = 0) {
  const q = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  return apiRequest<Paginated<Business>>(`/platform/businesses?${q}`, { auth: true })
}

export function createBusiness(body: { name: string; slug: string; timezone?: string }) {
  return apiRequest<Business>('/platform/businesses', { method: 'POST', auth: true, body })
}

export function getBusiness(businessId: string) {
  return apiRequest<Business>(`/platform/businesses/${businessId}`, { auth: true })
}

export function patchBusinessStatus(businessId: string, status: BusinessStatus) {
  return apiRequest<{ id: string; status: BusinessStatus }>(
    `/platform/businesses/${businessId}/status`,
    {
      method: 'PATCH',
      auth: true,
      body: { status },
    },
  )
}

export function assignManager(businessId: string, user_id: string) {
  return apiRequest<OkTrue>(`/platform/businesses/${businessId}/manager`, {
    method: 'POST',
    auth: true,
    body: { user_id },
  })
}
