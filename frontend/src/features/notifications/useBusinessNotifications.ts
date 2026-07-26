import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getProfile,
  getWeeklySchedule,
  listAppointments,
  listProfessionals,
} from '../../shared/api/business'
import {
  onRescheduleRequestsChanged,
  readRescheduleRequests,
} from '../../shared/storage/rescheduleRequestStorage'
import { endOfDayIso, startOfDayIso, toDateInputValue } from '../../shared/datetime'
import type { Appointment } from '../../shared/api/types'
import { buildBusinessNotifications } from './buildBusinessNotifications'
import { readDismissedIds, writeDismissedIds } from './dismissStorage'
import type { AppNotification, NotificationSource } from './types'

const POLL_MS = 45_000

function shiftDateStr(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays))
  const yy = dt.getUTCFullYear()
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

export function useBusinessNotifications(): NotificationSource {
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState<Set<string>>(() => readDismissedIds())

  const refresh = useCallback(async () => {
    const today = toDateInputValue()
    const fromDate = shiftDateStr(today, -7)
    const toDate = shiftDateStr(today, 45)
    try {
      const [pros, appts, cancelledAppts, profile] = await Promise.all([
        listProfessionals(),
        listAppointments({
          from: startOfDayIso(fromDate),
          to: endOfDayIso(toDate),
          limit: 200,
        }),
        listAppointments({
          from: startOfDayIso(fromDate),
          to: endOfDayIso(toDate),
          status: 'cancelled',
          limit: 100,
        }),
        getProfile(),
      ])
      const byId = new Map<string, Appointment>()
      for (const a of appts.items ?? []) byId.set(a.id, a)
      for (const a of cancelledAppts.items ?? []) byId.set(a.id, a)

      const active = pros.filter((p) => p.status === 'active')
      const schedules = await Promise.all(
        active.map(async (p) => {
          try {
            const schedule = await getWeeklySchedule(p.id)
            return [p.id, schedule.slots ?? []] as const
          } catch {
            return [p.id, []] as const
          }
        }),
      )
      setItems(
        buildBusinessNotifications({
          appointments: [...byId.values()],
          professionals: active,
          schedulesByProfessionalId: Object.fromEntries(schedules),
          rescheduleRequests: readRescheduleRequests(profile.slug),
        }),
      )
    } catch {
      /* keep previous */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const id = window.setInterval(() => void refresh(), POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    const unsub = onRescheduleRequestsChanged(() => void refresh())
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      unsub()
    }
  }, [refresh])

  const visible = useMemo(
    () => items.filter((n) => !dismissed.has(n.id)),
    [items, dismissed],
  )

  function markAllRead() {
    const next = new Set(dismissed)
    for (const n of items) next.add(n.id)
    setDismissed(next)
    writeDismissedIds(next)
  }

  function dismissOne(id: string) {
    const next = new Set(dismissed)
    next.add(id)
    setDismissed(next)
    writeDismissedIds(next)
  }

  return {
    notifications: visible,
    loading,
    unreadCount: visible.length,
    markAllRead,
    dismissOne,
  }
}
