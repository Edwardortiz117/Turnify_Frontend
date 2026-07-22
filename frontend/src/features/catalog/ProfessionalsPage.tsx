import { useEffect, useState, type FormEvent } from 'react'
import {
  createProfessional,
  getProfessionalServices,
  listProfessionals,
  listServices,
  putProfessionalServices,
  updateProfessional,
} from './businessApi'
import type { Professional, Service } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Badge, Card, EmptyState, PageHeader, Spinner } from '../../shared/ui/feedback'

export function ProfessionalsPage() {
  const [items, setItems] = useState<Professional[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [name, setName] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const [pros, svcs] = await Promise.all([listProfessionals(), listServices()])
      setItems(pros)
      setServices(svcs)
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
    try {
      await createProfessional({ name, status: 'active' })
      setName('')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function openOfferings(id: string) {
    setSelectedId(id)
    try {
      const offered = await getProfessionalServices(id)
      setServiceIds(offered.map((s) => s.id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function saveOfferings() {
    if (!selectedId) return
    try {
      await putProfessionalServices(selectedId, serviceIds)
      setSelectedId(null)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader title="Profesionales" subtitle="Quién atiende y qué servicios ofrece" />
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      <Card className="mb-4">
        <form className="flex flex-wrap gap-3" onSubmit={onCreate}>
          <div className="min-w-[200px] flex-1">
            <Label>Nombre</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit" className="self-end">Agregar</Button>
        </form>
      </Card>
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="Sin profesionales" description="Agrega al menos uno para abrir slots." />
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{p.name}</p>
                <Badge tone={p.status === 'active' ? 'success' : 'neutral'}>{p.status}</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => void openOfferings(p.id)}>
                  Servicios
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    void updateProfessional(p.id, {
                      status: p.status === 'active' ? 'inactive' : 'active',
                    }).then(refresh)
                  }
                >
                  {p.status === 'active' ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedId ? (
        <Card className="mt-4">
          <h2 className="mb-3 font-semibold">Ofertas del profesional</h2>
          <div className="space-y-2">
            {services.map((s) => {
              const checked = serviceIds.includes(s.id)
              return (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setServiceIds((prev) =>
                        checked ? prev.filter((id) => id !== s.id) : [...prev, s.id],
                      )
                    }
                  />
                  {s.name}
                </label>
              )
            })}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => void saveOfferings()}>Guardar</Button>
            <Button variant="secondary" onClick={() => setSelectedId(null)}>
              Cerrar
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
