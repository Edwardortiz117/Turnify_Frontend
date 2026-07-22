import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function readRememberedSlug(): string {
  try {
    const raw = localStorage.getItem('turnify.lastAppointment')
    if (!raw) return ''
    const data = JSON.parse(raw) as { slug?: string }
    return typeof data.slug === 'string' ? slugify(data.slug) : ''
  } catch {
    return ''
  }
}

export function HomePage() {
  const navigate = useNavigate()
  const remembered = useMemo(() => readRememberedSlug(), [])
  const [slug, setSlug] = useState(remembered)
  const [error, setError] = useState<string | null>(null)

  function goToBooking(e: FormEvent) {
    e.preventDefault()
    const clean = slugify(slug.trim())
    if (!clean) {
      setError('Escribe el enlace del negocio (slug).')
      return
    }
    setError(null)
    navigate(`/${clean}`)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 sm:text-sm">
        Turnify
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
        Citas claras para negocios de Cúcuta
      </h1>
      <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
        Configura tu oferta, comparte tu enlace y opera la agenda sin fricción.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:max-w-md sm:flex-row sm:flex-wrap">
        <Link to="/register" className="w-full sm:w-auto">
          <Button className="w-full">Registrar negocio</Button>
        </Link>
        <Link to="/login" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full">
            Iniciar sesión
          </Button>
        </Link>
      </div>

      <form
        className="mt-10 w-full max-w-md space-y-3 rounded-xl border border-border bg-white/80 p-4 sm:p-5"
        onSubmit={goToBooking}
      >
        <div>
          <Label htmlFor="home-slug">Reservar en un negocio</Label>
          <p className="mt-1 text-xs text-muted">
            Ingresa el slug y te llevamos a su página de citas.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-lg border border-border bg-white focus-within:ring-2 focus-within:ring-brand-500">
            <span className="flex items-center bg-slate-50 px-3 font-mono text-sm text-muted">
              /
            </span>
            <Input
              id="home-slug"
              className="rounded-none border-0 focus:ring-0"
              placeholder="tu-negocio"
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value))
                setError(null)
              }}
              autoComplete="off"
              inputMode="text"
            />
          </div>
          <Button type="submit" className="w-full shrink-0 sm:w-auto">
            Ir a reservar
          </Button>
        </div>
        {slug ? (
          <p className="text-xs text-muted">
            Redirigirá a{' '}
            <span className="font-mono text-brand-800">/{slug}</span>
          </p>
        ) : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {remembered && remembered === slug ? (
          <p className="text-xs text-muted">Usamos el último negocio que visitaste.</p>
        ) : null}
      </form>
    </div>
  )
}
