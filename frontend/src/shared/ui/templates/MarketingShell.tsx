import type { ReactNode } from 'react'
import { SiteFooter } from '../organisms/SiteFooter'

/** Full-bleed landing/auth shell — agenda photo + dark left wash (logoT blends). */
export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-slate-950">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>

      <div
        className="pointer-events-none absolute inset-0"
        role="img"
        aria-label="Agenda de citas en Turnify"
      >
        <div
          className="home-bg-drift absolute inset-[-2%] bg-cover bg-[position:72%_center] sm:bg-[position:78%_center]"
          style={{ backgroundImage: 'url(/citas_agenda.webp)' }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-slate-950 from-5% via-slate-950/75 via-35% to-transparent sm:from-slate-950/95 sm:via-slate-950/55 sm:via-40%"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/70 to-transparent"
          aria-hidden
        />
      </div>

      <main
        id="main-content"
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-12 sm:px-8 lg:px-10 lg:py-16"
      >
        {children}
      </main>

      <div className="home-rise home-rise-delay-5 relative z-10">
        <SiteFooter
          variant="compact"
          className="border-white/10 bg-slate-950/85 backdrop-blur-md [&_p]:text-slate-400 [&_p.font-semibold]:text-white [&_p.font-semibold]:group-hover:text-brand-300"
        />
      </div>
    </div>
  )
}
