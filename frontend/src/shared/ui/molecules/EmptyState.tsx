import { Link } from 'react-router-dom'
import { Button } from '../atoms/Button'
import { cn } from '../../lib/cn'
import { glassPanelClass } from '../lib/glass'

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionTo,
}: {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionTo?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border-dashed px-5 py-8 text-center sm:px-8 sm:py-10',
        glassPanelClass,
      )}
    >
      <h3 className="text-lg font-bold tracking-tight text-balance text-ink sm:text-xl">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-pretty text-muted">{description}</p>
      ) : null}
      {actionLabel && (onAction || actionTo) ? (
        <div className="mt-6">
          {actionTo ? (
            <Link to={actionTo} className="inline-flex w-full sm:w-auto">
              <Button className="w-full sm:w-auto">{actionLabel}</Button>
            </Link>
          ) : (
            <Button className="w-full sm:w-auto" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )
}
