import { useEffect, useState, type FormEvent } from 'react'
import {
  createService,
  deleteService,
  listServices,
  updateService,
} from '../catalog/businessApi'
import type { Service } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Badge, Card, EmptyState, PageHeader, Spinner } from '../../shared/ui/feedback'

export function ServicesPage() {
  const [items, setItems] = useState<Service[]>([])
  const [name, setName] = useState('')
  const [duration, setDuration] = useState(30)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createService({ name, duration_minutes: duration, active: true })
      setName('')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader title="Servicios" subtitle="Catálogo que alimenta la reserva" />
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      <Card className="mb-4">
        <form className="flex flex-wrap items-end gap-3" onSubmit={onCreate}>
          <div className="min-w-[180px] flex-1">
            <Label>Nombre</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="w-32">
            <Label>Duración (min)</Label>
            <Input
              type="number"
              min={5}
              required
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
          <Button type="submit">Agregar</Button>
        </form>
      </Card>
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="Sin servicios" description="Crea el primero para publicar tu oferta." />
      ) : (
        <div className="space-y-2">
          {items.map((s) => (
            <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted">{s.duration_minutes} min</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={s.active ? 'success' : 'neutral'}>
                  {s.active ? 'Activo' : 'Inactivo'}
                </Badge>
                <Button
                  variant="secondary"
                  onClick={() =>
                    void updateService(s.id, { active: !s.active }).then(refresh)
                  }
                >
                  {s.active ? 'Desactivar' : 'Activar'}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm('¿Eliminar servicio?')) void deleteService(s.id).then(refresh)
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
