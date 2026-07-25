import type { Service } from '../../../shared/api/types'
import { EmptyState, selectableCardClass } from '../../../shared/ui'
import { cn } from '../../../shared/lib/cn'

type Props = {
  services: Service[]
  selectedId?: string | null
  onSelect: (service: Service) => void
}

export function BookingServiceStep({ services, selectedId, onSelect }: Props) {
  if (services.length === 0) {
    return (
      <EmptyState title="Sin servicios" description="Este negocio aún no publicó servicios." />
    )
  }

  return (
    <div className="space-y-2" role="listbox" aria-label="Servicios">
      {services.map((s) => {
        const selected = selectedId === s.id
        return (
          <button
            key={s.id}
            type="button"
            role="option"
            aria-selected={selected}
            className={cn(selectableCardClass, selected && 'border-brand-400 bg-brand-50/50')}
            onClick={() => onSelect(s)}
          >
            <p className="font-semibold">{s.name}</p>
            <p className="text-sm text-muted">{s.duration_minutes} min</p>
          </button>
        )
      })}
    </div>
  )
}
