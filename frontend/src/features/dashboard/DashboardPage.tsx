import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard, getProfile } from '../catalog/businessApi'
import type { BusinessDashboard } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Card, PageHeader, Spinner } from '../../shared/ui/feedback'

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

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

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
      {error ? <Alert>{error}</Alert> : null}
      {slug ? (
        <Card className="mb-4">
          <p className="text-sm text-muted">Enlace de reserva pública</p>
          <p className="mt-1 font-mono text-brand-800">/{slug}</p>
          <Link className="mt-2 inline-block text-sm font-semibold text-brand-700" to={`/${slug}`}>
            Abrir vitrina
          </Link>
        </Card>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Citas hoy</p>
          <p className="mt-2 text-2xl font-semibold">{data?.appointments_today ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Confirmadas esta semana</p>
          <p className="mt-2 text-2xl font-semibold">{data?.confirmed_this_week ?? 0}</p>
        </Card>
        {data?.by_status
          ? Object.entries(data.by_status).map(([status, count]) => (
              <Card key={status}>
                <p className="text-xs uppercase tracking-wide text-muted">{status}</p>
                <p className="mt-2 text-2xl font-semibold">{count}</p>
              </Card>
            ))
          : null}
      </div>
      {data?.by_professional_today && data.by_professional_today.length > 0 ? (
        <Card className="mt-4">
          <h2 className="mb-3 font-semibold">Por profesional (hoy)</h2>
          <ul className="space-y-2 text-sm">
            {data.by_professional_today.map((row) => (
              <li key={row.professional_id} className="flex justify-between">
                <span>{row.name}</span>
                <span className="font-semibold">{row.appointments}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  )
}
