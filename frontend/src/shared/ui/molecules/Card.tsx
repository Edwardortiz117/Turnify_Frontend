import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { glassPanelClass } from '../lib/glass'

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
        'rounded-xl p-3.5 sm:p-4',
        glassPanelClass,
        interactive && 'transition-shadow duration-[var(--duration-ui)] hover:shadow-md hover:shadow-slate-900/8',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Shared class for selectable list rows (services, professionals). */
export const selectableCardClass = cn(
  'min-h-14 w-full rounded-xl p-4 text-left transition-[border-color,background-color,transform,box-shadow] duration-[var(--duration-ui)] ease-[var(--ease-out)] hover:border-brand-300/70 hover:bg-brand-50/35 active:scale-[0.99] motion-reduce:active:scale-100',
  glassPanelClass,
)
