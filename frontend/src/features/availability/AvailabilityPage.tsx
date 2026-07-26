import { useEffect, useState, type SubmitEvent } from 'react'
import { toast } from 'sonner'
import {
  createException,
  deleteException,
  getProfile,
  getWeeklySchedule,
  listExceptions,
  listProfessionals,
  putWeeklySchedule,
} from '../../shared/api/business'
import type { AvailabilityException, Professional, WeeklySlot } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { endOfDayIso, startOfDayIso, wallTimeToUtcIso } from '../../shared/datetime'
import { Alert, ConfirmDialog, Label, Select, EmptyState, PageHeader, PageLoading } from '../../shared/ui'
import { ExceptionsPanel } from './components/ExceptionsPanel'
import { WeeklyScheduleEditor } from './components/WeeklyScheduleEditor'

function defaultWeek(): WeeklySlot[] {
  return [1, 2, 3, 4, 5].map((day) => ({
    day_of_week: day,
    start_time: '09:00',
    end_time: '18:00',
  }))
}

export function AvailabilityPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [professionalId, setProfessionalId] = useState('')
  const [slots, setSlots] = useState<WeeklySlot[]>([])
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [addingEx, setAddingEx] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AvailabilityException | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [exDate, setExDate] = useState('')
  const [exType, setExType] = useState<'block' | 'extra_open'>('block')
  const [exStart, setExStart] = useState('09:00')
  const [exEnd, setExEnd] = useState('13:00')
  const [timezone, setTimezone] = useState('America/Bogota')

  useEffect(() => {
    let cancelled = false
    void Promise.all([listProfessionals(), getProfile()])
      .then(([list, profile]) => {
        if (cancelled) return
        setProfessionals(list)
        if (profile.timezone) setTimezone(profile.timezone)
        if (list[0]) setProfessionalId(list[0].id)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!professionalId) return
    const controller = new AbortController()
    async function load() {
      setError(null)
      try {
        const [schedule, ex] = await Promise.all([
          getWeeklySchedule(professionalId),
          listExceptions(professionalId),
        ])
        if (controller.signal.aborted) return
        setSlots(schedule.slots?.length ? schedule.slots : defaultWeek())
        setExceptions(ex)
      } catch (err) {
        if (!controller.signal.aborted) setError(getErrorMessage(err))
      }
    }
    void load()
    return () => controller.abort()
  }, [professionalId])

  async function saveSchedule(e: SubmitEvent) {
    e.preventDefault()
    setSavingSchedule(true)
    setError(null)
    try {
      await putWeeklySchedule(professionalId, slots)
      toast.success('Horario guardado')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSavingSchedule(false)
    }
  }

  async function addException(e: SubmitEvent) {
    e.preventDefault()
    setAddingEx(true)
    setError(null)
    try {
      const starts_at =
        exType === 'block'
          ? startOfDayIso(exDate, timezone)
          : wallTimeToUtcIso(exDate, exStart, timezone)
      const ends_at =
        exType === 'block'
          ? endOfDayIso(exDate, timezone)
          : wallTimeToUtcIso(exDate, exEnd, timezone)
      await createException(professionalId, { starts_at, ends_at, type: exType })
      setExceptions(await listExceptions(professionalId))
      setExDate('')
      toast.success(exType === 'block' ? 'Bloqueo agregado' : 'Apertura extra agregada')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setAddingEx(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setError(null)
    try {
      await deleteException(professionalId, deleteTarget.id)
      setExceptions(await listExceptions(professionalId))
      setDeleteTarget(null)
      toast.success('Excepción eliminada')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageLoading />

  if (professionals.length === 0) {
    return (
      <div>
        <PageHeader title="Disponibilidad" subtitle="Horario semanal y excepciones" />
        {error ? (
          <div className="mb-3">
            <Alert>{error}</Alert>
          </div>
        ) : (
          <EmptyState
            title="Primero crea un profesional"
            description="La disponibilidad se define por profesional."
            actionLabel="Ir a equipo"
            actionTo="/app/professionals"
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Disponibilidad" subtitle="Horario semanal y excepciones" />
      {error ? (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      <div className="mb-4 max-w-full sm:max-w-xs">
        <Label htmlFor="availability-pro">Profesional</Label>
        <Select
          id="availability-pro"
          value={professionalId}
          onChange={(e) => setProfessionalId(e.target.value)}
        >
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.status !== 'active' ? ' (bloqueado)' : ''}
            </option>
          ))}
        </Select>
      </div>

      <WeeklyScheduleEditor
        slots={slots}
        saving={savingSchedule}
        onChange={setSlots}
        onSave={(e) => void saveSchedule(e)}
      />

      <ExceptionsPanel
        exceptions={exceptions}
        exDate={exDate}
        exType={exType}
        exStart={exStart}
        exEnd={exEnd}
        adding={addingEx}
        onExDate={setExDate}
        onExType={setExType}
        onExStart={setExStart}
        onExEnd={setExEnd}
        onAdd={(e) => void addException(e)}
        onRequestDelete={setDeleteTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar excepción"
        description="Se quitará este bloqueo o apertura extra del calendario del profesional."
        confirmLabel="Eliminar"
        danger
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
