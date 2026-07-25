import type { Slot } from '../../../shared/api/types'
import { formatTimeInZone, toDateInputValue } from '../../../shared/datetime'
import { Button, Input, Label, Card, EmptyState, Spinner } from '../../../shared/ui'
import { cn } from '../../../shared/lib/cn'

type Props = {
  date: string
  timezone: string
  slots: Slot[]
  busy: boolean
  selectedStartsAt?: string | null
  onBack: () => void
  onDateChange: (date: string) => void
  onSelect: (slot: Slot) => void
}

export function BookingSlotStep({
  date,
  timezone,
  slots,
  busy,
  selectedStartsAt,
  onBack,
  onDateChange,
  onSelect,
}: Props) {
  return (
    <Card className="space-y-4" interactive>
      <Button variant="ghost" size="sm" onClick={onBack}>
        ← Cambiar profesional
      </Button>
      <div>
        <Label htmlFor="booking-date">Fecha</Label>
        <Input
          id="booking-date"
          type="date"
          value={date}
          min={toDateInputValue()}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
      {busy ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : null}
      {!busy && slots.length === 0 ? (
        <EmptyState title="Sin horarios" description="Prueba otra fecha." />
      ) : null}
      {!busy && slots.length > 0 ? (
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
          role="listbox"
          aria-label="Horarios disponibles"
        >
          {slots.map((s) => {
            const selected = selectedStartsAt === s.starts_at
            return (
              <button
                key={s.starts_at}
                type="button"
                role="option"
                aria-selected={selected}
                className={cn(
                  'min-h-11 rounded-lg border px-2 py-2.5 text-sm font-medium tabular-nums transition-colors duration-[var(--duration-ui)]',
                  selected
                    ? 'border-brand-600 bg-brand-100 text-brand-800'
                    : 'border-border bg-card hover:border-brand-400',
                )}
                onClick={() => onSelect(s)}
              >
                {formatTimeInZone(s.starts_at, timezone)}
              </button>
            )
          })}
        </div>
      ) : null}
    </Card>
  )
}
