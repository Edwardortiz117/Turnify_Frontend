import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getWeeklySchedule,
  listAppointments,
  listBusinessNotifications,
  listProfessionals,
  markAllBusinessNotificationsRead,
  patchBusinessNotification,
} from '../../shared/api/business'
import { endOfDayIso, startOfDayIso, toDateInputValue } from '../../shared/datetime'
import { buildBusinessNotifications } from './buildBusinessNotifications'
import type { AppNotification, NotificationSource } from './types'

const POLL_MS = 30_000

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

  const refresh = useCallback(async () => {
    const today = toDateInputValue()
    const fromDate = shiftDateStr(today, -7)
    const toDate = shiftDateStr(today, 45)
    try {
      const [pros, appts, serverNotes] = await Promise.all([
        listProfessionals(),
        listAppointments({
          from: startOfDayIso(fromDate),
          to: endOfDayIso(toDate),
          limit: 200,
        }),
        listBusinessNotifications({ status: 'unread', limit: 50 }),
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

      const derived = buildBusinessNotifications({
        appointments: appts.items ?? [],
        professionals: active,
        schedulesByProfessionalId: Object.fromEntries(schedules),
        rescheduleRequests: [],
      }).filter((n) => n.id.startsWith('expired:') || n.id.startsWith('full:'))

      const fromServer: AppNotification[] = (serverNotes.items ?? []).map((n) => ({
        id: `server:${n.id}`,
        title: n.title,
        body: n.body,
        href: n.href || '/app/appointments',
        createdAt: n.created_at,
      }))

      const byId = new Map<string, AppNotification>()
      for (const n of [...fromServer, ...derived]) byId.set(n.id, n)
      setItems(
        [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      )
    } catch {
      /* keep previous */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      if (cancelled) return
      await refresh()
    })()
    const id = window.setInterval(() => {
      if (!cancelled) void refresh()
    }, POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !cancelled) void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      cancelled = true
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [refresh])

  const visible = useMemo(() => items, [items])

  async function markAllRead() {
    try {
      await markAllBusinessNotificationsRead()
    } catch {
      /* ignore */
    }
    setItems((prev) => prev.filter((n) => !n.id.startsWith('server:')))
    void refresh()
  }

  async function dismissOne(id: string) {
    if (id.startsWith('server:')) {
      const serverId = id.slice('server:'.length)
      try {
        await patchBusinessNotification(serverId, 'dismissed')
      } catch {
        /* ignore */
      }
    }
    setItems((prev) => prev.filter((n) => n.id !== id))
  }

  return {
    notifications: visible,
    loading,
    unreadCount: visible.length,
    markAllRead,
    dismissOne,
  }
}
