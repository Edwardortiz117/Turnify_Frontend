import type { ReactNode } from 'react'

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
    <div className="mb-4 flex flex-col gap-2 border-b border-border pb-3 sm:mb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-balance text-ink sm:text-2xl">
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
