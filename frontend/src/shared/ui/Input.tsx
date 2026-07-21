import type { InputHTMLAttributes } from 'react'

export function Input({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none ring-brand-500 focus:ring-2 ${className}`}
      {...props}
    />
  )
}
