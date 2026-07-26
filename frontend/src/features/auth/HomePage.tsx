import { useMemo, useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, BrandLogo, Button, Input, SiteFooter } from '../../shared/ui'

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

/**
 * Landing (Persuade): full-bleed split — copy + actions left, product visual right.
 * Uses background-image so global `img { height:auto }` cannot collapse the plane.
 */
export function HomePage() {
  const navigate = useNavigate()
  const remembered = useMemo(() => readRememberedSlug(), [])
  const [slug, setSlug] = useState(remembered)
  const [error, setError] = useState<string | null>(null)

  function goToBooking(e: SubmitEvent) {
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
    <div className="grid min-h-dvh bg-card lg:grid-cols-2">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>

      {/* Visual plane — CSS background fills edge-to-edge */}
      <div
        className="relative order-1 min-h-[40vh] bg-brand-800 bg-cover bg-center lg:order-2 lg:min-h-dvh"
        style={{ backgroundImage: 'url(/citas_agenda.webp)' }}
        role="img"
        aria-label="Agenda de citas en Turnify"
      >
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-ink/10 lg:to-ink/35"
          aria-hidden
        />
        <p className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white/90 sm:bottom-5 sm:left-5 lg:hidden">
          Agenda operativa para negocios de Cúcuta
        </p>
      </div>

      <div className="order-2 flex min-h-0 flex-col lg:order-1 lg:min-h-dvh">
        <main
          id="main-content"
          className="flex flex-1 flex-col justify-center px-5 py-7 sm:px-10 sm:py-9 lg:px-12 xl:px-16"
        >
          <div className="surface-enter w-full max-w-2xl">
            <div className="flex items-center gap-3">
              <BrandLogo size="md" className="!mx-0" />
              <p className="text-xl font-extrabold tracking-tight text-ink">Turnify</p>
            </div>

            <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.12] tracking-tight text-balance text-ink sm:text-4xl lg:text-[2.65rem]">
              Citas claras para negocios de Cúcuta
            </h1>
            <p className="mt-3 max-w-lg text-base text-pretty text-muted sm:text-lg">
              Configura tu oferta, comparte tu enlace y opera la agenda sin fricción.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link to="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:min-w-[10.5rem]">Registrar negocio</Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:min-w-[10.5rem]">
                  Iniciar sesión
                </Button>
              </Link>
            </div>

            <form
              className="mt-7 border-t border-border pt-5"
              onSubmit={goToBooking}
              aria-label="Ir a reserva pública"
            >
              <label htmlFor="home-slug" className="text-sm font-semibold text-ink">
                ¿Ya tienes el enlace? Reserva aquí
              </label>
              <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <div className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-lg border border-border bg-card focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-500/20">
                  <span className="flex items-center bg-surface px-3 font-mono text-sm text-muted">
                    /
                  </span>
                  <Input
                    id="home-slug"
                    className="rounded-none border-0 shadow-none focus:ring-0"
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
                <Button type="submit" variant="secondary" className="w-full shrink-0 sm:w-auto">
                  Ir a reservar
                </Button>
              </div>
              {error ? (
                <div className="mt-2">
                  <Alert>{error}</Alert>
                </div>
              ) : null}
              {!error && slug ? (
                <p className="mt-2 text-xs text-muted">
                  Irás a <span className="font-mono text-brand-800">/{slug}</span>
                  {remembered && remembered === slug ? ' · última visita' : ''}
                </p>
              ) : null}
            </form>
          </div>
        </main>
        <SiteFooter variant="compact" />
      </div>
    </div>
  )
}
