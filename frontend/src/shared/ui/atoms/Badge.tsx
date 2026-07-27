import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand'
  className?: string
}) {
  const map = {
    neutral: 'bg-slate-100 text-slate-700 ring-slate-200/80',
    success: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
    warning: 'bg-amber-50 text-amber-900 ring-amber-200/80',
    danger: 'bg-red-50 text-red-800 ring-red-200/80',
    brand: 'bg-brand-50 text-brand-800 ring-brand-200/80',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1',
        map[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
