import { useEffect, useState, type SubmitEvent } from 'react'
import { toast } from 'sonner'
import {
  createService,
  deleteService,
  listServices,
  updateService,
} from '../../shared/api/business'
import type { Service } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert, Button, ConfirmDialog, Input, Label, Badge, Card, EmptyState, PageHeader, PageLoading } from '../../shared/ui'

export function ServicesPage() {
  const [items, setItems] = useState<Service[]>([])
  const [name, setName] = useState('')
  const [duration, setDuration] = useState(30)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      setItems(await listServices())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function onCreate(e: SubmitEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createService({ name, duration_minutes: duration, active: true })
      setName('')
      toast.success('Servicio creado')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setError(null)
    try {
      await deleteService(deleteTarget.id)
      toast.success('Servicio eliminado')
      setDeleteTarget(null)
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Servicios" subtitle="Catálogo que alimenta la reserva" />
      {error ? (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      <Card className="mb-4" interactive>
        <form
          className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-end"
          onSubmit={onCreate}
        >
          <div className="min-w-0 flex-1 sm:min-w-[180px]">
            <Label>Nombre</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="w-full sm:w-32">
            <Label>Duración (min)</Label>
            <Input
              type="number"
              min={5}
              required
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Agregar
          </Button>
        </form>
      </Card>
      {loading ? (
        <PageLoading />
      ) : items.length === 0 ? (
        <EmptyState title="Sin servicios" description="Crea el primero para publicar tu oferta." />
      ) : (
        <div className="space-y-2">
          {items.map((s) => (
            <Card
              key={s.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted">{s.duration_minutes} min</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Badge tone={s.active ? 'success' : 'neutral'}>
                  {s.active ? 'Activo' : 'Inactivo'}
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    void updateService(s.id, { active: !s.active })
                      .then(() => {
                        toast.success(s.active ? 'Servicio desactivado' : 'Servicio activado')
                        return refresh()
                      })
                      .catch((err) => setError(getErrorMessage(err)))
                  }
                >
                  {s.active ? 'Desactivar' : 'Activar'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setDeleteTarget(s)}
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar servicio"
        description={
          deleteTarget
            ? `Se eliminará «${deleteTarget.name}» del catálogo. Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        danger
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void onDelete()}
      />
    </div>
  )
}
