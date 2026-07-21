import type { SelectHTMLAttributes } from 'react'

export function Select({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none ring-brand-500 focus:ring-2 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
