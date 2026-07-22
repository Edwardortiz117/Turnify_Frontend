import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard, getProfile } from '../catalog/businessApi'
import type { AppointmentStatus, BusinessDashboard } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Card, PageHeader, PageLoading, TextLink } from '../../shared/ui/feedback'
import { SegmentedStatBar } from './SegmentedStatBar'
import { WeekAgenda } from './WeekAgenda'

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmadas',
  cancelled: 'Canceladas',
  completed: 'Completadas',
  no_show: 'No asistió',
}

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
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

  if (loading) return <PageLoading />

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen de tu negocio"
        actions={
          <Link to="/app/appointments" className="w-full sm:w-auto">
            <Button className="w-full">Ir a agenda</Button>
          </Link>
        }
      />
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      {slug ? (
        <Card className="mb-4">
          <p className="text-sm text-muted">Enlace de reserva pública</p>
          <p className="mt-1 font-mono text-brand-800">/{slug}</p>
          <TextLink className="mt-2 inline-block" to={`/${slug}`}>
            Abrir vitrina
          </TextLink>
        </Card>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Citas hoy</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{data?.appointments_today ?? 0}</p>
        </Card>
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
          <h2 className="mb-3 font-semibold">Por profesional (hoy)</h2>
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

      <WeekAgenda />
    </div>
  )
}
