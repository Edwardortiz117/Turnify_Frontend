import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'
import { Badge } from './feedback'
import { SiteFooter } from './SiteFooter'
import { UserMenu } from './UserMenu'

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

export function ShellFrame({
  brand,
  subtitle,
  badge,
  email,
  links,
  profileTo,
  headerActions,
  onLogout,
}: {
  brand: string
  subtitle?: string
  badge?: string
  email?: string
  links: Array<{ to: string; label: string; end?: boolean }>
  profileTo?: string
  headerActions?: ReactNode
  onLogout: () => void
}) {
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!navOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [navOpen])

  const linkClass = (isActive: boolean) =>
    `min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive ? 'bg-brand-100 text-brand-800' : 'text-slate-600 hover:bg-slate-50'
    }`

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <aside
        id="app-nav"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100%,18rem)] flex-col border-r border-border bg-white/95 text-ink backdrop-blur transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          navOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <BrandLogo size="md" />
            <span className="sr-only">{brand}</span>
            {badge ? <Badge tone="brand">{badge}</Badge> : null}
          </div>
          {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3" aria-label="Principal">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => linkClass(isActive)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-white/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:hidden"
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
            {badge ? (
              <div className="hidden lg:block">
                <Badge tone="brand">{badge}</Badge>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {headerActions}
            <UserMenu email={email} profileTo={profileTo} onLogout={onLogout} />
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 pb-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
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
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo size="lg" />
          <p className="mt-3 text-sm text-muted">Gestión de citas para tu negocio</p>
        </div>
        {children}
      </div>
      <SiteFooter
        links={[
          { to: '/', label: 'Inicio' },
          { to: '/login', label: 'Iniciar sesión' },
        ]}
      />
    </div>
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
    <div className="flex min-h-dvh flex-col">
      <div
        className={`mx-auto w-full flex-1 px-4 sm:px-6 ${
          wide ? 'max-w-3xl' : 'max-w-2xl'
        } ${center ? 'flex flex-col justify-center py-12 sm:py-16' : 'py-6 sm:py-10 lg:py-12'}`}
      >
        {children}
      </div>
      <SiteFooter
        links={[
          { to: '/', label: 'Inicio' },
          { to: '/login', label: 'Iniciar sesión' },
          { to: '/register', label: 'Registrar negocio' },
        ]}
      />
    </div>
  )
}
