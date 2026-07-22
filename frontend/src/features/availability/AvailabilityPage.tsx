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
import { endOfDayIso, formatInTimeZone, startOfDayIso } from '../../shared/datetime'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Select } from '../../shared/ui/Select'
import { Card, EmptyState, PageHeader, PageLoading } from '../../shared/ui/feedback'

/** OpenAPI: day_of_week 1=Mon … 7=Sun */
const DAY_LABELS: Record<number, string> = {
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
  7: 'Dom',
}

export function AvailabilityPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [professionalId, setProfessionalId] = useState('')
  const [slots, setSlots] = useState<WeeklySlot[]>([])
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [exDate, setExDate] = useState('')
  const [exType, setExType] = useState<'block' | 'extra_open'>('block')
  const [exStart, setExStart] = useState('09:00')
  const [exEnd, setExEnd] = useState('13:00')

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
      const starts_at =
        exType === 'block'
          ? startOfDayIso(exDate)
          : new Date(`${exDate}T${exStart}:00`).toISOString()
      const ends_at =
        exType === 'block'
          ? endOfDayIso(exDate)
          : new Date(`${exDate}T${exEnd}:00`).toISOString()
      await createException(professionalId, { starts_at, ends_at, type: exType })
      setExceptions(await listExceptions(professionalId))
      setExDate('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <PageLoading />

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
      <div className="mb-4 max-w-full sm:max-w-xs">
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
            <div
              key={`${slot.day_of_week}-${idx}`}
              className="grid grid-cols-1 gap-2 py-3 sm:flex sm:flex-wrap sm:items-center sm:py-0 [&:not(:last-of-type)]:border-b [&:not(:last-of-type)]:border-border/60 sm:[&:not(:last-of-type)]:border-0"
            >
              <Select
                className="w-full sm:w-24"
                value={slot.day_of_week}
                onChange={(e) => {
                  const next = [...slots]
                  next[idx] = { ...slot, day_of_week: Number(e.target.value) }
                  setSlots(next)
                }}
              >
                {Object.entries(DAY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
              <div className="flex items-center gap-2">
                <Input
                  className="w-full sm:w-28"
                  type="time"
                  value={slot.start_time.slice(0, 5)}
                  onChange={(e) => {
                    const next = [...slots]
                    next[idx] = { ...slot, start_time: e.target.value }
                    setSlots(next)
                  }}
                />
                <span className="text-muted">–</span>
                <Input
                  className="w-full sm:w-28"
                  type="time"
                  value={slot.end_time.slice(0, 5)}
                  onChange={(e) => {
                    const next = [...slots]
                    next[idx] = { ...slot, end_time: e.target.value }
                    setSlots(next)
                  }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={() => setSlots(slots.filter((_, i) => i !== idx))}
              >
                Quitar
              </Button>
            </div>
          ))}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() =>
                setSlots([
                  ...slots,
                  { day_of_week: 1, start_time: '09:00', end_time: '13:00' },
                ])
              }
            >
              Agregar franja
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Guardar horario
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">Excepciones</h2>
        <form className="mb-4 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap" onSubmit={addException}>
          <div className="sm:min-w-[10rem]">
            <Label>Fecha</Label>
            <Input type="date" required value={exDate} onChange={(e) => setExDate(e.target.value)} />
          </div>
          <div className="sm:min-w-[12rem]">
            <Label>Tipo</Label>
            <Select
              value={exType}
              onChange={(e) => setExType(e.target.value as 'block' | 'extra_open')}
            >
              <option value="block">Bloqueo (día completo)</option>
              <option value="extra_open">Apertura extra</option>
            </Select>
          </div>
          {exType === 'extra_open' ? (
            <>
              <div>
                <Label>Desde</Label>
                <Input type="time" value={exStart} onChange={(e) => setExStart(e.target.value)} />
              </div>
              <div>
                <Label>Hasta</Label>
                <Input type="time" value={exEnd} onChange={(e) => setExEnd(e.target.value)} />
              </div>
            </>
          ) : null}
          <Button type="submit" className="w-full self-end sm:w-auto">
            Agregar
          </Button>
        </form>
        <ul className="divide-y divide-border/60">
          {exceptions.map((ex) => (
            <li
              key={ex.id}
              className="flex flex-col gap-2 py-3 text-sm first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="min-w-0 break-words">
                {formatInTimeZone(ex.starts_at)} – {formatInTimeZone(ex.ends_at)} ·{' '}
                {ex.type === 'block' ? 'Bloqueo' : 'Apertura extra'}
              </span>
              <Button
                variant="danger"
                className="w-full shrink-0 sm:w-auto"
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
