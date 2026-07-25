import type { Professional } from '../../../shared/api/types'
import { Button, EmptyState, selectableCardClass, Spinner } from '../../../shared/ui'
import { cn } from '../../../shared/lib/cn'

type Props = {
  professionals: Professional[]
  busy: boolean
  selectedId?: string | null
  onBack: () => void
  onSelect: (professional: Professional) => void
}

export function BookingProfessionalStep({
  professionals,
  busy,
  selectedId,
  onBack,
  onSelect,
}: Props) {
  return (
    <div className="space-y-3">
      <Button variant="ghost" size="sm" onClick={onBack}>
        ← Cambiar servicio
      </Button>
      {busy ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : null}
      {!busy && professionals.length === 0 ? (
        <EmptyState title="Sin profesionales" description="Nadie ofrece este servicio ahora." />
      ) : null}
      <div className="space-y-2" role="listbox" aria-label="Profesionales">
        {professionals.map((p) => {
          const selected = selectedId === p.id
          return (
            <button
              key={p.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={cn(selectableCardClass, selected && 'border-brand-400 bg-brand-50/50')}
              onClick={() => onSelect(p)}
            >
              <p className="font-semibold">{p.name}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
