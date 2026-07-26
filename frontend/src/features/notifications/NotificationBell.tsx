import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBusinessNotifications } from './useBusinessNotifications'
import { usePlatformNotifications } from './usePlatformNotifications'
import type { NotificationSource } from './types'

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9a6 6 0 1 1 12 0c0 3.5 1.5 5 2 6H4c.5-1 2-2.5 2-6Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function NotificationBellPanel({ source }: { source: NotificationSource }) {
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const { notifications, loading, unreadCount, markAllRead, dismissOne } = source

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [open])

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="relative inline-flex size-11 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-ink shadow-sm backdrop-blur-md transition duration-200 hover:border-brand-200 hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        aria-label={
          unreadCount > 0
            ? `Notificaciones, ${unreadCount} sin leer`
            : 'Notificaciones'
        }
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white tabular-nums">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-label="Lista de notificaciones"
          className="glass-popover absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] origin-top-right rounded-xl border border-white/60 bg-white/85 shadow-lg shadow-slate-900/10 backdrop-blur-xl backdrop-saturate-150"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
            <p className="text-sm font-semibold text-ink">Notificaciones</p>
            {notifications.length > 0 ? (
              <button
                type="button"
                className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                onClick={markAllRead}
              >
                Marcar leídas
              </button>
            ) : null}
          </div>
          <ul className="max-h-80 overflow-y-auto py-1" aria-busy={loading}>
            {loading && notifications.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted">Cargando…</li>
            ) : null}
            {!loading && notifications.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted">
                No hay eventualidades por ahora.
              </li>
            ) : null}
            {notifications.map((n) => (
              <li key={n.id} className="border-b border-border/60 last:border-0">
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  <p className="mt-0.5 text-xs text-pretty text-muted">{n.body}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link
                      to={n.href}
                      className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                      onClick={() => {
                        dismissOne(n.id)
                        setOpen(false)
                      }}
                    >
                      Ver detalle
                    </Link>
                    <button
                      type="button"
                      className="text-xs font-medium text-muted hover:text-ink"
                      onClick={() => dismissOne(n.id)}
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export function BusinessNotificationBell() {
  return <NotificationBellPanel source={useBusinessNotifications()} />
}

export function PlatformNotificationBell() {
  return <NotificationBellPanel source={usePlatformNotifications()} />
}
