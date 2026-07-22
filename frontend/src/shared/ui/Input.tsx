import type { InputHTMLAttributes } from 'react'

export function Input({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-11 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-base text-ink outline-none ring-brand-500 focus:ring-2 sm:text-sm ${className}`}
      {...props}
    />
  )
}
