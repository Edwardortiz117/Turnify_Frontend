import { apiRequest } from '../../shared/api/client'
import type {
  Appointment,
  Professional,
  PublicBusiness,
  Service,
  Slot,
} from '../../shared/api/types'

export function getBusinessBySlug(slug: string) {
  return apiRequest<PublicBusiness>(`/public/businesses/${encodeURIComponent(slug)}`)
}

export function listPublicServices(slug: string) {
  return apiRequest<Service[]>(`/public/businesses/${encodeURIComponent(slug)}/services`)
}

export function listProfessionalsForService(slug: string, serviceId: string) {
  return apiRequest<Professional[]>(
    `/public/businesses/${encodeURIComponent(slug)}/services/${serviceId}/professionals`,
  )
}

export function listSlots(
  slug: string,
  professionalId: string,
  serviceId: string,
  date: string,
) {
  const q = new URLSearchParams({ date })
  return apiRequest<Slot[]>(
    `/public/businesses/${encodeURIComponent(slug)}/professionals/${professionalId}/services/${serviceId}/slots?${q}`,
  )
}

export function createPublicAppointment(
  slug: string,
  body: {
    professional_id: string
    service_id: string
    starts_at: string
    client: { name: string; phone: string; email?: string | null }
  },
  idempotencyKey: string,
) {
  return apiRequest<Appointment>(`/public/businesses/${encodeURIComponent(slug)}/appointments`, {
    method: 'POST',
    body,
    headers: { 'Idempotency-Key': idempotencyKey },
  })
}

export function cancelPublicAppointment(appointmentId: string, phone: string) {
  return apiRequest<Appointment>(`/public/appointments/${appointmentId}/cancel`, {
    method: 'POST',
    body: { phone },
  })
}
