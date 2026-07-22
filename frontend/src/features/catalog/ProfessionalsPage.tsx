import { useEffect, useState, type FormEvent } from 'react'
import {
  blockProfessional,
  createProfessional,
  getProfessionalServices,
  listProfessionals,
  listServices,
  putProfessionalServices,
  unblockProfessional,
} from './businessApi'
import type { Professional, Service } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Badge, Card, EmptyState, PageHeader, PageLoading } from '../../shared/ui/feedback'

export function ProfessionalsPage() {
  const [items, setItems] = useState<Professional[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [name, setName] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [blockTarget, setBlockTarget] = useState<Professional | null>(null)
  const [cancelFuture, setCancelFuture] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
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
    setError(null)
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

  async function confirmBlock() {
    if (!blockTarget) return
    setError(null)
    setMessage(null)
    try {
      await blockProfessional(blockTarget.id, cancelFuture)
      setMessage(
        cancelFuture
          ? `${blockTarget.name} bloqueado y citas futuras canceladas.`
          : `${blockTarget.name} bloqueado (no aparece en la vitrina).`,
      )
      setBlockTarget(null)
      setCancelFuture(false)
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onUnblock(p: Professional) {
    setError(null)
    setMessage(null)
    try {
      await unblockProfessional(p.id)
      setMessage(`${p.name} desbloqueado.`)
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader title="Equipo" subtitle="Profesionales agendables (sin login en MVP)" />
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      {message ? <div className="mb-3"><Alert tone="success">{message}</Alert></div> : null}
      <Card className="mb-4">
        <form className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap" onSubmit={onCreate}>
          <div className="min-w-0 flex-1 sm:min-w-[200px]">
            <Label>Nombre</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit" className="w-full self-end sm:w-auto">
            Agregar
          </Button>
        </form>
      </Card>
      {loading ? (
        <PageLoading />
      ) : items.length === 0 ? (
        <EmptyState title="Sin profesionales" description="Agrega al menos uno para abrir slots." />
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{p.name}</p>
                <Badge tone={p.status === 'active' ? 'success' : 'neutral'}>
                  {p.status === 'active' ? 'Activo' : 'Bloqueado'}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => void openOfferings(p.id)}
                >
                  Servicios
                </Button>
                {p.status === 'active' ? (
                  <Button
                    variant="danger"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setBlockTarget(p)
                      setCancelFuture(false)
                    }}
                  >
                    Bloquear
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => void onUnblock(p)}
                  >
                    Desbloquear
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {blockTarget ? (
        <Card className="mt-4 max-w-lg">
          <h2 className="mb-2 font-semibold">Bloquear a {blockTarget.name}</h2>
          <p className="mb-3 text-sm text-pretty text-muted">
            Quedará inactivo: no aparece en la vitrina ni recibe citas nuevas.
          </p>
          <label className="mb-4 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={cancelFuture}
              onChange={(e) => setCancelFuture(e.target.checked)}
            />
            <span>Cancelar también las citas confirmadas futuras</span>
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="danger" className="w-full sm:w-auto" onClick={() => void confirmBlock()}>
              Confirmar bloqueo
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setBlockTarget(null)}
            >
              Cancelar
            </Button>
          </div>
        </Card>
      ) : null}

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
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto" onClick={() => void saveOfferings()}>
              Guardar
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setSelectedId(null)}
            >
              Cerrar
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
