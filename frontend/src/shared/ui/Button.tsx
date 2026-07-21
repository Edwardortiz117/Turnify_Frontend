import type { ButtonHTMLAttributes, ReactNode } from 'react'

const variants = {
  primary:
    'bg-brand-700 text-white hover:bg-brand-800 shadow-sm disabled:opacity-50',
  secondary:
    'bg-white text-ink border border-border hover:bg-slate-50 disabled:opacity-50',
  danger: 'bg-danger text-white hover:bg-red-700 disabled:opacity-50',
  ghost: 'bg-transparent text-brand-800 hover:bg-brand-50 disabled:opacity-50',
} as const

type Variant = keyof typeof variants

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
