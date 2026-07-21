import { useEffect, useState, type FormEvent } from 'react'
import {
  createException,
  deleteException,
  getWeeklySchedule,
  listExceptions,
  listProfessionals,
  putWeeklySchedule,
} from '../catalog/businessApi'
import type { AvailabilityException, Professional, WeeklySlot } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Select } from '../../shared/ui/Select'
import { Card, EmptyState, PageHeader, Spinner } from '../../shared/ui/feedback'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function AvailabilityPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [professionalId, setProfessionalId] = useState('')
  const [slots, setSlots] = useState<WeeklySlot[]>([])
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [exDate, setExDate] = useState('')
  const [exType, setExType] = useState<'block' | 'extra_open'>('block')

  useEffect(() => {
    void listProfessionals()
      .then((list) => {
        setProfessionals(list)
        if (list[0]) setProfessionalId(list[0].id)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!professionalId) return
    let cancelled = false
    async function load() {
      setError(null)
      try {
        const [schedule, ex] = await Promise.all([
          getWeeklySchedule(professionalId),
          listExceptions(professionalId),
        ])
        if (cancelled) return
        setSlots(schedule.slots?.length ? schedule.slots : defaultWeek())
        setExceptions(ex)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [professionalId])

  function defaultWeek(): WeeklySlot[] {
    return [1, 2, 3, 4, 5].map((day) => ({
      day_of_week: day,
      start_time: '09:00',
      end_time: '18:00',
    }))
  }

  async function saveSchedule(e: FormEvent) {
    e.preventDefault()
    try {
      await putWeeklySchedule(professionalId, slots)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function addException(e: FormEvent) {
    e.preventDefault()
    try {
      await createException(professionalId, {
        date: exDate,
        type: exType,
        start_time: exType === 'extra_open' ? '09:00' : undefined,
        end_time: exType === 'extra_open' ? '13:00' : undefined,
      })
      setExceptions(await listExceptions(professionalId))
      setExDate('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <Spinner />

  if (professionals.length === 0) {
    return (
      <EmptyState
        title="Primero crea un profesional"
        description="La disponibilidad se define por profesional."
      />
    )
  }

  return (
    <div>
      <PageHeader title="Disponibilidad" subtitle="Horario semanal y excepciones" />
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      <div className="mb-4 max-w-xs">
        <Label>Profesional</Label>
        <Select value={professionalId} onChange={(e) => setProfessionalId(e.target.value)}>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
      </div>

      <Card className="mb-4">
        <h2 className="mb-3 font-semibold">Horario semanal</h2>
        <form className="space-y-3" onSubmit={saveSchedule}>
          {slots.map((slot, idx) => (
            <div key={`${slot.day_of_week}-${idx}`} className="flex flex-wrap items-center gap-2">
              <span className="w-12 text-sm font-medium">{DAYS[slot.day_of_week]}</span>
              <Input
                className="w-28"
                type="time"
                value={slot.start_time}
                onChange={(e) => {
                  const next = [...slots]
                  next[idx] = { ...slot, start_time: e.target.value }
                  setSlots(next)
                }}
              />
              <span className="text-muted">–</span>
              <Input
                className="w-28"
                type="time"
                value={slot.end_time}
                onChange={(e) => {
                  const next = [...slots]
                  next[idx] = { ...slot, end_time: e.target.value }
                  setSlots(next)
                }}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSlots(slots.filter((_, i) => i !== idx))}
              >
                Quitar
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setSlots([
                  ...slots,
                  { day_of_week: 1, start_time: '09:00', end_time: '13:00' },
                ])
              }
            >
              Agregar franja
            </Button>
            <Button type="submit">Guardar horario</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">Excepciones</h2>
        <form className="mb-4 flex flex-wrap gap-3" onSubmit={addException}>
          <div>
            <Label>Fecha</Label>
            <Input type="date" required value={exDate} onChange={(e) => setExDate(e.target.value)} />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select
              value={exType}
              onChange={(e) => setExType(e.target.value as 'block' | 'extra_open')}
            >
              <option value="block">Bloqueo</option>
              <option value="extra_open">Apertura extra</option>
            </Select>
          </div>
          <Button type="submit" className="self-end">Agregar</Button>
        </form>
        <ul className="space-y-2">
          {exceptions.map((ex) => (
            <li key={ex.id} className="flex items-center justify-between text-sm">
              <span>
                {ex.date} · {ex.type === 'block' ? 'Bloqueo' : 'Apertura extra'}
              </span>
              <Button
                variant="danger"
                onClick={() =>
                  void deleteException(professionalId, ex.id).then(async () =>
                    setExceptions(await listExceptions(professionalId)),
                  )
                }
              >
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
