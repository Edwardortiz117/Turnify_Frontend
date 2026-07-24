export function WizardSteps({
  steps,
  activeIndex,
}: {
  steps: string[]
  activeIndex: number
}) {
  return (
    <ol className="mb-7 grid grid-cols-4 gap-1.5 sm:gap-2">
      {steps.map((label, i) => {
        const active = i <= activeIndex
        const current = i === activeIndex
        return (
          <li
            key={label}
            aria-current={current ? 'step' : undefined}
            className={`rounded-xl px-1 py-2.5 text-center text-[10px] font-semibold transition duration-200 ease-out sm:rounded-full sm:px-3 sm:py-2 sm:text-xs ${
              active
                ? 'bg-brand-50 text-brand-800 ring-1 ring-brand-200/80'
                : 'bg-white/80 text-slate-400 ring-1 ring-border/80'
            } ${current ? 'shadow-sm' : ''}`}
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
  )
}
