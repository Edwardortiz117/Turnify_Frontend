import type { AvailabilityException, Professional, Service, WeeklySlot } from '../../../shared/api/types'
import { formatInTimeZone } from '../../../shared/datetime'
import { Button, Badge, TextLink } from '../../../shared/ui'

const DAY_LABELS: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
}

const formatTime = (value: string) => value.slice(0, 5)

export type ProfessionalDetailData = {
  professional: Professional
  offered: Service[]
  schedule: WeeklySlot[]
  exceptions: AvailabilityException[]
}

type Props = {
  detail: ProfessionalDetailData
  catalogServices: Service[]
  serviceIds: string[]
  savingServices: boolean
  onClose: () => void
  onToggleService: (serviceId: string) => void
  onSaveServices: () => void
}

export function ProfessionalDetailPanel({
  detail,
  catalogServices,
  serviceIds,
  savingServices,
  onClose,
  onToggleService,
  onSaveServices,
}: Props) {
  const scheduleByDay = [...detail.schedule].sort((a, b) => a.day_of_week - b.day_of_week)

  return (
    <div className="mt-4 space-y-6 rounded-xl border border-border bg-card p-4 sm:p-5" aria-live="polite">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-balance text-ink">
            {detail.professional.name}
          </h2>
          <p className="mt-1 text-sm text-muted">Ficha del profesional</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={detail.professional.status === 'active' ? 'success' : 'neutral'}>
            {detail.professional.status === 'active' ? 'Activo' : 'Bloqueado'}
          </Badge>
          <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>

      <section aria-labelledby="pro-info-heading">
        <h3 id="pro-info-heading" className="mb-3 text-sm font-semibold text-ink">
          Información
        </h3>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-surface px-3 py-2.5">
            <dt className="text-xs font-medium text-muted">Nombre</dt>
            <dd className="mt-0.5 font-medium text-ink">{detail.professional.name}</dd>
          </div>
          <div className="rounded-lg bg-surface px-3 py-2.5">
            <dt className="text-xs font-medium text-muted">Estado</dt>
            <dd className="mt-0.5 font-medium text-ink">
              {detail.professional.status === 'active'
                ? 'Disponible para agenda y vitrina'
                : 'Bloqueado / inactivo'}
            </dd>
          </div>
          <div className="rounded-lg bg-surface px-3 py-2.5 sm:col-span-2">
            <dt className="text-xs font-medium text-muted">ID</dt>
            <dd className="mt-0.5 break-all font-mono text-xs text-ink">{detail.professional.id}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="pro-services-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 id="pro-services-heading" className="text-sm font-semibold text-ink">
              Servicios que ofrece
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Marca los servicios del catálogo que este profesional puede atender.
            </p>
          </div>
          <Button
            className="w-full sm:w-auto"
            disabled={savingServices}
            aria-busy={savingServices}
            onClick={onSaveServices}
          >
            {savingServices ? 'Guardando…' : 'Guardar servicios'}
          </Button>
        </div>
        {catalogServices.length === 0 ? (
          <p className="text-sm text-muted">
            Aún no hay servicios en el catálogo. <TextLink to="/app/services">Crear servicios</TextLink>
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {catalogServices.map((s) => {
              const checked = serviceIds.includes(s.id)
              return (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    checked
                      ? 'border-brand-200 bg-brand-50/70'
                      : 'border-border bg-card hover:bg-surface'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={checked}
                    onChange={() => onToggleService(s.id)}
                  />
                  <span className="min-w-0">
                    <span className="block font-medium text-ink">{s.name}</span>
                    <span className="text-xs tabular-nums text-muted">
                      {s.duration_minutes} min
                      {!s.active ? ' · inactivo en catálogo' : ''}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="pro-availability-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 id="pro-availability-heading" className="text-sm font-semibold text-ink">
              Disponibilidad
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Horario semanal y excepciones. Para editarlos ve a Disponibilidad.
            </p>
          </div>
          <TextLink to="/app/availability">Editar en Disponibilidad</TextLink>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Horario semanal
            </h4>
            {scheduleByDay.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted">
                Sin horario configurado.
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {scheduleByDay.map((slot) => (
                  <li
                    key={`${slot.day_of_week}-${slot.start_time}-${slot.end_time}`}
                    className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2"
                  >
                    <span className="font-medium text-ink">
                      {DAY_LABELS[slot.day_of_week] ?? `Día ${slot.day_of_week}`}
                    </span>
                    <span className="tabular-nums text-muted">
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Excepciones
            </h4>
            {detail.exceptions.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted">
                Sin bloqueos ni aperturas extra.
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {detail.exceptions.map((ex) => (
                  <li key={ex.id} className="rounded-lg bg-surface px-3 py-2">
                    <Badge tone={ex.type === 'block' ? 'warning' : 'brand'}>
                      {ex.type === 'block' ? 'Bloqueo' : 'Extra'}
                    </Badge>
                    <p className="mt-1 text-xs text-pretty text-muted">
                      {formatInTimeZone(ex.starts_at)} → {formatInTimeZone(ex.ends_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
