import type { SubmitEvent } from 'react'
import type { AvailabilityException } from '../../../shared/api/types'
import { formatInTimeZone } from '../../../shared/datetime'
import { Button, Input, Label, Select, Badge, Card } from '../../../shared/ui'

type Props = {
  exceptions: AvailabilityException[]
  exDate: string
  exType: 'block' | 'extra_open'
  exStart: string
  exEnd: string
  adding?: boolean
  onExDate: (v: string) => void
  onExType: (v: 'block' | 'extra_open') => void
  onExStart: (v: string) => void
  onExEnd: (v: string) => void
  onAdd: (e: SubmitEvent) => void
  onRequestDelete: (ex: AvailabilityException) => void
}

export function ExceptionsPanel({
  exceptions,
  exDate,
  exType,
  exStart,
  exEnd,
  adding,
  onExDate,
  onExType,
  onExStart,
  onExEnd,
  onAdd,
  onRequestDelete,
}: Props) {
  return (
    <Card interactive>
      <h2 className="mb-3 font-semibold">Excepciones</h2>
      <form className="mb-4 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap" onSubmit={onAdd}>
        <div className="sm:min-w-[10rem]">
          <Label htmlFor="ex-date">Fecha</Label>
          <Input
            id="ex-date"
            type="date"
            required
            value={exDate}
            onChange={(e) => onExDate(e.target.value)}
          />
        </div>
        <div className="sm:min-w-[12rem]">
          <Label htmlFor="ex-type">Tipo</Label>
          <Select
            id="ex-type"
            value={exType}
            onChange={(e) => onExType(e.target.value as 'block' | 'extra_open')}
          >
            <option value="block">Bloqueo (día completo)</option>
            <option value="extra_open">Apertura extra</option>
          </Select>
        </div>
        {exType === 'extra_open' ? (
          <>
            <div>
              <Label htmlFor="ex-start">Desde</Label>
              <Input
                id="ex-start"
                type="time"
                value={exStart}
                onChange={(e) => onExStart(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ex-end">Hasta</Label>
              <Input
                id="ex-end"
                type="time"
                value={exEnd}
                onChange={(e) => onExEnd(e.target.value)}
              />
            </div>
          </>
        ) : null}
        <Button type="submit" className="w-full self-end sm:w-auto" disabled={adding}>
          {adding ? 'Agregando…' : 'Agregar'}
        </Button>
      </form>
      {exceptions.length === 0 ? (
        <p className="text-sm text-muted">Sin excepciones. Los días siguen el horario semanal.</p>
      ) : (
        <ul className="divide-y divide-border">
          {exceptions.map((ex) => (
            <li
              key={ex.id}
              className="flex flex-col gap-2 py-3 text-sm first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex min-w-0 flex-wrap items-center gap-2 break-words">
                <Badge tone={ex.type === 'block' ? 'warning' : 'brand'}>
                  {ex.type === 'block' ? 'Bloqueo' : 'Apertura'}
                </Badge>
                <span className="text-muted">
                  {formatInTimeZone(ex.starts_at)} – {formatInTimeZone(ex.ends_at)}
                </span>
              </span>
              <Button
                variant="danger"
                size="sm"
                className="w-full shrink-0 sm:w-auto"
                onClick={() => onRequestDelete(ex)}
              >
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
