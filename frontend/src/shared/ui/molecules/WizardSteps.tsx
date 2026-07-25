import { cn } from '../../lib/cn'

export function WizardSteps({
  steps,
  activeIndex,
}: {
  steps: string[]
  activeIndex: number
}) {
  return (
    <nav aria-label="Progreso de reserva" className="mb-7">
      <ol className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {steps.map((label, i) => {
          const done = i < activeIndex
          const current = i === activeIndex
          return (
            <li
              key={label}
              aria-current={current ? 'step' : undefined}
              className={cn(
                'rounded-lg px-1 py-2.5 text-center text-[10px] font-semibold transition-colors duration-[var(--duration-ui)] sm:px-3 sm:py-2 sm:text-xs',
                current && 'bg-brand-50 text-brand-800 ring-1 ring-brand-200',
                done && !current && 'bg-brand-50/60 text-brand-700',
                !done && !current && 'bg-card text-muted ring-1 ring-border',
              )}
            >
              <span className="sm:hidden">{i + 1}</span>
              <span className="hidden sm:inline">
                {i + 1}. {label}
              </span>
              <span className="mt-0.5 block truncate sm:hidden">{label}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
