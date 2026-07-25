import { cn } from '../../lib/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'size-8 animate-spin rounded-full border-2 border-brand-100 border-t-brand-700',
        className,
      )}
      aria-label="Cargando"
    />
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-border/70', className)} aria-hidden />
}
