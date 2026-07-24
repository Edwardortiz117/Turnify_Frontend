import { useEffect, useState, type ChangeEvent } from 'react'
import {
  listAvailableSlots,
  listProfessionalsOfferingService,
  rescheduleAppointment,
} from '../catalog/businessApi'
import type { Appointment, Professional, Slot } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import {
  formatInTimeZone,
  formatTimeInZone,
  toDateInputValue,
} from '../../shared/datetime'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Modal } from '../../shared/ui/Modal'
import { Select } from '../../shared/ui/Select'
import { EmptyState, Spinner } from '../../shared/ui/feedback'

type RescheduleModalProps = {
  open: boolean
  appointment: Appointment | null
  slug: string
  timezone?: string
  onClose: () => void
  onDone: () => void
}

export const RescheduleModal = ({
  open,
  appointment,
  slug,
  timezone = 'America/Bogota',
  onClose,
  onDone,
}: RescheduleModalProps) => {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [professionalId, setProfessionalId] = useState('')
  const [date, setDate] = useState(toDateInputValue())
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [loadingPros, setLoadingPros] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !appointment || !slug) return
    let cancelled = false
    setError(null)
    setSelectedSlot(null)
    setDate(toDateInputValue(new Date(appointment.starts_at), timezone))
    setProfessionalId(appointment.professional_id)
    setLoadingPros(true)

    void listProfessionalsOfferingService(slug, appointment.service_id)
      .then((list) => {
        if (cancelled) return
        const active = list.filter((p) => p.status === 'active')
        setProfessionals(active)
        if (!active.some((p) => p.id === appointment.professional_id) && active[0]) {
          setProfessionalId(active[0].id)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoadingPros(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, appointment, slug, timezone])

  useEffect(() => {
    if (!open || !appointment || !slug || !professionalId || !date) return
    let cancelled = false
    setLoadingSlots(true)
    setSelectedSlot(null)
    setError(null)

    void listAvailableSlots(slug, professionalId, appointment.service_id, date)
      .then((list) => {
        if (!cancelled) setSlots(list)
      })
      .catch((err) => {
        if (!cancelled) {
          setSlots([])
          setError(getErrorMessage(err))
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, appointment, slug, professionalId, date])

  const handleProfessionalChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setProfessionalId(e.target.value)
  }

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
  }

  const handleConfirm = async () => {
    if (!appointment || !selectedSlot) return
    setSaving(true)
    setError(null)
    try {
      await rescheduleAppointment(appointment.id, {
        professional_id: professionalId,
        starts_at: selectedSlot.starts_at,
      })
      onDone()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (!appointment) return null

  return (
    <Modal open={open} title="Reprogramar cita" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-pretty text-muted">
          {appointment.client?.name ?? 'Cliente'} ·{' '}
          {appointment.service?.name ?? 'Servicio'} · actual{' '}
          {formatInTimeZone(appointment.starts_at, timezone)}
        </p>

        {error ? <Alert>{error}</Alert> : null}

        <div>
          <Label htmlFor="reschedule-pro">Profesional</Label>
          {loadingPros ? (
            <Spinner />
          ) : (
            <Select
              id="reschedule-pro"
              value={professionalId}
              onChange={handleProfessionalChange}
              required
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div>
          <Label htmlFor="reschedule-date">Día</Label>
          <Input
            id="reschedule-date"
            type="date"
            value={date}
            min={toDateInputValue()}
            onChange={handleDateChange}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Horarios disponibles</p>
          {loadingSlots ? <Spinner /> : null}
          {!loadingSlots && slots.length === 0 ? (
            <EmptyState
              title="Sin horarios"
              description="Prueba otra fecha o profesional."
            />
          ) : null}
          {!loadingSlots && slots.length > 0 ? (
            <div
              className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              role="listbox"
              aria-label="Horarios disponibles"
            >
              {slots.map((s) => {
                const selected = selectedSlot?.starts_at === s.starts_at
                return (
                  <button
                    key={s.starts_at}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`min-h-11 rounded-xl border px-2 py-2.5 text-sm font-medium tabular-nums transition ${
                      selected
                        ? 'border-brand-600 bg-brand-100 text-brand-800'
                        : 'border-border bg-card hover:border-brand-400'
                    }`}
                    onClick={() => setSelectedSlot(s)}
                  >
                    {formatTimeInZone(s.starts_at, timezone)}
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={!selectedSlot || saving}
            aria-busy={saving}
            onClick={() => void handleConfirm()}
          >
            {saving ? 'Guardando…' : 'Confirmar nuevo horario'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
