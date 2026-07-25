import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

export function TextLink({
  to,
  children,
  className = '',
}: {
  to: string
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        'text-sm font-semibold text-brand-700 underline-offset-4 transition-colors duration-[var(--duration-ui)] hover:text-brand-800 hover:underline',
        className,
      )}
    >
      {children}
    </Link>
  )
}
