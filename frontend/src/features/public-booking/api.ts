import { apiRequest } from '../../shared/api/client'
import type {
  Appointment,
  AvailableSlots,
  Paginated,
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

/** OpenAPI AvailableSlots → unwrap `slots` for callers. */
export async function listSlots(
  slug: string,
  professionalId: string,
  serviceId: string,
  date: string,
): Promise<Slot[]> {
  const q = new URLSearchParams({ date })
  const res = await apiRequest<AvailableSlots>(
    `/public/businesses/${encodeURIComponent(slug)}/professionals/${professionalId}/services/${serviceId}/slots?${q}`,
  )
  return res.slots ?? []
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

export function lookupPublicAppointments(slug: string, phone: string) {
  return apiRequest<Paginated<Appointment>>(
    `/public/businesses/${encodeURIComponent(slug)}/appointments/lookup`,
    { method: 'POST', body: { phone } },
  )
}
