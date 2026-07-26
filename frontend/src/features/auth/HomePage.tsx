import { useMemo, useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Label, Alert, BrandLogo, Card, MarketingShell } from '../../shared/ui'

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
 * Landing: full-bleed agenda visual with dark left wash (logoT black bg blends),
 * content left-aligned, soft motion.
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
    <MarketingShell>
      <div className="w-full max-w-xl text-left lg:mr-auto lg:max-w-lg xl:max-w-xl">
        <div className="home-rise home-rise-delay-1">
          <BrandLogo size="xl" className="mx-0" />
        </div>

        <h1 className="home-rise home-rise-delay-2 mt-5 font-bold tracking-tight text-4xl leading-[1.1] text-balance text-white sm:text-5xl lg:text-[3.35rem]">
          Citas claras para negocios de Cúcuta
        </h1>

        <p className="home-rise home-rise-delay-3 mt-4 max-w-md text-base text-pretty text-slate-300 sm:text-lg">
          Configura tu oferta, comparte tu enlace y opera la agenda sin fricción.
        </p>

        <div className="home-rise home-rise-delay-4 mt-8 flex w-full flex-col gap-3 sm:max-w-md sm:flex-row">
          <Link to="/register" className="w-full sm:w-auto">
            <Button className="w-full shadow-md shadow-brand-700/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-700/30 motion-reduce:hover:translate-y-0">
              Registrar negocio
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              className="w-full border-white/30 bg-white/10 text-white backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white/20 motion-reduce:hover:translate-y-0"
            >
              Iniciar sesión
            </Button>
          </Link>
        </div>

        <Card className="home-card-settle mt-10 w-full max-w-md space-y-4 border-white/80 bg-white/75 shadow-xl shadow-slate-900/12 backdrop-blur-md transition duration-300 hover:bg-white/85 hover:shadow-2xl hover:shadow-slate-900/15">
          <form className="space-y-3" onSubmit={goToBooking} aria-label="Ir a reserva pública">
            <div>
              <Label htmlFor="home-slug">Reservar en un negocio</Label>
              <p className="mt-1 text-xs text-pretty text-muted">
                Ingresa el slug y te llevamos a su página de citas.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <div className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-lg border border-border bg-card shadow-sm focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-500/20">
                <span className="flex items-center bg-slate-50 px-3 font-mono text-sm text-muted">
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
              <Button type="submit" className="w-full shrink-0 sm:w-auto">
                Ir a reservar
              </Button>
            </div>
            {error ? <Alert>{error}</Alert> : null}
            {!error && slug ? (
              <p className="text-xs text-muted">
                Irás a <span className="font-mono text-brand-800">/{slug}</span>
                {remembered && remembered === slug ? ' · última visita' : ''}
              </p>
            ) : null}
          </form>
        </Card>
      </div>
    </MarketingShell>
  )
}
