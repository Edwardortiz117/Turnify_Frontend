import type { ButtonHTMLAttributes, ReactNode } from 'react'

const variants = {
  primary:
    'bg-brand-700 text-white shadow-sm hover:bg-brand-800 hover:shadow-md disabled:opacity-50',
  secondary:
    'bg-white text-ink border border-border shadow-sm hover:border-brand-200 hover:bg-brand-50/60 disabled:opacity-50',
  danger:
    'bg-danger text-white shadow-sm hover:bg-red-700 hover:shadow-md disabled:opacity-50',
  ghost:
    'bg-transparent text-brand-800 hover:bg-brand-50 disabled:opacity-50',
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
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98] motion-reduce:active:scale-100 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
