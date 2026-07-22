import type { ReactNode } from 'react'

export function Alert({
  tone = 'error',
  children,
}: {
  tone?: 'error' | 'success' | 'info'
  children: ReactNode
}) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    info: 'border-brand-200 bg-brand-50 text-brand-800',
  }
  return (
    <div className={`rounded-lg border px-3 py-2.5 text-sm ${styles[tone]}`} role="alert">
      {children}
    </div>
  )
}
