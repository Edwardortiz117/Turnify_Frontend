type Segment = {
  key: string
  label: string
  value: number
  colorClass: string
}

const STATUS_SEGMENTS: Record<string, { label: string; colorClass: string }> = {
  confirmed: { label: 'Confirmadas', colorClass: 'bg-brand-600' },
  completed: { label: 'Completadas', colorClass: 'bg-emerald-500' },
  cancelled: { label: 'Canceladas', colorClass: 'bg-danger' },
  no_show: { label: 'No asistió', colorClass: 'bg-warning' },
}

const FALLBACK_COLORS = [
  'bg-sky-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-slate-400',
]

/** Pill-shaped segmented bar for composition stats (e.g. citas por estado). */
export function SegmentedStatBar({
  counts,
  className = '',
}: {
  counts?: Record<string, number> | null
  className?: string
}) {
  const segments: Segment[] = Object.entries(counts ?? {})
    .map(([key, value], i) => {
      const known = STATUS_SEGMENTS[key]
      return {
        key,
        label: known?.label ?? key,
        value: Number(value) || 0,
        colorClass: known?.colorClass ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      }
    })
    .filter((s) => s.value > 0)

  const total = segments.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className={`min-w-0 flex-1 ${className}`}>
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
        role="img"
        aria-label={
          total > 0
            ? `Distribución de citas: ${segments.map((s) => `${s.label} ${s.value}`).join(', ')}`
            : 'Sin datos de distribución'
        }
      >
        {total === 0 ? (
          <span className="block h-full w-full bg-slate-200/80" />
        ) : (
          segments.map((s) => (
            <span
              key={s.key}
              className={`h-full min-w-1 ${s.colorClass}`}
              style={{ width: `${(s.value / total) * 100}%` }}
              title={`${s.label}: ${s.value}`}
            />
          ))
        )}
      </div>
      {total > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {segments.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className={`size-2 shrink-0 rounded-full ${s.colorClass}`} aria-hidden />
              <span>
                {s.label}{' '}
                <span className="font-semibold tabular-nums text-ink">{s.value}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 text-[11px] text-muted">Sin desglose por estado</p>
      )}
    </div>
  )
}
