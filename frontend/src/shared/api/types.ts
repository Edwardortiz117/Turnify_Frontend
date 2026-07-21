export type AuthScope = 'business' | 'platform'

export type AppointmentStatus =
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'

export type BusinessStatus = 'active' | 'suspended'

export type ProfessionalStatus = 'active' | 'inactive'

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
  business?: Business
}

export interface Business {
  id: string
  name: string
  slug: string
  timezone?: string
  status?: BusinessStatus
  cancellation_policy_hours?: number
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
  channel?: string
  forced?: boolean
  client?: Client
  service?: Service
  professional?: Professional
}

export interface Slot {
  starts_at: string
  ends_at: string
}

export interface WeeklySlot {
  day_of_week: number
  start_time: string
  end_time: string
}

export interface AvailabilityException {
  id: string
  date: string
  type: 'block' | 'extra_open'
  start_time?: string
  end_time?: string
}

export interface Paginated<T> {
  total: number
  items: T[]
}

export interface PublicBusiness {
  id: string
  name: string
  slug: string
  timezone?: string
  status?: BusinessStatus
  services?: Service[]
}

export interface DashboardBusiness {
  [key: string]: number | string | unknown
}

export interface DashboardPlatform {
  [key: string]: number | string | unknown
}
