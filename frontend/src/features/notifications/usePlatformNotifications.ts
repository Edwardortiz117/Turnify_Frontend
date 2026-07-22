import { useCallback, useEffect, useMemo, useState } from 'react'
import { getPlatformDashboard, listBusinesses } from '../platform/api'
import { buildPlatformNotifications } from './buildPlatformNotifications'
import { readDismissedIds, writeDismissedIds } from './dismissStorage'
import type { AppNotification, NotificationSource } from './types'

const POLL_MS = 60_000

export function usePlatformNotifications(): NotificationSource {
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState<Set<string>>(() => readDismissedIds())

  const refresh = useCallback(async () => {
    try {
      const [dash, list] = await Promise.all([
        getPlatformDashboard(),
        listBusinesses(50, 0),
      ])
      setItems(
        buildPlatformNotifications({
          businesses: list.items ?? [],
          dashboard: dash,
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
