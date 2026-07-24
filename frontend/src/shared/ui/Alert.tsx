import type { ReactNode } from 'react'

export function Alert({
  tone = 'error',
  children,
}: {
  tone?: 'error' | 'success' | 'info' | 'warning'
  children: ReactNode
}) {
  const styles = {
    error: 'border-red-200/90 bg-red-50 text-red-800',
    success: 'border-emerald-200/90 bg-emerald-50 text-emerald-900',
    info: 'border-brand-200/90 bg-brand-50 text-brand-800',
    warning: 'border-amber-200/90 bg-amber-50 text-amber-950',
  }
  return (
    <div
      className={`rounded-xl border px-3.5 py-3 text-sm text-pretty shadow-sm ${styles[tone]}`}
      role="alert"
    >
      {children}
    </div>
  )
}
