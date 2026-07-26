import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-[transform,background-color,box-shadow,border-color,color] duration-[var(--duration-press)] ease-[var(--ease-out)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.97] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand-700 text-white shadow-sm hover:bg-brand-800',
        secondary:
          'border border-white/60 bg-white/70 text-ink shadow-sm backdrop-blur-md hover:border-brand-200 hover:bg-white/90',
        danger: 'bg-danger text-white shadow-sm hover:bg-red-700',
        ghost: 'bg-transparent text-brand-800 hover:bg-brand-50',
      },
      size: {
        default: '',
        sm: 'min-h-9 px-3 py-1.5 text-xs',
        lg: 'min-h-12 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    children: ReactNode
  }

export function Button({ variant, size, className, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  )
}
