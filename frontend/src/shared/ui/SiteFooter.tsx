import { Link } from 'react-router-dom'

type FooterLink = { to: string; label: string }

const year = new Date().getFullYear()

export function SiteFooter({
  variant = 'default',
  links,
}: {
  variant?: 'default' | 'compact'
  links?: FooterLink[]
}) {
  const isCompact = variant === 'compact'

  return (
    <footer
      className={`mt-auto border-t border-border bg-white/80 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${
        isCompact
          ? 'px-4 py-3 sm:px-6 lg:px-8'
          : 'px-4 py-6 sm:px-6 sm:py-8'
      }`}
    >
      <div
        className={`mx-auto flex w-full flex-col gap-3 ${
          isCompact ? 'max-w-6xl sm:flex-row sm:items-center sm:justify-between' : 'max-w-3xl gap-4'
        }`}
      >
        <div className={`flex items-center gap-2 ${isCompact ? '' : 'flex-col sm:flex-row sm:items-center'}`}>
          <span className="inline-flex aspect-square w-[clamp(1.5rem,3.5vw,2rem)] shrink-0">
            <img
              src="/favicon.svg"
              alt=""
              width={32}
              height={32}
              className="h-auto w-full max-w-full object-contain"
              decoding="async"
              aria-hidden
            />
          </span>
          <div className={isCompact ? 'min-w-0' : 'text-center sm:text-left'}>
            <p className="text-sm font-semibold text-ink">Akatuski</p>
            <p className="text-xs text-pretty text-muted">
              Gestión de citas · San José de Cúcuta
            </p>
          </div>
        </div>

        {links && links.length > 0 ? (
          <nav aria-label="Pie de página" className="flex flex-wrap gap-x-4 gap-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <p className={`text-xs text-muted ${isCompact ? '' : 'text-center sm:text-left'}`}>
          © {year} Akatuski
        </p>
      </div>
    </footer>
  )
}
