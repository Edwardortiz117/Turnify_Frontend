import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard, getProfile } from '../../shared/api/business'
import type { AppointmentStatus, BusinessDashboard, DashboardAlert } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert, Card, PageHeader, PageSkeleton, TextLink } from '../../shared/ui'
import { SegmentedStatBar } from './SegmentedStatBar'
import { WeekAgenda } from './WeekAgenda'

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmadas',
  cancelled: 'Canceladas',
  completed: 'Completadas',
  no_show: 'No asistió',
}

const ALERT_CTA: Record<string, { to: string; label: string }> = {
  NO_ACTIVE_PROFESSIONALS: { to: '/app/professionals', label: 'Ir a equipo' },
  PROFESSIONALS_WITHOUT_SCHEDULE: { to: '/app/availability', label: 'Configurar horarios' },
  NO_ACTIVE_SERVICES: { to: '/app/services', label: 'Ir a servicios' },
  HIGH_NO_SHOW_RATE: { to: '/app/appointments', label: 'Revisar agenda' },
}

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

function alertCopy(alert: DashboardAlert): string {
  const map: Record<string, string> = {
    NO_ACTIVE_PROFESSIONALS: 'No hay profesionales activos: la vitrina no puede ofrecer personal.',
    NO_ACTIVE_SERVICES: 'No hay servicios activos en el catálogo.',
    PROFESSIONALS_WITHOUT_SCHEDULE: alert.message,
    HIGH_NO_SHOW_RATE: alert.message,
  }
  return map[alert.code] ?? alert.message
}

function pct(rate?: number): string {
  if (rate == null || Number.isNaN(rate)) return '—'
  return `${Math.round(rate * 100)}%`
}

export function DashboardPage() {
  const [data, setData] = useState<BusinessDashboard | null>(null)
  const [slug, setSlug] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [dash, profile] = await Promise.all([getDashboard(), getProfile()])
        if (cancelled) return
        setData(dash)
        setSlug(profile.slug)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <PageSkeleton />

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen operativo de tu negocio"
      />
      {error ? (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      {slug ? (
        <div className="mb-4 flex flex-col gap-1 rounded-xl border border-white/55 bg-white/70 px-4 py-3 shadow-sm shadow-slate-900/[0.04] backdrop-blur-xl backdrop-saturate-150 sm:flex-row sm:items-center sm:justify-between sm:px-5 glass-panel">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Enlace público
            </p>
            <p className="mt-0.5 font-mono text-sm text-brand-800">/{slug}</p>
          </div>
          <TextLink to={`/${slug}`}>Abrir vitrina</TextLink>
        </div>
      ) : null}

      {data?.alerts && data.alerts.length > 0 ? (
        <div className="mb-4 space-y-2">
          {data.alerts.map((alert) => {
            const cta = ALERT_CTA[alert.code]
            return (
              <Alert key={alert.code} tone="warning">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p>{alertCopy(alert)}</p>
                  {cta ? (
                    <Link to={cta.to} className="shrink-0 font-semibold text-brand-800 underline">
                      {cta.label}
                    </Link>
                  ) : null}
                </div>
              </Alert>
            )
          })}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Hoy</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{data?.appointments_today ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Mañana</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {data?.appointments_tomorrow ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Próx. 24 h</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{data?.upcoming_next_24h ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">No-show (semana)</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{pct(data?.no_show_rate_week)}</p>
        </Card>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Confirmadas esta semana
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <p className="shrink-0 text-2xl font-semibold tabular-nums">
              {data?.confirmed_this_week ?? 0}
            </p>
            <SegmentedStatBar counts={data?.by_status} />
          </div>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Cancelación</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {pct(data?.cancellation_rate_week)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Público (semana)</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {data?.public_bookings_week ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Asistidas (semana)</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {data?.staff_bookings_week ?? 0}
          </p>
        </Card>
        {data?.by_status
          ? Object.entries(data.by_status).map(([status, count]) => (
              <Card key={status}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {statusLabel(status as AppointmentStatus)}
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">{count}</p>
              </Card>
            ))
          : null}
      </div>

      {data?.by_professional_today && data.by_professional_today.length > 0 ? (
        <Card className="mt-4">
          <h2 className="mb-3 font-semibold">Carga del equipo (hoy)</h2>
          <ul className="space-y-2 text-sm">
            {data.by_professional_today.map((row) => (
              <li key={row.professional_id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">{row.name}</span>
                <span className="font-semibold tabular-nums">{row.appointments}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {(data?.top_services_week?.length || data?.top_clients_week?.length) ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {data?.top_services_week && data.top_services_week.length > 0 ? (
            <Card>
              <h2 className="mb-3 font-semibold">Top servicios (semana)</h2>
              <ul className="space-y-2 text-sm">
                {data.top_services_week.map((row) => (
                  <li key={row.service_id} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">{row.name}</span>
                    <span className="font-semibold tabular-nums">{row.count}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
          {data?.top_clients_week && data.top_clients_week.length > 0 ? (
            <Card>
              <h2 className="mb-3 font-semibold">Top clientes (semana)</h2>
              <ul className="space-y-2 text-sm">
                {data.top_clients_week.map((row) => (
                  <li key={row.client_id} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">{row.name}</span>
                    <span className="font-semibold tabular-nums">{row.count}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      ) : null}

      {data?.catalog ? (
        <Card className="mt-4">
          <h2 className="mb-3 font-semibold">Salud del catálogo</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted">Prof. activos</dt>
              <dd className="font-semibold tabular-nums">{data.catalog.professionals_active}</dd>
            </div>
            <div>
              <dt className="text-muted">Prof. inactivos</dt>
              <dd className="font-semibold tabular-nums">{data.catalog.professionals_inactive}</dd>
            </div>
            <div>
              <dt className="text-muted">Servicios activos</dt>
              <dd className="font-semibold tabular-nums">{data.catalog.services_active}</dd>
            </div>
            <div>
              <dt className="text-muted">Servicios total</dt>
              <dd className="font-semibold tabular-nums">{data.catalog.services_total}</dd>
            </div>
          </dl>
        </Card>
      ) : null}

      <WeekAgenda />
    </div>
  )
}
