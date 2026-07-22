export function WizardSteps({
  steps,
  activeIndex,
}: {
  steps: string[]
  activeIndex: number
}) {
  return (
    <ol className="mb-6 grid grid-cols-4 gap-1 sm:gap-2">
      {steps.map((label, i) => {
        const active = i <= activeIndex
        const current = i === activeIndex
        return (
          <li
            key={label}
            className={`rounded-lg px-1 py-2 text-center text-[10px] font-semibold transition duration-200 ease-out sm:rounded-full sm:px-3 sm:py-1.5 sm:text-xs ${
              active ? 'bg-brand-100 text-brand-800' : 'bg-card text-slate-400'
            } ${
              current
                ? 'shadow-sm ring-1 ring-brand-200/80 scale-[1.02] motion-reduce:scale-100'
                : ''
            }`}
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
