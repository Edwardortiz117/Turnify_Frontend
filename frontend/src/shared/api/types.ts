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
  user?: { id: string; email: string; document?: string | null }
  business?: { id: string; name: string; slug: string }
}

export interface Business {
  id: string
  name: string
  slug: string
  timezone?: string
  status?: BusinessStatus
  cancellation_min_hours?: number
  manager_document?: string | null
  suspended_at?: string | null
  suspension_reason?: string | null
  manager?: { id: string; email: string; document?: string | null } | null
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

export interface DashboardAlert {
  code: string
  message: string
  professional_ids?: string[]
}

export interface BusinessDashboard {
  appointments_today?: number
  appointments_tomorrow?: number
  upcoming_next_24h?: number
  confirmed_this_week?: number
  cancelled_this_week?: number
  completed_this_week?: number
  no_show_this_week?: number
  no_show_rate_week?: number
  cancellation_rate_week?: number
  public_bookings_week?: number
  staff_bookings_week?: number
  by_status?: Record<string, number>
  by_professional_today?: Array<{
    professional_id: string
    name: string
    appointments: number
  }>
  top_services_week?: Array<{ service_id: string; name: string; count: number }>
  top_clients_week?: Array<{
    client_id: string
    name: string
    phone?: string
    count: number
  }>
  catalog?: {
    professionals_total: number
    professionals_active: number
    professionals_inactive: number
    services_total: number
    services_active: number
  }
  alerts?: DashboardAlert[]
}

export interface PlatformDashboard {
  businesses_active?: number
  businesses_suspended?: number
  businesses_created_last_7_days?: number
  confirmed_appointments_last_7_days?: number
  cancelled_appointments_last_7_days?: number
  completed_appointments_last_7_days?: number
  no_show_appointments_last_7_days?: number
  avg_bookings_per_active_business_7d?: number
  managers_access_locked?: number
  appointments_by_day_last_7_days?: Array<{ date: string; count: number }>
  top_businesses_by_bookings_7d?: Array<{
    id: string
    name: string
    slug: string
    status?: BusinessStatus
    count: number
  }>
  recent_businesses?: Array<{
    id: string
    name: string
    slug: string
    status?: BusinessStatus
    created_at: string
  }>
}

export interface PlatformLogItem {
  time?: string
  level?: string
  msg?: string
  message?: string
  requestId?: string
  [key: string]: unknown
}

export interface PlatformLogViewer {
  total: number
  buffer_size: number
  buffer_capacity: number
  items: PlatformLogItem[]
}

export interface PlatformHealth {
  status: string
  service: string
  uptime_seconds: number
  database: string
  log_buffer_size: number
  timestamp: string
}

export interface OkTrue {
  ok: boolean
  user_id?: string
}
