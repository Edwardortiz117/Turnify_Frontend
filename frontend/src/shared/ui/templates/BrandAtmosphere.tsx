import type { ReactNode } from 'react'

/**
 * Stripe / Linear–style atmospheric backdrop: soft blobs, circles, and
 * teal–white–gray washes. Pure CSS — no photo wallpaper.
 */
export function BrandAtmosphere({ className = '' }: { className?: string }) {
  return (
    <div className={`brand-atmosphere ${className}`.trim()} aria-hidden="true">
      <div className="brand-atmosphere__base" />
      <div className="brand-atmosphere__blob brand-atmosphere__blob--a" />
      <div className="brand-atmosphere__blob brand-atmosphere__blob--b" />
      <div className="brand-atmosphere__blob brand-atmosphere__blob--c" />
      <div className="brand-atmosphere__blob brand-atmosphere__blob--d" />
      <div className="brand-atmosphere__ring brand-atmosphere__ring--1" />
      <div className="brand-atmosphere__ring brand-atmosphere__ring--2" />
      <div className="brand-atmosphere__wave" />
      <div className="brand-atmosphere__veil" />
    </div>
  )
}

export function AtmosphereShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate min-h-dvh">
      <BrandAtmosphere />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
