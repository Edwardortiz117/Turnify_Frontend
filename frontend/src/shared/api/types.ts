export type AuthScope = 'business' | 'platform'

export type AppointmentStatus =
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'

export type BusinessStatus = 'active' | 'suspended'

export type ProfessionalStatus = 'active' | 'inactive'

export type AppointmentChannel = 'self_service' | 'staff'

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export interface UserMe {
  user_id: string
  email: string
  scope: AuthScope
  business_id?: string
}

export interface AuthTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: AuthScope
  business_id?: string
  user?: { id: string; email: string }
  business?: { id: string; name: string; slug: string }
}

export interface Business {
  id: string
  name: string
  slug: string
  timezone?: string
  status?: BusinessStatus
  /** OpenAPI: cancellation_min_hours */
  cancellation_min_hours?: number
}

export interface Service {
  id: string
  name: string
  duration_minutes: number
  active: boolean
}

export interface Professional {
  id: string
  name: string
  status: ProfessionalStatus
}

export interface Client {
  id: string
  name: string
  phone: string
  email?: string | null
  active: boolean
}

export interface Appointment {
  id: string
  status: AppointmentStatus
  starts_at: string
  ends_at: string
  professional_id: string
  service_id: string
  client_id: string
  channel?: AppointmentChannel
  forced?: boolean
  client?: Pick<Client, 'id' | 'name' | 'phone'>
  service?: Pick<Service, 'name' | 'duration_minutes'>
  professional?: Pick<Professional, 'name'>
}

export interface Slot {
  starts_at: string
  ends_at: string
}

export interface AvailableSlots {
  date: string
  professional_id: string
  service_id: string
  slots: Slot[]
}

export interface WeeklySlot {
  id?: string
  day_of_week: number
  start_time: string
  end_time: string
}

export interface WeeklySchedule {
  slots: WeeklySlot[]
}

export interface AvailabilityException {
  id: string
  starts_at: string
  ends_at: string
  type: 'block' | 'extra_open'
}

export interface Paginated<T> {
  total: number
  items: T[]
}

export interface PublicBusiness extends Business {
  services?: Service[]
}

export interface BusinessDashboard {
  appointments_today?: number
  confirmed_this_week?: number
  by_status?: Record<string, number>
  by_professional_today?: Array<{
    professional_id: string
    name: string
    appointments: number
  }>
}

export interface PlatformDashboard {
  businesses_active?: number
  businesses_suspended?: number
  confirmed_appointments_last_7_days?: number
  recent_businesses?: Array<{
    id: string
    name: string
    slug: string
    created_at: string
  }>
}

export interface OkTrue {
  ok: boolean
}
