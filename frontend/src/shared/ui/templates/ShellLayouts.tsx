import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { BrandLogo } from '../atoms/BrandLogo'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { SiteFooter } from '../organisms/SiteFooter'
import { UserMenu } from '../organisms/UserMenu'
import { cn } from '../../lib/cn'
import { MarketingShell } from './MarketingShell'

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      {open ? (
        <path
          d="M4 4l12 12M16 4L4 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M3 5h14M3 10h14M3 15h14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

export type ShellLink = {
  to: string
  label: string
  end?: boolean
  section?: string
}

export function ShellFrame({
  brand,
  subtitle,
  badge,
  email,
  links,
  profileTo,
  headerActions,
  primaryAction,
  onLogout,
}: {
  brand: string
  subtitle?: string
  badge?: string
  email?: string
  links: ShellLink[]
  profileTo?: string
  headerActions?: ReactNode
  primaryAction?: { to: string; label: string }
  onLogout: () => void
}) {
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  // Close mobile drawer when viewport crosses to desktop (avoids stuck body overflow)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mq.matches) setNavOpen(false)
    }
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!navOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [navOpen])

  const linkClass = (isActive: boolean) =>
    cn(
      'flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-[var(--duration-ui)]',
      isActive
        ? 'bg-brand-50 text-brand-800 ring-1 ring-brand-200/70'
        : 'text-slate-600 hover:bg-surface hover:text-ink',
    )

  const sections = links.reduce<Array<{ name?: string; items: ShellLink[] }>>((acc, link) => {
    const section = link.section
    const last = acc[acc.length - 1]
    if (section && (!last || last.name !== section)) {
      acc.push({ name: section, items: [link] })
    } else if (last && last.name === section) {
      last.items.push(link)
    } else if (!section && last && !last.name) {
      last.items.push(link)
    } else {
      acc.push({ name: section, items: [link] })
    }
    return acc
  }, [])

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>

      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/35 lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <aside
        id="app-nav"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(100%,16.5rem)] flex-col border-r border-border bg-card text-ink transition-transform duration-[var(--duration-ui)] ease-[var(--ease-drawer)] lg:static lg:translate-x-0',
          navOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="border-b border-border px-3 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <BrandLogo size="sm" className="!mx-0" />
            <span className="truncate text-sm font-bold text-ink">{brand}</span>
            {badge ? <Badge tone="brand">{badge}</Badge> : null}
          </div>
          {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
        </div>
        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-2 py-3" aria-label="Principal">
          {sections.map((group, i) => (
            <div key={group.name ?? `g-${i}`} className="flex flex-col gap-0.5">
              {group.name ? (
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {group.name}
                </p>
              ) : null}
              {group.items.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) => linkClass(isActive)}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-lg border border-border bg-white text-ink transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:hidden"
              aria-expanded={navOpen}
              aria-controls="app-nav"
              aria-label={navOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setNavOpen((v) => !v)}
            >
              <MenuIcon open={navOpen} />
            </button>
            <div className="flex min-w-0 items-center gap-2 lg:hidden">
              <BrandLogo size="sm" />
              {badge ? <Badge tone="brand">{badge}</Badge> : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {primaryAction ? (
              <Link to={primaryAction.to} className="hidden sm:inline-flex">
                <Button size="sm">{primaryAction.label}</Button>
              </Link>
            ) : null}
            {headerActions}
            <UserMenu email={email} profileTo={profileTo} onLogout={onLogout} />
          </div>
        </header>

        <main id="main-content" className="min-w-0 flex-1 px-4 py-4 pb-5 sm:px-6 sm:py-5 lg:px-8">
          <div className="surface-enter mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
        <SiteFooter variant="compact" />
      </div>
    </div>
  )
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <MarketingShell>
      <div className="w-full max-w-md text-left lg:mr-auto lg:max-w-md xl:max-w-lg">
        <div className="home-rise home-rise-delay-1 mb-6">
          <BrandLogo size="xl" className="mx-0" />
        </div>
        {children}
      </div>
    </MarketingShell>
  )
}

export function PublicLayout({
  children,
  wide = false,
  center = false,
}: {
  children: ReactNode
  wide?: boolean
  center?: boolean
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      <div
        id="main-content"
        className={cn(
          'surface-enter mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8',
          wide ? 'max-w-5xl' : 'max-w-3xl',
          center ? 'flex flex-col justify-center py-8 sm:py-10' : 'py-5 sm:py-7 lg:py-8',
        )}
      >
        {children}
      </div>
      <SiteFooter variant="compact" />
    </div>
  )
}
