import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button } from './Button'

const links = [
  { to: '/app', label: 'Dashboard', end: true },
  { to: '/app/appointments', label: 'Agenda' },
  { to: '/app/services', label: 'Servicios' },
  { to: '/app/professionals', label: 'Profesionales' },
  { to: '/app/availability', label: 'Disponibilidad' },
  { to: '/app/clients', label: 'Clientes' },
  { to: '/app/profile', label: 'Perfil' },
]

export function AppShell() {
  const { session, logout } = useAuth()

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-border bg-white/90 lg:border-b-0 lg:border-r">
        <div className="px-5 py-5">
          <p className="font-display text-2xl text-brand-800">Turnify</p>
          <p className="mt-1 truncate text-xs text-muted">{session?.email}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-100 text-brand-800'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-4 pb-4 lg:block">
          <Button variant="secondary" className="w-full" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </aside>
      <main className="px-4 py-6 sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export function PlatformShell() {
  const { session, logout } = useAuth()
  const links = [
    { to: '/platform', label: 'Dashboard', end: true },
    { to: '/platform/businesses', label: 'Negocios' },
  ]

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[220px_1fr]">
      <aside className="border-b border-border bg-slate-900 text-white lg:border-b-0">
        <div className="px-5 py-5">
          <p className="font-display text-2xl">Turnify</p>
          <p className="text-xs text-slate-300">Plataforma</p>
          <p className="mt-2 truncate text-xs text-slate-400">{session?.email}</p>
        </div>
        <nav className="flex gap-1 px-3 pb-3 lg:flex-col">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-white/15' : 'text-slate-300 hover:bg-white/10'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-4 pb-4 lg:block">
          <Button variant="secondary" className="w-full" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </aside>
      <main className="px-4 py-6 sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <p className="font-display text-4xl text-brand-800">Turnify</p>
        <p className="mt-2 text-sm text-muted">Gestión de citas para tu negocio</p>
      </div>
      {children}
    </div>
  )
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8 sm:py-12">
      {children}
    </div>
  )
}
