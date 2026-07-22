import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  assignManager,
  createBusiness,
  getBusiness,
  getPlatformDashboard,
  listBusinesses,
  patchBusinessStatus,
} from './api'
import type { Business, PlatformDashboard } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { formatInTimeZone } from '../../shared/datetime'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Badge, Card, EmptyState, PageHeader, Spinner } from '../../shared/ui/feedback'

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

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div>
      <PageHeader
        title="Plataforma"
        subtitle="Métricas agregadas"
        actions={
          <Link to="/platform/businesses">
            <Button>Ver negocios</Button>
          </Link>
        }
      />
      {error ? <Alert>{error}</Alert> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-xs uppercase text-muted">Negocios activos</p>
          <p className="mt-2 text-2xl font-semibold">{data?.businesses_active ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Suspendidos</p>
          <p className="mt-2 text-2xl font-semibold">{data?.businesses_suspended ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Citas confirmadas (7 días)</p>
          <p className="mt-2 text-2xl font-semibold">
            {data?.confirmed_appointments_last_7_days ?? 0}
          </p>
        </Card>
      </div>
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
                <span className="text-muted">{formatInTimeZone(b.created_at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  )
}

export function PlatformBusinessesPage() {
  const [items, setItems] = useState<Business[]>([])
  const [total, setTotal] = useState(0)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const res = await listBusinesses()
      setItems(res.items ?? [])
      setTotal(res.total ?? 0)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createBusiness({ name, slug, timezone: 'America/Bogota' })
      setName('')
      setSlug('')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader title="Negocios" subtitle={`${total} tenants`} />
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      <Card className="mb-4">
        <form className="flex flex-wrap gap-3" onSubmit={onCreate}>
          <div className="min-w-[160px] flex-1">
            <Label>Nombre</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="min-w-[140px] flex-1">
            <Label>Slug</Label>
            <Input required value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <Button type="submit" className="self-end">Crear</Button>
        </form>
      </Card>
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="Sin negocios" />
      ) : (
        <div className="space-y-2">
          {items.map((b) => (
            <Card key={b.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{b.name}</p>
                <p className="text-sm text-muted">/{b.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={b.status === 'suspended' ? 'danger' : 'success'}>
                  {b.status ?? 'active'}
                </Badge>
                <Link to={`/platform/businesses/${b.id}`}>
                  <Button variant="secondary">Detalle</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export function PlatformBusinessDetailPage() {
  const { businessId = '' } = useParams()
  const [business, setBusiness] = useState<Business | null>(null)
  const [userId, setUserId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      setBusiness(await getBusiness(businessId))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [businessId])

  async function toggleStatus() {
    if (!business) return
    const next = business.status === 'suspended' ? 'active' : 'suspended'
    try {
      const res = await patchBusinessStatus(business.id, next)
      setBusiness({ ...business, status: res.status })
      setMessage(`Estado actualizado a ${res.status}.`)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onAssign(e: FormEvent) {
    e.preventDefault()
    try {
      await assignManager(businessId, userId)
      setMessage('Gerente vinculado.')
      setUserId('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <Spinner />
  if (!business) return <EmptyState title="Negocio no encontrado" description={error ?? undefined} />

  return (
    <div>
      <PageHeader title={business.name} subtitle={`/${business.slug}`} />
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      {message ? <div className="mb-3"><Alert tone="success">{message}</Alert></div> : null}
      <Card className="mb-4 space-y-3">
        <p>
          Estado:{' '}
          <Badge tone={business.status === 'suspended' ? 'danger' : 'success'}>
            {business.status ?? 'active'}
          </Badge>
        </p>
        {business.timezone ? (
          <p className="text-sm text-muted">Timezone: {business.timezone}</p>
        ) : null}
        <Button variant="danger" onClick={() => void toggleStatus()}>
          {business.status === 'suspended' ? 'Reactivar' : 'Suspender'}
        </Button>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">Vincular gerente</h2>
        <form className="flex flex-wrap gap-3" onSubmit={onAssign}>
          <div className="min-w-[220px] flex-1">
            <Label>user_id</Label>
            <Input required value={userId} onChange={(e) => setUserId(e.target.value)} />
          </div>
          <Button type="submit" className="self-end">Vincular</Button>
        </form>
      </Card>
    </div>
  )
}
