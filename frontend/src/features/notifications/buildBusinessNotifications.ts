import type { Appointment, Professional, WeeklySlot } from '../../shared/api/types'
import { toDateInputValue } from '../../shared/datetime'
import type { RescheduleRequest } from '../../shared/storage/rescheduleRequestStorage'
import type { AppNotification } from './types'

const ALMOST_FULL_RATIO = 0.8
const SLOT_MINUTES_FALLBACK = 30
/** Cancelled appointments older than this (by starts_at) are ignored. */
const CANCELLED_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000

/** OpenAPI: 1=Mon … 7=Sun */
function dayOfWeekMon1(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const utcDow = new Date(Date.UTC(y, m - 1, d)).getUTCDay() // Sun=0
  return utcDow === 0 ? 7 : utcDow
}

function parseHmToMinutes(time: string): number {
  const [h, min] = time.slice(0, 5).split(':').map(Number)
  return h * 60 + min
}

function openMinutesForDay(slots: WeeklySlot[], day: number): number {
  return slots
    .filter((s) => s.day_of_week === day)
    .reduce((sum, s) => {
      const start = parseHmToMinutes(s.start_time)
      const end = parseHmToMinutes(s.end_time)
      return sum + Math.max(0, end - start)
    }, 0)
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function buildBusinessNotifications(input: {
  now?: Date
  appointments: Appointment[]
  professionals: Professional[]
  schedulesByProfessionalId: Record<string, WeeklySlot[]>
  rescheduleRequests?: RescheduleRequest[]
}): AppNotification[] {
  const now = input.now ?? new Date()
  const today = toDateInputValue(now)
  const todayDow = dayOfWeekMon1(today)
  const notifications: AppNotification[] = []
  const cancelledCutoff = now.getTime() - CANCELLED_LOOKBACK_MS

  for (const req of input.rescheduleRequests ?? []) {
    const who = req.clientName?.trim() || req.phone
    notifications.push({
      id: `reschedule-req:${req.id}`,
      title: 'Solicitud de reprogramación',
      body: `${who}: ${req.message}`,
      href: `/app/appointments?reschedule=${encodeURIComponent(req.appointmentId)}`,
      createdAt: req.createdAt,
    })
  }

  for (const a of input.appointments) {
    if (a.status !== 'cancelled') continue
    // Skip staff-cancelled (manager already acted); notify public / unknown channel.
    if (a.channel === 'staff') continue
    const startsMs = new Date(a.starts_at).getTime()
    if (startsMs < cancelledCutoff) continue

    const client = a.client?.name ?? 'un cliente'
    notifications.push({
      id: `cancelled:${a.id}`,
      title: 'Cita cancelada',
      body: `${client} canceló la cita del ${formatWhen(a.starts_at)}.`,
      href: `/app/appointments?focus=${encodeURIComponent(a.id)}`,
      createdAt: a.starts_at,
    })
  }

  for (const a of input.appointments) {
    if (a.status !== 'confirmed') continue
    if (new Date(a.starts_at).getTime() >= now.getTime()) continue

    const client = a.client?.name ?? 'un cliente'
    notifications.push({
      id: `expired:${a.id}`,
      title: 'Reservación vencida',
      body: `La cita de ${client} (${formatWhen(a.starts_at)}) ya pasó y sigue confirmada.`,
      href: `/app/appointments?focus=${encodeURIComponent(a.id)}`,
      createdAt: a.starts_at,
    })
  }

  const confirmedToday = input.appointments.filter(
    (a) =>
      a.status === 'confirmed' &&
      toDateInputValue(new Date(a.starts_at)) === today,
  )

  for (const pro of input.professionals) {
    if (pro.status !== 'active') continue
    const slots = input.schedulesByProfessionalId[pro.id] ?? []
    const openMin = openMinutesForDay(slots, todayDow)
    if (openMin <= 0) continue

    const capacity = Math.max(1, Math.floor(openMin / SLOT_MINUTES_FALLBACK))
    const count = confirmedToday.filter((a) => a.professional_id === pro.id).length
    const ratio = count / capacity
    if (ratio < ALMOST_FULL_RATIO) continue

    const pct = Math.round(ratio * 100)
    notifications.push({
      id: `full:${pro.id}:${today}`,
      title: 'Agenda casi llena',
      body: `${pro.name} tiene ${count} de ~${capacity} espacios hoy (${pct}%).`,
      href: '/app/availability',
      createdAt: now.toISOString(),
    })
  }

  return notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
