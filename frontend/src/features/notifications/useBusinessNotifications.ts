import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getProfile,
  getWeeklySchedule,
  listAppointments,
  listProfessionals,
} from '../../shared/api/business'
import { readRescheduleRequests } from '../../shared/storage/rescheduleRequestStorage'
import { endOfDayIso, startOfDayIso, toDateInputValue } from '../../shared/datetime'
import { buildBusinessNotifications } from './buildBusinessNotifications'
import { readDismissedIds, writeDismissedIds } from './dismissStorage'
import type { AppNotification, NotificationSource } from './types'

const POLL_MS = 60_000

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
    try {
      const [pros, appts, profile] = await Promise.all([
        listProfessionals(),
        listAppointments({
          from: startOfDayIso(fromDate),
          to: endOfDayIso(today),
          limit: 200,
        }),
        getProfile(),
      ])
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
          appointments: appts.items ?? [],
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
    return () => window.clearInterval(id)
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
