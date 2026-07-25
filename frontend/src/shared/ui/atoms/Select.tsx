import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'min-h-11 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-base text-ink shadow-sm outline-none transition-[border-color,box-shadow] duration-[var(--duration-ui)] ease-[var(--ease-out)] focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 sm:text-sm',
        'aria-[invalid=true]:border-danger aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger/20',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
