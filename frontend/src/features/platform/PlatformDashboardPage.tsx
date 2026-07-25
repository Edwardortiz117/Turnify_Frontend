import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPlatformDashboard } from './api'
import type { PlatformDashboard } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { formatInTimeZone } from '../../shared/datetime'
import { Alert, Button, Card, PageHeader, PageLoading } from '../../shared/ui'

export function PlatformDashboardPage() {
  const [data, setData] = useState<PlatformDashboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void getPlatformDashboard()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoading />

  const maxDay = Math.max(
    1,
    ...(data?.appointments_by_day_last_7_days?.map((d) => d.count) ?? [1]),
  )

  return (
    <div>
      <PageHeader
        title="Plataforma"
        subtitle="Métricas SaaS"
        actions={
          <Link to="/platform/businesses" className="w-full sm:w-auto">
            <Button className="w-full">Ver negocios</Button>
          </Link>
        }
      />
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Activos</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {data?.businesses_active ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Suspendidos</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {data?.businesses_suspended ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Altas (7d)</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {data?.businesses_created_last_7_days ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Gerentes bloqueados
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {data?.managers_access_locked ?? 0}
          </p>
        </Card>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Confirmadas 7d</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {data?.confirmed_appointments_last_7_days ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Canceladas 7d</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {data?.cancelled_appointments_last_7_days ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Completadas 7d</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {data?.completed_appointments_last_7_days ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Prom. / negocio activo
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {data?.avg_bookings_per_active_business_7d ?? 0}
          </p>
        </Card>
      </div>

      {data?.appointments_by_day_last_7_days && data.appointments_by_day_last_7_days.length > 0 ? (
        <Card className="mt-4">
          <h2 className="mb-3 font-semibold">Citas por día (7d)</h2>
          <ul className="space-y-2">
            {data.appointments_by_day_last_7_days.map((row) => (
              <li key={String(row.date)} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 tabular-nums text-muted">{String(row.date)}</span>
                <div className="h-2 min-w-0 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-brand-500"
                    style={{ width: `${Math.max(8, (row.count / maxDay) * 100)}%` }}
                  />
                </div>
                <span className="w-10 text-right font-semibold tabular-nums">{row.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {data?.top_businesses_by_bookings_7d && data.top_businesses_by_bookings_7d.length > 0 ? (
        <Card className="mt-4">
          <h2 className="mb-3 font-semibold">Top tenants (7d)</h2>
          <ul className="space-y-2 text-sm">
            {data.top_businesses_by_bookings_7d.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2">
                <Link className="font-medium text-brand-800 hover:underline" to={`/platform/businesses/${b.id}`}>
                  {b.name} <span className="text-muted">/{b.slug}</span>
                </Link>
                <span className="font-semibold tabular-nums">{b.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {data?.recent_businesses && data.recent_businesses.length > 0 ? (
        <Card className="mt-4">
          <h2 className="mb-3 font-semibold">Negocios recientes</h2>
          <ul className="space-y-2 text-sm">
            {data.recent_businesses.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {b.name}{' '}
                  <span className="text-muted">/{b.slug}</span>
                </span>
                <span className="text-muted tabular-nums">{formatInTimeZone(b.created_at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  )
}
