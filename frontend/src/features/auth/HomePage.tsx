import { Link } from 'react-router-dom'
import { Button } from '../../shared/ui/Button'

export function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Turnify</p>
      <h1 className="mt-3 font-display text-5xl leading-tight text-ink sm:text-6xl">
        Citas claras para negocios de Cúcuta
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Configura tu oferta, comparte tu enlace y opera la agenda sin fricción.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/register">
          <Button>Registrar negocio</Button>
        </Link>
        <Link to="/login">
          <Button variant="secondary">Iniciar sesión</Button>
        </Link>
      </div>
      <p className="mt-10 text-sm text-muted">
        ¿Ya tienes slug? Abre <span className="font-mono">/{'{slug}'}</span> para reservar.
      </p>
    </div>
  )
}
