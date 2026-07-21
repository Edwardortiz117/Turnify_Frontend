import type { AppointmentStatus } from '../api/types'
import { Badge } from './feedback'

const LABELS: Record<AppointmentStatus, string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  no_show: 'No asistió',
}

const TONES: Record<AppointmentStatus, 'brand' | 'danger' | 'success' | 'warning'> = {
  confirmed: 'brand',
  cancelled: 'danger',
  completed: 'success',
  no_show: 'warning',
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge tone={TONES[status]}>{LABELS[status]}</Badge>
}
