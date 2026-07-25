import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5.5 19.5c1.6-3 4-4.5 6.5-4.5s4.9 1.5 6.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function UserMenu({
  email,
  profileTo,
  onLogout,
}: {
  email?: string
  profileTo?: string
  onLogout: () => void
}) {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [open])

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-white text-ink shadow-sm transition duration-200 hover:border-brand-200 hover:bg-brand-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        aria-label="Menú de usuario"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <UserIcon />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Cuenta"
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-border bg-card py-1.5 shadow-lg"
        >
          {email ? (
            <p className="truncate border-b border-border px-3 py-2 text-xs text-muted" role="none">
              {email}
            </p>
          ) : null}
          {profileTo ? (
            <MenuLink to={profileTo} onNavigate={() => setOpen(false)}>
            Perfil
          </MenuLink>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className="flex w-full px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-red-50"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
          >
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  )
}

function MenuLink({
  to,
  children,
  onNavigate,
}: {
  to: string
  children: ReactNode
  onNavigate: () => void
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      className="block px-3 py-2.5 text-sm font-medium text-ink hover:bg-slate-50"
      onClick={onNavigate}
    >
      {children}
    </Link>
  )
}
