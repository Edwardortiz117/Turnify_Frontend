import type { InputHTMLAttributes } from 'react'

export function Input({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-11 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base text-ink shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/25 sm:text-sm ${className}`}
      {...props}
    />
  )
}
