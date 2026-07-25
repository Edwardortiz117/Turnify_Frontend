import { useEffect, useState, type SubmitEvent } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  assignManager,
  getBusiness,
  isUuid,
  patchBusinessStatus,
} from './api'
import type { Business } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert, Button, ConfirmDialog, Input, Label, Badge, Card, EmptyState, PageHeader, PageLoading } from '../../shared/ui'

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
  const [statusLoading, setStatusLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    const reason = suspendReason.trim()
    if (!reason) {
      setError('Indica el motivo de la baja.')
      setConfirmSuspend(false)
      return
    }
    setStatusLoading(true)
    try {
      const res = await patchBusinessStatus(business.id, { status: 'suspended', reason })
      setBusiness({
        ...business,
        status: res.status,
        suspended_at: res.suspended_at,
        suspension_reason: res.suspension_reason,
      })
      toast.success(
        'Negocio dado de baja: vitrina cerrada y acceso de gerentes bloqueado (ACCESS_DISABLED).',
      )
      setConfirmSuspend(false)
      setSuspendReason('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setStatusLoading(false)
    }
  }

  async function onReactivate() {
    if (!business) return
    setError(null)
    try {
      const res = await patchBusinessStatus(business.id, { status: 'active' })
      setBusiness({
        ...business,
        status: res.status,
        suspended_at: res.suspended_at,
        suspension_reason: res.suspension_reason,
      })
      toast.success('Negocio reactivado y acceso de gerentes restaurado.')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onAssignByDocument(e: SubmitEvent) {
    e.preventDefault()
    setError(null)
    const doc = documentId.trim()
    if (!doc) {
      setError('Ingresa el documento del gerente.')
      return
    }
    try {
      await assignManager(businessId, { document: doc })
      toast.success('Gerente vinculado por documento.')
      setDocumentId('')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onAssignByUuid(e: SubmitEvent) {
    e.preventDefault()
    setError(null)
    const id = userId.trim()
    if (!isUuid(id)) {
      setError('El ID debe ser un UUID válido.')
      return
    }
    try {
      await assignManager(businessId, { user_id: id })
      toast.success('Gerente vinculado por UUID.')
      setUserId('')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onCreateAndAssign(e: SubmitEvent) {
    e.preventDefault()
    setError(null)
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
      toast.success('Gerente creado y vinculado al negocio.')
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
        ) : (
          <div className="space-y-3">
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
            <Button
              variant="danger"
              className="w-full sm:w-auto"
              onClick={() => setConfirmSuspend(true)}
            >
              Dar de baja
            </Button>
          </div>
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

      <ConfirmDialog
        open={confirmSuspend}
        title="Dar de baja"
        description="Esto cierra la vitrina y bloquea el login de todos los gerentes del tenant."
        confirmLabel="Confirmar baja"
        danger
        loading={statusLoading}
        onClose={() => setConfirmSuspend(false)}
        onConfirm={() => {
          void onSuspend()
        }}
      />
    </div>
  )
}
