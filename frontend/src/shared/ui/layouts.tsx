import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button } from './Button'
import { Badge } from './feedback'

const appLinks = [
  { to: '/app', label: 'Dashboard', end: true },
  { to: '/app/appointments', label: 'Agenda' },
  { to: '/app/services', label: 'Servicios' },
  { to: '/app/professionals', label: 'Profesionales' },
  { to: '/app/availability', label: 'Disponibilidad' },
  { to: '/app/clients', label: 'Clientes' },
  { to: '/app/profile', label: 'Perfil' },
]

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

function ShellFrame({
  brand,
  subtitle,
  badge,
  email,
  links,
  onLogout,
}: {
  brand: string
  subtitle?: string
  badge?: string
  email?: string
  links: Array<{ to: string; label: string; end?: boolean }>
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
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-white/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur lg:hidden">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-display text-xl text-brand-800">{brand}</p>
            {badge ? <Badge tone="brand">{badge}</Badge> : null}
          </div>
          {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border"
          aria-expanded={navOpen}
          aria-controls="app-nav"
          aria-label={navOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setNavOpen((v) => !v)}
        >
          <MenuIcon open={navOpen} />
        </button>
      </header>

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
        <div className="hidden px-5 py-5 lg:block">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-2xl text-brand-800">{brand}</p>
            {badge ? <Badge tone="brand">{badge}</Badge> : null}
          </div>
          {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
          {email ? <p className="mt-2 truncate text-xs text-muted">{email}</p> : null}
        </div>
        <div className="border-b border-border/60 px-5 py-4 lg:hidden">
          {email ? <p className="truncate text-xs text-muted">{email}</p> : null}
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
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
        <div className="border-t border-border/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button variant="secondary" className="w-full" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export function AppShell() {
  const { session, logout } = useAuth()
  return (
    <ShellFrame
      brand="Turnify"
      email={session?.email}
      links={appLinks}
      onLogout={logout}
    />
  )
}

export function PlatformShell() {
  const { session, logout } = useAuth()
  return (
    <ShellFrame
      brand="Turnify"
      badge="Plataforma"
      email={session?.email}
      links={[
        { to: '/platform', label: 'Dashboard', end: true },
        { to: '/platform/businesses', label: 'Negocios' },
      ]}
      onLogout={logout}
    />
  )
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <p className="font-display text-3xl text-brand-800 sm:text-4xl">Turnify</p>
        <p className="mt-2 text-sm text-muted">Gestión de citas para tu negocio</p>
      </div>
      {children}
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
    <div
      className={`mx-auto min-h-dvh w-full px-4 sm:px-6 ${
        wide ? 'max-w-3xl' : 'max-w-2xl'
      } ${center ? 'flex flex-col justify-center py-12 sm:py-16' : 'py-6 sm:py-10 lg:py-12'}`}
    >
      {children}
    </div>
  )
}
