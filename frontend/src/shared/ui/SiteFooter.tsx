const year = new Date().getFullYear()

export function SiteFooter({
  variant = 'default',
}: {
  variant?: 'default' | 'compact'
}) {
  const isCompact = variant === 'compact'

  return (
    <footer
      className={`mt-auto border-t border-border/80 bg-white/85 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm ${
        isCompact ? 'px-4 py-3.5 sm:px-6 lg:px-8' : 'px-4 py-7 sm:px-6 sm:py-9'
      }`}
    >
      <div
        className={`mx-auto flex w-full max-w-6xl flex-col items-center justify-center text-center ${
          isCompact ? 'gap-2' : 'gap-3'
        }`}
      >
        <div className="group flex flex-col items-center gap-2 sm:flex-row sm:gap-2.5">
          <span className="inline-flex aspect-square w-[clamp(1.5rem,3.5vw,2rem)] shrink-0 transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
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
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink transition-colors duration-200 group-hover:text-brand-800">
              Akatuski
            </p>
            <p className="text-xs text-pretty text-muted">
              Gestión de citas · San José de Cúcuta
            </p>
          </div>
        </div>

        <p className="text-xs text-muted">© {year} Akatuski</p>
      </div>
    </footer>
  )
}
