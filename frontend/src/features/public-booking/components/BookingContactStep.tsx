import type { SubmitEvent } from 'react'
import type { Professional, Service, Slot } from '../../../shared/api/types'
import { formatInTimeZone } from '../../../shared/datetime'
import { Button, FormFieldInput, Card } from '../../../shared/ui'

type Props = {
  service: Service
  professional: Professional
  slot: Slot
  timezone: string
  name: string
  phone: string
  email: string
  busy: boolean
  onName: (v: string) => void
  onPhone: (v: string) => void
  onEmail: (v: string) => void
  onBack: () => void
  onSubmit: (e: SubmitEvent) => void
}

export function BookingContactStep({
  service,
  professional,
  slot,
  timezone,
  name,
  phone,
  email,
  busy,
  onName,
  onPhone,
  onEmail,
  onBack,
  onSubmit,
}: Props) {
  return (
    <Card interactive>
      <p className="mb-4 rounded-lg bg-surface px-3 py-2 text-sm text-muted">
        <span className="font-medium text-ink">{service.name}</span>
        {' · '}
        {professional.name}
        {' · '}
        <span className="tabular-nums">{formatInTimeZone(slot.starts_at, timezone)}</span>
      </p>
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormFieldInput
          id="booking-name"
          label="Nombre"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => onName(e.target.value)}
        />
        <FormFieldInput
          id="booking-phone"
          label="Teléfono"
          required
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => onPhone(e.target.value)}
        />
        <FormFieldInput
          id="booking-email"
          label="Correo (opcional)"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => onEmail(e.target.value)}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onBack}
            disabled={busy}
          >
            Atrás
          </Button>
          <Button type="submit" disabled={busy} className="w-full flex-1">
            {busy ? 'Reservando…' : 'Confirmar cita'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
