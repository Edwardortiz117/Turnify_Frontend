import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type AtmosphereMode = 'fixed' | 'fill'

/**
 * Stripe / Linear / Framer–style atmospheric backdrop:
 * soft coral/blush blobs (contrast to brand turquoise) + gray washes.
 */
export function BrandAtmosphere({
  className = '',
  mode = 'fixed',
}: {
  className?: string
  /** `fixed` = viewport backdrop; `fill` = absolute inside a panel (app content). */
  mode?: AtmosphereMode
}) {
  return (
    <div
      className={cn(
        'brand-atmosphere',
        mode === 'fill' && 'brand-atmosphere--fill',
        className,
      )}
      aria-hidden="true"
    >
      <div className="brand-atmosphere__base" />
      <div className="brand-atmosphere__blob brand-atmosphere__blob--a" />
      <div className="brand-atmosphere__blob brand-atmosphere__blob--b" />
      <div className="brand-atmosphere__blob brand-atmosphere__blob--c" />
      <div className="brand-atmosphere__blob brand-atmosphere__blob--d" />
      <div className="brand-atmosphere__blob brand-atmosphere__blob--e" />
      <div className="brand-atmosphere__ring brand-atmosphere__ring--1" />
      <div className="brand-atmosphere__ring brand-atmosphere__ring--2" />
      <div className="brand-atmosphere__ring brand-atmosphere__ring--3" />
      <div className="brand-atmosphere__wave" />
      <div className="brand-atmosphere__wave brand-atmosphere__wave--soft" />
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
