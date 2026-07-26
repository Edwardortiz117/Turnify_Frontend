import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  cancelAppointment,
  completeAppointment,
  createAppointment,
  getAppointment,
  getProfile,
  listAppointments,
  listProfessionals,
  listServices,
  noShowAppointment,
} from '../../shared/api/business'
import { RescheduleModal } from './RescheduleModal'
import type { Appointment, Professional, Service } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { endOfDayIso, formatInTimeZone, datetimeLocalToUtcIso, startOfDayIso, toDateInputValue } from '../../shared/datetime'
import {
  discardRescheduleRequest,
  findRescheduleRequestByAppointmentId,
} from '../../shared/storage/rescheduleRequestStorage'
import { Alert, AppointmentStatusBadge, Button, ConfirmDialog, Input, Label, Select, Card, EmptyState, PageHeader, PageLoading } from '../../shared/ui'

export const AppointmentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [from, setFrom] = useState(toDateInputValue())
  const [to, setTo] = useState(toDateInputValue())
  const [items, setItems] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null)
  const [rescheduleHint, setRescheduleHint] = useState<string | null>(null)
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [businessSlug, setBusinessSlug] = useState('')
  const [timezone, setTimezone] = useState('America/Bogota')

  const [serviceId, setServiceId] = useState('')
  const [professionalId, setProfessionalId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [forced, setForced] = useState(false)

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowForm(true)
      const next = new URLSearchParams(searchParams)
      next.delete('new')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const rescheduleId = searchParams.get('reschedule')
    const focusParam = searchParams.get('focus')
    if (!rescheduleId && !focusParam) return

    let cancelled = false

    void (async () => {
      try {
        const profile = businessSlug
          ? { slug: businessSlug, timezone }
          : await getProfile()
        if (cancelled) return

        const slug = businessSlug || profile.slug
        const tz =
          timezone ||
          ('timezone' in profile && profile.timezone ? profile.timezone : 'America/Bogota')
        if (!businessSlug) setBusinessSlug(slug)
        if ('timezone' in profile && profile.timezone) setTimezone(profile.timezone)

        const appointmentId = rescheduleId || focusParam
        if (!appointmentId) return

        const appt = await getAppointment(appointmentId)
        if (cancelled) return

        const day = toDateInputValue(new Date(appt.starts_at), tz)
        setFrom(day)
        setTo(day)
        setFocusId(appt.id)

        if (rescheduleId) {
          if (appt.status !== 'confirmed') {
            setError('Esa cita ya no está confirmada; no se puede reprogramar.')
          } else {
            const req = findRescheduleRequestByAppointmentId(slug, rescheduleId)
            setRescheduleHint(req?.message ?? null)
            setPendingRequestId(req?.id ?? null)
            setRescheduleTarget(appt)
          }
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (cancelled) return
        const next = new URLSearchParams(searchParams)
        next.delete('reschedule')
        next.delete('focus')
        setSearchParams(next, { replace: true })
      }
    })()

    return () => {
      cancelled = true
    }
    // Only react to deep-link params; slug/tz may load later via profile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('reschedule'), searchParams.get('focus')])

  useEffect(() => {
    if (!focusId || loading) return
    const el = document.getElementById(`appointment-${focusId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusId, loading, items])

  const refresh = async (opts?: { ignore?: () => boolean }) => {
    const stale = () => opts?.ignore?.() ?? false
    setLoading(true)
    setError(null)
    try {
      const res = await listAppointments({
        from: startOfDayIso(from, timezone),
        to: endOfDayIso(to, timezone),
        limit: 50,
      })
      if (stale()) return
      setItems(res.items ?? [])
    } catch (err) {
      if (stale()) return
      setError(getErrorMessage(err))
    } finally {
      if (!stale()) setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    void refresh({ ignore: () => cancelled })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh on date range / tz only
  }, [from, to, timezone])

  useEffect(() => {
    void Promise.all([listServices(), listProfessionals(), getProfile()])
      .then(([s, p, profile]) => {
        setServices(s)
        setProfessionals(p)
        setBusinessSlug(profile.slug)
        if (profile.timezone) setTimezone(profile.timezone)
        if (s[0]) setServiceId(s[0].id)
        if (p[0]) setProfessionalId(p[0].id)
      })
      .catch(() => undefined)
  }, [])

  const handleCreate = async (e: SubmitEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await createAppointment({
        professional_id: professionalId,
        service_id: serviceId,
        starts_at: datetimeLocalToUtcIso(startsAt, timezone),
        forced,
        client: { name: clientName, phone: clientPhone },
      })
      setShowForm(false)
      setClientName('')
      setClientPhone('')
      toast.success('Cita creada')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleAction = async (id: string, action: 'cancel' | 'complete' | 'no_show') => {
    setError(null)
    setActionLoading(true)
    try {
      if (action === 'cancel') await cancelAppointment(id)
      if (action === 'complete') await completeAppointment(id)
      if (action === 'no_show') await noShowAppointment(id)
      toast.success(
        action === 'cancel'
          ? 'Cita anulada'
          : action === 'complete'
            ? 'Marcada como completada'
            : 'Marcada como no asistió',
      )
      setConfirmCancelId(null)
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenReschedule = (appointment: Appointment) => {
    setError(null)
    if (!businessSlug) {
      setError('No se pudo cargar el negocio. Recarga e intenta de nuevo.')
      return
    }
    const req = findRescheduleRequestByAppointmentId(businessSlug, appointment.id)
    setRescheduleHint(req?.message ?? null)
    setPendingRequestId(req?.id ?? null)
    setRescheduleTarget(appointment)
  }

  const handleCloseReschedule = () => {
    setRescheduleTarget(null)
    setRescheduleHint(null)
    setPendingRequestId(null)
  }

  const handleRescheduleDone = () => {
    if (pendingRequestId && businessSlug) {
      discardRescheduleRequest(businessSlug, pendingRequestId)
    }
    handleCloseReschedule()
    void refresh()
  }

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle="Citas del período seleccionado"
        actions={
          <Button className="w-full sm:w-auto" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cerrar formulario' : 'Nueva cita'}
          </Button>
        }
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
        <div className="sm:min-w-[10rem]">
          <Label htmlFor="agenda-from">Desde</Label>
          <Input
            id="agenda-from"
            type="date"
            value={from}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFrom(e.target.value)}
          />
        </div>
        <div className="sm:min-w-[10rem]">
          <Label htmlFor="agenda-to">Hasta</Label>
          <Input
            id="agenda-to"
            type="date"
            value={to}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTo(e.target.value)}
          />
        </div>
      </div>
      {error ? (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      {rescheduleHint ? (
        <div className="mb-3">
          <Alert tone="info">
            Solicitud del cliente: {rescheduleHint}
          </Alert>
        </div>
      ) : null}

      {showForm ? (
        <Card className="mb-4" interactive>
          <h2 className="mb-3 font-semibold">Cita asistida</h2>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleCreate}>
            <div>
              <Label>Servicio</Label>
              <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
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
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
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
              <Input
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
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
        <div className="space-y-2">
          {items.map((a) => (
            <Card
              key={a.id}
              id={`appointment-${a.id}`}
              className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between${
                focusId === a.id ? ' ring-2 ring-brand-400' : ''
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <AppointmentStatusBadge status={a.status} />
                  <span className="font-semibold">{a.client?.name ?? a.client_id}</span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {formatInTimeZone(a.starts_at, timezone)} · {a.service?.name ?? a.service_id} ·{' '}
                  {a.professional?.name ?? a.professional_id}
                </p>
              </div>
              {a.status === 'confirmed' ? (
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => void handleAction(a.id, 'complete')}
                  >
                    Completada
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => void handleAction(a.id, 'no_show')}
                  >
                    No asistió
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => handleOpenReschedule(a)}
                  >
                    Reprogramar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setConfirmCancelId(a.id)}
                  >
                    Anular
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <RescheduleModal
        open={!!rescheduleTarget}
        appointment={rescheduleTarget}
        slug={businessSlug}
        timezone={timezone}
        onClose={handleCloseReschedule}
        onDone={handleRescheduleDone}
      />

      <ConfirmDialog
        open={!!confirmCancelId}
        title="Anular cita"
        description="Esta acción cancela la cita confirmada. El cliente deberá reservar de nuevo si lo necesita."
        confirmLabel="Anular cita"
        danger
        loading={actionLoading}
        onClose={() => setConfirmCancelId(null)}
        onConfirm={() => {
          if (confirmCancelId) void handleAction(confirmCancelId, 'cancel')
        }}
      />
    </div>
  )
}
