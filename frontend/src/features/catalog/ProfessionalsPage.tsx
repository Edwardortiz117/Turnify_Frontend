import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  blockProfessional,
  createProfessional,
  getProfessionalServices,
  getWeeklySchedule,
  listExceptions,
  listProfessionals,
  listServices,
  putProfessionalServices,
  unblockProfessional,
} from './businessApi'
import type {
  AvailabilityException,
  Professional,
  Service,
  WeeklySlot,
} from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { formatInTimeZone } from '../../shared/datetime'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Badge, Card, EmptyState, PageHeader, PageLoading, TextLink } from '../../shared/ui/feedback'

const DAY_LABELS: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
}

const formatTime = (value: string) => value.slice(0, 5)

type DetailData = {
  professional: Professional
  offered: Service[]
  schedule: WeeklySlot[]
  exceptions: AvailabilityException[]
}

export const ProfessionalsPage = () => {
  const [items, setItems] = useState<Professional[]>([])
  const [catalogServices, setCatalogServices] = useState<Service[]>([])
  const [name, setName] = useState('')
  const [detail, setDetail] = useState<DetailData | null>(null)
  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [savingServices, setSavingServices] = useState(false)
  const [blockTarget, setBlockTarget] = useState<Professional | null>(null)
  const [cancelFuture, setCancelFuture] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const [pros, svcs] = await Promise.all([listProfessionals(), listServices()])
      setItems(pros)
      setCatalogServices(svcs)
      if (detail) {
        const updated = pros.find((p) => p.id === detail.professional.id)
        if (updated) {
          setDetail((prev) => (prev ? { ...prev, professional: updated } : prev))
        }
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    try {
      await createProfessional({ name, status: 'active' })
      setName('')
      setMessage('Profesional agregado.')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleOpenDetails = async (professional: Professional) => {
    setError(null)
    setMessage(null)
    setDetailLoading(true)
    setBlockTarget(null)
    try {
      const [offered, schedule, exceptions] = await Promise.all([
        getProfessionalServices(professional.id),
        getWeeklySchedule(professional.id),
        listExceptions(professional.id),
      ])
      setDetail({
        professional,
        offered,
        schedule: schedule.slots ?? [],
        exceptions,
      })
      setServiceIds(offered.map((s) => s.id))
    } catch (err) {
      setError(getErrorMessage(err))
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCloseDetails = () => {
    setDetail(null)
    setServiceIds([])
  }

  const handleToggleService = (serviceId: string) => {
    setServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    )
  }

  const handleSaveServices = async () => {
    if (!detail) return
    setSavingServices(true)
    setError(null)
    setMessage(null)
    try {
      const offered = await putProfessionalServices(detail.professional.id, serviceIds)
      setDetail({ ...detail, offered })
      setMessage('Servicios actualizados.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSavingServices(false)
    }
  }

  const handleConfirmBlock = async () => {
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
      if (detail?.professional.id === blockTarget.id) {
        await handleOpenDetails({ ...blockTarget, status: 'inactive' })
      }
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleUnblock = async (p: Professional) => {
    setError(null)
    setMessage(null)
    try {
      await unblockProfessional(p.id)
      setMessage(`${p.name} desbloqueado.`)
      await refresh()
      if (detail?.professional.id === p.id) {
        await handleOpenDetails({ ...p, status: 'active' })
      }
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const scheduleByDay = detail
    ? [...detail.schedule].sort((a, b) => a.day_of_week - b.day_of_week)
    : []

  return (
    <div>
      <PageHeader title="Equipo" subtitle="Profesionales agendables (sin login en MVP)" />
      {error ? (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      {message ? (
        <div className="mb-3">
          <Alert tone="success">{message}</Alert>
        </div>
      ) : null}

      <Card className="mb-4">
        <form className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap" onSubmit={handleCreate}>
          <div className="min-w-0 flex-1 sm:min-w-[200px]">
            <Label htmlFor="professional-name">Nombre</Label>
            <Input
              id="professional-name"
              required
              value={name}
              onChange={handleNameChange}
              autoComplete="name"
            />
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
            <Card
              key={p.id}
              className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${
                detail?.professional.id === p.id ? 'ring-brand-200/70' : ''
              }`}
            >
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
                  aria-expanded={detail?.professional.id === p.id}
                  onClick={() => void handleOpenDetails(p)}
                >
                  Detalles
                </Button>
                {p.status === 'active' ? (
                  <Button
                    variant="danger"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setBlockTarget(p)
                      setCancelFuture(false)
                      setDetail(null)
                    }}
                  >
                    Bloquear
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => void handleUnblock(p)}
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
            <Button
              variant="danger"
              className="w-full sm:w-auto"
              onClick={() => void handleConfirmBlock()}
            >
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

      {detailLoading ? (
        <div className="mt-4">
          <PageLoading />
        </div>
      ) : null}

      {detail && !detailLoading ? (
        <Card className="mt-4 space-y-6" aria-live="polite">
          <div className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-display text-xl text-balance text-ink">
                {detail.professional.name}
              </h2>
              <p className="mt-1 text-sm text-muted">Ficha del profesional</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={detail.professional.status === 'active' ? 'success' : 'neutral'}>
                {detail.professional.status === 'active' ? 'Activo' : 'Bloqueado'}
              </Badge>
              <Button variant="secondary" className="w-full sm:w-auto" onClick={handleCloseDetails}>
                Cerrar
              </Button>
            </div>
          </div>

          <section aria-labelledby="pro-info-heading">
            <h3 id="pro-info-heading" className="mb-3 text-sm font-semibold text-ink">
              Información
            </h3>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <dt className="text-xs font-medium text-muted">Nombre</dt>
                <dd className="mt-0.5 font-medium text-ink">{detail.professional.name}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <dt className="text-xs font-medium text-muted">Estado</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {detail.professional.status === 'active'
                    ? 'Disponible para agenda y vitrina'
                    : 'Bloqueado / inactivo'}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2.5 sm:col-span-2">
                <dt className="text-xs font-medium text-muted">ID</dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-ink">
                  {detail.professional.id}
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="pro-services-heading">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 id="pro-services-heading" className="text-sm font-semibold text-ink">
                  Servicios que ofrece
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  Marca los servicios del catálogo que este profesional puede atender.
                </p>
              </div>
              <Button
                className="w-full sm:w-auto"
                disabled={savingServices}
                aria-busy={savingServices}
                onClick={() => void handleSaveServices()}
              >
                {savingServices ? 'Guardando…' : 'Guardar servicios'}
              </Button>
            </div>
            {catalogServices.length === 0 ? (
              <p className="text-sm text-muted">
                Aún no hay servicios en el catálogo.{' '}
                <TextLink to="/app/services">Crear servicios</TextLink>
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {catalogServices.map((s) => {
                  const checked = serviceIds.includes(s.id)
                  return (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition ${
                        checked
                          ? 'border-brand-200 bg-brand-50/70'
                          : 'border-border bg-card hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={checked}
                        onChange={() => handleToggleService(s.id)}
                      />
                      <span className="min-w-0">
                        <span className="block font-medium text-ink">{s.name}</span>
                        <span className="text-xs text-muted tabular-nums">
                          {s.duration_minutes} min
                          {!s.active ? ' · inactivo en catálogo' : ''}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </section>

          <section aria-labelledby="pro-availability-heading">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 id="pro-availability-heading" className="text-sm font-semibold text-ink">
                  Disponibilidad
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  Horario semanal y excepciones. Para editarlos ve a Disponibilidad.
                </p>
              </div>
              <TextLink to="/app/availability">Editar en Disponibilidad</TextLink>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Horario semanal
                </h4>
                {scheduleByDay.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted">
                    Sin horario configurado.
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-sm">
                    {scheduleByDay.map((slot) => (
                      <li
                        key={`${slot.day_of_week}-${slot.start_time}-${slot.end_time}`}
                        className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                      >
                        <span className="font-medium text-ink">
                          {DAY_LABELS[slot.day_of_week] ?? `Día ${slot.day_of_week}`}
                        </span>
                        <span className="tabular-nums text-muted">
                          {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Excepciones
                </h4>
                {detail.exceptions.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted">
                    Sin bloqueos ni aperturas extra.
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-sm">
                    {detail.exceptions.map((ex) => (
                      <li
                        key={ex.id}
                        className="rounded-lg bg-slate-50 px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={ex.type === 'block' ? 'warning' : 'brand'}>
                            {ex.type === 'block' ? 'Bloqueo' : 'Extra'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-pretty text-muted">
                          {formatInTimeZone(ex.starts_at)} → {formatInTimeZone(ex.ends_at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

         
        </Card>
      ) : null}
    </div>
  )
}
