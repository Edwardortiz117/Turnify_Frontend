import { apiRequest } from '../../shared/api/client'
import type {
  Appointment,
  AppointmentStatus,
  AvailabilityException,
  Business,
  Client,
  DashboardBusiness,
  Paginated,
  Professional,
  Service,
  WeeklySlot,
} from '../../shared/api/types'

export function getDashboard() {
  return apiRequest<DashboardBusiness>('/business/dashboard', { auth: true })
}

export function getProfile() {
  return apiRequest<Business>('/business/profile', { auth: true })
}

export function updateProfile(body: Partial<Business>) {
  return apiRequest<Business>('/business/profile', { method: 'PATCH', auth: true, body })
}

export function listServices() {
  return apiRequest<Service[]>('/business/services', { auth: true })
}

export function createService(body: { name: string; duration_minutes: number; active?: boolean }) {
  return apiRequest<Service>('/business/services', { method: 'POST', auth: true, body })
}

export function updateService(
  serviceId: string,
  body: Partial<{ name: string; duration_minutes: number; active: boolean }>,
) {
  return apiRequest<Service>(`/business/services/${serviceId}`, {
    method: 'PATCH',
    auth: true,
    body,
  })
}

export function deleteService(serviceId: string) {
  return apiRequest<void>(`/business/services/${serviceId}`, { method: 'DELETE', auth: true })
}

export function listProfessionals() {
  return apiRequest<Professional[]>('/business/professionals', { auth: true })
}

export function createProfessional(body: { name: string; status?: string }) {
  return apiRequest<Professional>('/business/professionals', { method: 'POST', auth: true, body })
}

export function updateProfessional(
  id: string,
  body: Partial<{ name: string; status: string }>,
) {
  return apiRequest<Professional>(`/business/professionals/${id}`, {
    method: 'PATCH',
    auth: true,
    body,
  })
}

export function getProfessionalServices(professionalId: string) {
  return apiRequest<{ service_ids: string[] }>(
    `/business/professionals/${professionalId}/services`,
    { auth: true },
  )
}

export function putProfessionalServices(professionalId: string, service_ids: string[]) {
  return apiRequest<{ service_ids: string[] }>(
    `/business/professionals/${professionalId}/services`,
    { method: 'PUT', auth: true, body: { service_ids } },
  )
}

export function getWeeklySchedule(professionalId: string) {
  return apiRequest<{ slots: WeeklySlot[] }>(
    `/business/professionals/${professionalId}/weekly-schedule`,
    { auth: true },
  )
}

export function putWeeklySchedule(professionalId: string, slots: WeeklySlot[]) {
  return apiRequest<{ slots: WeeklySlot[] }>(
    `/business/professionals/${professionalId}/weekly-schedule`,
    { method: 'PUT', auth: true, body: { slots } },
  )
}

export function listExceptions(professionalId: string) {
  return apiRequest<AvailabilityException[]>(
    `/business/professionals/${professionalId}/availability-exceptions`,
    { auth: true },
  )
}

export function createException(
  professionalId: string,
  body: Omit<AvailabilityException, 'id'>,
) {
  return apiRequest<AvailabilityException>(
    `/business/professionals/${professionalId}/availability-exceptions`,
    { method: 'POST', auth: true, body },
  )
}

export function deleteException(professionalId: string, exceptionId: string) {
  return apiRequest<void>(
    `/business/professionals/${professionalId}/availability-exceptions/${exceptionId}`,
    { method: 'DELETE', auth: true },
  )
}

export function listAppointments(params: {
  from?: string
  to?: string
  professional_id?: string
  status?: AppointmentStatus
  limit?: number
  offset?: number
}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') q.set(k, String(v))
  })
  const qs = q.toString()
  return apiRequest<Paginated<Appointment>>(
    `/business/appointments${qs ? `?${qs}` : ''}`,
    { auth: true },
  )
}

export function createAppointment(body: {
  professional_id: string
  service_id: string
  starts_at: string
  forced?: boolean
  client: { name: string; phone: string; email?: string }
}) {
  return apiRequest<Appointment>('/business/appointments', { method: 'POST', auth: true, body })
}

export function getAppointment(id: string) {
  return apiRequest<Appointment>(`/business/appointments/${id}`, { auth: true })
}

export function cancelAppointment(id: string) {
  return apiRequest<Appointment>(`/business/appointments/${id}/cancel`, {
    method: 'POST',
    auth: true,
  })
}

export function rescheduleAppointment(
  id: string,
  body: { professional_id: string; starts_at: string; forced?: boolean },
) {
  return apiRequest<Appointment>(`/business/appointments/${id}/reschedule`, {
    method: 'POST',
    auth: true,
    body,
  })
}

export function completeAppointment(id: string) {
  return apiRequest<Appointment>(`/business/appointments/${id}/complete`, {
    method: 'POST',
    auth: true,
  })
}

export function noShowAppointment(id: string) {
  return apiRequest<Appointment>(`/business/appointments/${id}/no-show`, {
    method: 'POST',
    auth: true,
  })
}

export function listClients(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : ''
  return apiRequest<Client[] | Paginated<Client>>(`/business/clients${qs}`, { auth: true })
}

export function updateClient(
  clientId: string,
  body: Partial<{ name: string; phone: string; email: string | null; active: boolean }>,
) {
  return apiRequest<Client>(`/business/clients/${clientId}`, {
    method: 'PATCH',
    auth: true,
    body,
  })
}
