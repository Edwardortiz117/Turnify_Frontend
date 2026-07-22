import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  assignManager,
  createBusiness,
  getBusiness,
  getPlatformDashboard,
  isUuid,
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
import { Badge, Card, EmptyState, PageHeader, PageLoading } from '../../shared/ui/feedback'

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

export function PlatformBusinessesPage() {
  const [items, setItems] = useState<Business[]>([])
  const [total, setTotal] = useState(0)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [managerDocument, setManagerDocument] = useState('')
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
      const doc = managerDocument.trim()
      await createBusiness({
        name,
        slug,
        timezone: 'America/Bogota',
        ...(doc ? { manager_document: doc } : {}),
      })
      setName('')
      setSlug('')
      setManagerDocument('')
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
        <p className="mb-3 text-sm text-pretty text-muted">
          Camino principal: el gerente se autoregistra. Crear tenant aquí es ops.
        </p>
        <form className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap" onSubmit={onCreate}>
          <div className="min-w-0 flex-1 sm:min-w-[160px]">
            <Label htmlFor="platform-business-name">Nombre</Label>
            <Input
              id="platform-business-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="min-w-0 flex-1 sm:min-w-[140px]">
            <Label htmlFor="platform-business-slug">Slug</Label>
            <Input
              id="platform-business-slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <div className="min-w-0 flex-1 sm:min-w-[160px]">
            <Label htmlFor="platform-manager-document">Documento gerente (opcional)</Label>
            <Input
              id="platform-manager-document"
              autoComplete="off"
              placeholder="Cédula esperada"
              value={managerDocument}
              onChange={(e) => setManagerDocument(e.target.value.replace(/[\s.\-]/g, ''))}
            />
          </div>
          <Button type="submit" className="w-full self-end sm:w-auto">
            Crear
          </Button>
        </form>
      </Card>
      {loading ? (
        <PageLoading />
      ) : items.length === 0 ? (
        <EmptyState
          title="Sin negocios"
          description="Crea el primero para administrar tenants."
          actionLabel="Crear negocio"
          onAction={() => {
            document.getElementById('platform-business-name')?.focus()
          }}
        />
      ) : (
        <div className="space-y-2">
          {items.map((b) => (
            <Card key={b.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">{b.name}</p>
                <p className="text-sm text-muted">/{b.slug}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Badge tone={b.status === 'suspended' ? 'danger' : 'success'}>
                  {b.status ?? 'active'}
                </Badge>
                <Link to={`/platform/businesses/${b.id}`} className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full">
                    Detalle
                  </Button>
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
  const [documentId, setDocumentId] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [suspendReason, setSuspendReason] = useState('')
  const [confirmSuspend, setConfirmSuspend] = useState(false)
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

  async function onSuspend() {
    if (!business) return
    setError(null)
    setMessage(null)
    const reason = suspendReason.trim()
    if (!reason) {
      setError('Indica el motivo de la baja.')
      return
    }
    try {
      const res = await patchBusinessStatus(business.id, { status: 'suspended', reason })
      setBusiness({
        ...business,
        status: res.status,
        suspended_at: res.suspended_at,
        suspension_reason: res.suspension_reason,
      })
      setMessage(
        'Negocio dado de baja: vitrina cerrada y acceso de gerentes bloqueado (ACCESS_DISABLED).',
      )
      setConfirmSuspend(false)
      setSuspendReason('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onReactivate() {
    if (!business) return
    setError(null)
    setMessage(null)
    try {
      const res = await patchBusinessStatus(business.id, { status: 'active' })
      setBusiness({
        ...business,
        status: res.status,
        suspended_at: res.suspended_at,
        suspension_reason: res.suspension_reason,
      })
      setMessage('Negocio reactivado y acceso de gerentes restaurado.')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onAssignByDocument(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const doc = documentId.trim()
    if (!doc) {
      setError('Ingresa el documento del gerente.')
      return
    }
    try {
      await assignManager(businessId, { document: doc })
      setMessage('Gerente vinculado por documento.')
      setDocumentId('')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onAssignByUuid(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const id = userId.trim()
    if (!isUuid(id)) {
      setError('El ID debe ser un UUID válido.')
      return
    }
    try {
      await assignManager(businessId, { user_id: id })
      setMessage('Gerente vinculado por UUID.')
      setUserId('')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onCreateAndAssign(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const doc = documentId.trim()
    if (!doc || !createEmail.trim() || createPassword.length < 8) {
      setError('Completa email, contraseña (≥8) y documento.')
      return
    }
    try {
      await assignManager(businessId, {
        email: createEmail.trim(),
        password: createPassword,
        document: doc,
      })
      setMessage('Gerente creado y vinculado al negocio.')
      setCreateEmail('')
      setCreatePassword('')
      setDocumentId('')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <PageLoading />
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
        {business.manager_document ? (
          <p className="text-sm text-muted">Documento esperado: {business.manager_document}</p>
        ) : null}
        {business.suspension_reason ? (
          <p className="text-sm text-muted">Motivo baja: {business.suspension_reason}</p>
        ) : null}
        {business.manager ? (
          <p className="text-sm">
            Gerente: <span className="font-medium">{business.manager.email}</span>
            {business.manager.document ? (
              <span className="text-muted"> · doc {business.manager.document}</span>
            ) : null}
          </p>
        ) : (
          <p className="text-sm text-muted">Sin gerente vinculado.</p>
        )}

        {business.status === 'suspended' ? (
          <Button className="w-full sm:w-auto" onClick={() => void onReactivate()}>
            Reactivar
          </Button>
        ) : confirmSuspend ? (
          <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-900">
              Esto cierra la vitrina y bloquea el login de todos los gerentes del tenant.
            </p>
            <div>
              <Label htmlFor="suspend-reason">Motivo</Label>
              <Input
                id="suspend-reason"
                required
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Ej. Non-payment"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="danger" className="w-full sm:w-auto" onClick={() => void onSuspend()}>
                Confirmar baja
              </Button>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => setConfirmSuspend(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="danger"
            className="w-full sm:w-auto"
            onClick={() => setConfirmSuspend(true)}
          >
            Dar de baja
          </Button>
        )}
      </Card>

      <Card className="mb-4">
        <h2 className="mb-1 font-semibold">Vincular gerente</h2>
        <p className="mb-3 text-sm text-pretty text-muted">
          Prioriza el documento. El usuario debe existir como gerente sin membresía, o créalo
          abajo.
        </p>
        <form className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap" onSubmit={onAssignByDocument}>
          <div className="min-w-0 flex-1 sm:min-w-[220px]">
            <Label htmlFor="manager-document">Documento del gerente</Label>
            <Input
              id="manager-document"
              required
              autoComplete="off"
              placeholder="Cédula"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value.replace(/[\s.\-]/g, ''))}
            />
          </div>
          <Button type="submit" className="w-full self-end sm:w-auto">
            Vincular
          </Button>
        </form>

        <details
          className="mt-4"
          open={advancedOpen}
          onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary className="cursor-pointer text-sm font-semibold text-brand-800">
            Opciones avanzadas
          </summary>
          <div className="mt-3 space-y-4 border-t border-border pt-3">
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={onCreateAndAssign}>
              <p className="sm:col-span-2 text-sm text-muted">
                Crear usuario business + vincular (email, password, documento).
              </p>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  minLength={8}
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full sm:w-auto">
                  Crear y vincular
                </Button>
              </div>
            </form>
            <form className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap" onSubmit={onAssignByUuid}>
              <div className="min-w-0 flex-1 sm:min-w-[280px]">
                <Label htmlFor="manager-user-id">UUID de usuario</Label>
                <Input
                  id="manager-user-id"
                  autoComplete="off"
                  placeholder="550e8400-e29b-41d4-a716-446655440000"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.trim())}
                />
              </div>
              <Button type="submit" variant="secondary" className="w-full self-end sm:w-auto">
                Vincular por UUID
              </Button>
            </form>
          </div>
        </details>
      </Card>
    </div>
  )
}
