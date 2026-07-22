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
        return (
          <li
            key={label}
            className={`rounded-lg px-1 py-2 text-center text-[10px] font-semibold sm:rounded-full sm:px-3 sm:py-1.5 sm:text-xs ${
              active ? 'bg-brand-100 text-brand-800' : 'bg-card text-slate-400'
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
