import { formatInTimeZone } from '../../../shared/datetime'
import { Button, Card, TextLink } from '../../../shared/ui'

type Props = {
  slug: string
  appointmentId: string
  startsAt?: string | null
  timezone: string
  onRequestReschedule: () => void
}

export function BookingSuccessStep({
  slug,
  appointmentId,
  startsAt,
  timezone,
  onRequestReschedule,
}: Props) {
  return (
    <Card className="surface-enter text-center" interactive>
      <div
        className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-200"
        aria-hidden
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-balance text-brand-800">
        ¡Cita confirmada!
      </h2>
      <p className="mt-2 text-sm text-pretty text-muted">
        Guarda este código:{' '}
        <span className="font-mono font-medium text-ink">{appointmentId}</span>
      </p>
      {startsAt ? (
        <p className="mt-3 font-medium tabular-nums text-ink">
          {formatInTimeZone(startsAt, timezone)}
        </p>
      ) : null}
      <div className="mt-6 flex flex-col items-center gap-3">
        <Button variant="secondary" className="w-full sm:w-auto" onClick={onRequestReschedule}>
          Solicitar reprogramación
        </Button>
        <TextLink to={`/${slug}/mis-citas`}>Ver mis citas</TextLink>
        <TextLink to={`/cancel/${appointmentId}`}>¿Necesitas cancelar?</TextLink>
      </div>
    </Card>
  )
}
