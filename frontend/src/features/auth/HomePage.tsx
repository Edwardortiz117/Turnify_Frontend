import { Link } from 'react-router-dom'
import { Button } from '../../shared/ui/Button'

export function HomePage() {
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
      <p className="mt-10 text-sm text-muted">
        ¿Ya tienes slug? Abre <span className="font-mono">/{'{slug}'}</span> para reservar.
      </p>
    </div>
  )
}
