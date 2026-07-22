import { useEffect, useState, type FormEvent } from 'react'
import {
  cancelAppointment,
  completeAppointment,
  createAppointment,
  listAppointments,
  listProfessionals,
  listServices,
  noShowAppointment,
  rescheduleAppointment,
} from '../catalog/businessApi'
import type { Appointment, Professional, Service } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { endOfDayIso, formatInTimeZone, startOfDayIso, toDateInputValue } from '../../shared/datetime'
import { Alert } from '../../shared/ui/Alert'
import { AppointmentStatusBadge } from '../../shared/ui/AppointmentStatusBadge'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Select } from '../../shared/ui/Select'
import { Card, EmptyState, PageHeader, PageLoading } from '../../shared/ui/feedback'

export function AppointmentsPage() {
  const [from, setFrom] = useState(toDateInputValue())
  const [to, setTo] = useState(toDateInputValue())
  const [items, setItems] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [serviceId, setServiceId] = useState('')
  const [professionalId, setProfessionalId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [forced, setForced] = useState(false)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const res = await listAppointments({
        from: startOfDayIso(from),
        to: endOfDayIso(to),
        limit: 50,
      })
      setItems(res.items ?? [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [from, to])

  useEffect(() => {
    void Promise.all([listServices(), listProfessionals()])
      .then(([s, p]) => {
        setServices(s)
        setProfessionals(p)
        if (s[0]) setServiceId(s[0].id)
        if (p[0]) setProfessionalId(p[0].id)
      })
      .catch(() => undefined)
  }, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createAppointment({
        professional_id: professionalId,
        service_id: serviceId,
        starts_at: new Date(startsAt).toISOString(),
        forced,
        client: { name: clientName, phone: clientPhone },
      })
      setShowForm(false)
      setClientName('')
      setClientPhone('')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function runAction(
    id: string,
    action: 'cancel' | 'complete' | 'no_show' | 'reschedule',
  ) {
    setError(null)
    try {
      if (action === 'cancel') await cancelAppointment(id)
      if (action === 'complete') await completeAppointment(id)
      if (action === 'no_show') await noShowAppointment(id)
      if (action === 'reschedule') {
        const next = window.prompt('Nueva fecha/hora local (YYYY-MM-DDTHH:mm)')
        if (!next) return
        const appt = items.find((a) => a.id === id)
        if (!appt) return
        await rescheduleAppointment(id, {
          professional_id: appt.professional_id,
          starts_at: new Date(next).toISOString(),
        })
      }
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle="Citas del período seleccionado"
        actions={
          <Button className="w-full sm:w-auto" onClick={() => setShowForm((v) => !v)}>
            Nueva cita
          </Button>
        }
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
        <div className="sm:min-w-[10rem]">
          <Label>Desde</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="sm:min-w-[10rem]">
          <Label>Hasta</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}

      {showForm ? (
        <Card className="mb-4">
          <h2 className="mb-3 font-semibold">Cita asistida</h2>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={onCreate}>
            <div>
              <Label>Servicio</Label>
              <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Profesional</Label>
              <Select
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                required
              >
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Inicio</Label>
              <Input
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div>
              <Label>Cliente</Label>
              <Input required value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input required value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={forced}
                onChange={(e) => setForced(e.target.checked)}
              />
              Forzar fuera de disponibilidad
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">
                Crear cita
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {loading ? (
        <PageLoading />
      ) : items.length === 0 ? (
        <EmptyState
          title="Sin citas en este período"
          description="Crea una cita asistida o comparte tu enlace público."
          actionLabel="Nueva cita"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <AppointmentStatusBadge status={a.status} />
                  <span className="font-semibold">
                    {a.client?.name ?? a.client_id}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {formatInTimeZone(a.starts_at)} · {a.service?.name ?? a.service_id} ·{' '}
                  {a.professional?.name ?? a.professional_id}
                </p>
              </div>
              {a.status === 'confirmed' ? (
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => void runAction(a.id, 'complete')}
                  >
                    Marcar completada
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => void runAction(a.id, 'no_show')}
                  >
                    Marcar no asistió
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => void runAction(a.id, 'reschedule')}
                  >
                    Reprogramar
                  </Button>
                  <Button
                    variant="danger"
                    className="w-full sm:w-auto"
                    onClick={() => void runAction(a.id, 'cancel')}
                  >
                    Anular cita
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
