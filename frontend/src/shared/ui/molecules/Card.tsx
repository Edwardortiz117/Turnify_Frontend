import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Card({
  children,
  className = '',
  interactive = false,
}: {
  children: ReactNode
  className?: string
  /** Prefer false for static metrics; true for forms / clickable panels. */
  interactive?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-3.5 sm:p-4',
        interactive && 'shadow-sm transition-shadow duration-[var(--duration-ui)] hover:shadow-md',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Shared class for selectable list rows (services, professionals). */
export const selectableCardClass =
  'min-h-14 w-full rounded-xl border border-border bg-card p-4 text-left transition-[border-color,background-color,transform] duration-[var(--duration-ui)] ease-[var(--ease-out)] hover:border-brand-300 hover:bg-brand-50/40 active:scale-[0.99] motion-reduce:active:scale-100'
