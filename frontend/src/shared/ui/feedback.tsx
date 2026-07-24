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
    <div className="rounded-2xl border border-dashed border-border bg-card/80 px-5 py-12 text-center shadow-sm sm:px-8 sm:py-14">
      <h3 className="font-display text-lg text-balance text-ink sm:text-xl">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-pretty text-muted">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <div className="mt-6">
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
      className="size-8 animate-spin rounded-full border-2 border-brand-100 border-t-brand-700"
      aria-label="Cargando"
    />
  )
}

export function PageLoading() {
  return (
    <div className="flex justify-center py-20" aria-busy="true" aria-live="polite">
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
      className={`text-sm font-semibold text-brand-700 underline-offset-4 transition-colors duration-200 hover:text-brand-800 hover:underline ${className}`}
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
    <div className="mb-6 flex flex-col gap-3 border-b border-border/70 pb-5 sm:mb-7 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl tracking-tight text-balance text-ink sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-pretty text-muted">{subtitle}</p>
        ) : null}
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
      className={`rounded-2xl border border-border/90 bg-card p-4 shadow-sm ring-1 ring-slate-950/5 transition duration-200 ease-out sm:p-5 ${className}`}
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
    neutral: 'bg-slate-100 text-slate-700 ring-slate-200/80',
    success: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
    warning: 'bg-amber-50 text-amber-900 ring-amber-200/80',
    danger: 'bg-red-50 text-red-800 ring-red-200/80',
    brand: 'bg-brand-50 text-brand-800 ring-brand-200/80',
  }
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ring-1 ${map[tone]}`}
    >
      {children}
    </span>
  )
}

/** Shared class for selectable list rows (services, professionals). */
export const selectableCardClass =
  'min-h-14 w-full rounded-2xl border border-border/90 bg-card p-4 text-left shadow-sm ring-1 ring-slate-950/5 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md hover:ring-brand-200/40 active:translate-y-0 active:scale-[0.99] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100'
