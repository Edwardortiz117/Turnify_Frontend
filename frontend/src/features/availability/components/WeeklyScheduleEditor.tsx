import type { SubmitEvent } from 'react'
import type { WeeklySlot } from '../../../shared/api/types'
import { Button, Input, Select, Card } from '../../../shared/ui'

/** OpenAPI: day_of_week 1=Mon … 7=Sun */
export const DAY_LABELS: Record<number, string> = {
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
  7: 'Dom',
}

type Props = {
  slots: WeeklySlot[]
  saving?: boolean
  onChange: (slots: WeeklySlot[]) => void
  onSave: (e: SubmitEvent) => void
}

export function WeeklyScheduleEditor({ slots, saving, onChange, onSave }: Props) {
  return (
    <Card className="mb-4" interactive>
      <h2 className="mb-3 font-semibold">Horario semanal</h2>
      <form className="space-y-3" onSubmit={onSave}>
        {slots.map((slot, idx) => (
          <div
            key={`${slot.day_of_week}-${idx}`}
            className="grid grid-cols-1 gap-2 py-3 sm:flex sm:flex-wrap sm:items-center sm:py-0 [&:not(:last-of-type)]:border-b [&:not(:last-of-type)]:border-border sm:[&:not(:last-of-type)]:border-0"
          >
            <Select
              className="w-full sm:w-24"
              value={slot.day_of_week}
              aria-label={`Día franja ${idx + 1}`}
              onChange={(e) => {
                const next = [...slots]
                next[idx] = { ...slot, day_of_week: Number(e.target.value) }
                onChange(next)
              }}
            >
              {Object.entries(DAY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <div className="flex items-center gap-2">
              <Input
                className="w-full sm:w-28"
                type="time"
                aria-label={`Inicio franja ${idx + 1}`}
                value={slot.start_time.slice(0, 5)}
                onChange={(e) => {
                  const next = [...slots]
                  next[idx] = { ...slot, start_time: e.target.value }
                  onChange(next)
                }}
              />
              <span className="text-muted" aria-hidden>
                –
              </span>
              <Input
                className="w-full sm:w-28"
                type="time"
                aria-label={`Fin franja ${idx + 1}`}
                value={slot.end_time.slice(0, 5)}
                onChange={(e) => {
                  const next = [...slots]
                  next[idx] = { ...slot, end_time: e.target.value }
                  onChange(next)
                }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => onChange(slots.filter((_, i) => i !== idx))}
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
              onChange([...slots, { day_of_week: 1, start_time: '09:00', end_time: '13:00' }])
            }
          >
            Agregar franja
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar horario'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
