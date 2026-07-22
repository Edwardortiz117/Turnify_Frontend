import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Button'

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/70 px-4 py-10 text-center sm:px-6 sm:py-12">
      <h3 className="font-display text-lg text-balance text-ink sm:text-xl">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-pretty text-muted">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <div className="mt-5">
          <Button className="w-full sm:w-auto" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function Spinner() {
  return (
    <div
      className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700"
      aria-label="Cargando"
    />
  )
}

export function PageLoading() {
  return (
    <div className="flex justify-center py-16" aria-busy="true" aria-live="polite">
      <Spinner />
    </div>
  )
}

export function BrandEyebrow({ children = 'Turnify' }: { children?: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 sm:text-sm">
      {children}
    </p>
  )
}

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
      className={`text-sm font-semibold text-brand-700 hover:text-brand-800 ${className}`}
    >
      {children}
    </Link>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl tracking-tight text-balance text-ink sm:text-3xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-sm text-pretty text-muted">{subtitle}</p> : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {actions}
        </div>
      ) : null}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5 ${className}`}
    >
      {children}
    </div>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand'
}) {
  const map = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    brand: 'bg-brand-100 text-brand-800',
  }
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${map[tone]}`}>
      {children}
    </span>
  )
}

/** Shared class for selectable list rows (services, professionals). */
export const selectableCardClass =
  'min-h-14 w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-brand-500 active:scale-[0.99]'
