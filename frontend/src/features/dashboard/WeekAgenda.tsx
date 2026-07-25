import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAppointments } from '../../shared/api/business'
import type { Appointment } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import {
  endOfDayIso,
  formatTimeInZone,
  startOfDayIso,
  toDateInputValue,
} from '../../shared/datetime'
import { Alert, AppointmentStatusBadge, Button, Card, Spinner } from '../../shared/ui'

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const

function shiftDateStr(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays))
  const yy = dt.getUTCFullYear()
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

/** Monday = 0 … Sunday = 6 for a YYYY-MM-DD calendar date (Bogotá). */
function mondayOffset(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const utcDow = new Date(Date.UTC(y, m - 1, d)).getUTCDay() // Sun=0
  return utcDow === 0 ? 6 : utcDow - 1
}

function weekDatesFrom(anchor: string): string[] {
  const monday = shiftDateStr(anchor, -mondayOffset(anchor))
  return Array.from({ length: 7 }, (_, i) => shiftDateStr(monday, i))
}

const MONTH_ABBR = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const

/** e.g. jul-22 */
function formatDayWithMonth(dateStr: string): string {
  const monthIdx = Number(dateStr.slice(5, 7)) - 1
  const day = dateStr.slice(8, 10)
  return `${MONTH_ABBR[monthIdx]}-${day}`
}

function formatWeekRange(days: string[]): string {
  const first = days[0]
  const last = days[6]
  const fmt = (s: string) => {
    const [y, m, d] = s.split('-')
    return `${d}/${m}/${y}`
  }
  return `${fmt(first)} – ${fmt(last)}`
}

function dateKeyFromIso(isoUtc: string): string {
  return toDateInputValue(new Date(isoUtc))
}

export function WeekAgenda() {
  const today = useMemo(() => toDateInputValue(), [])
  const [anchor, setAnchor] = useState(today)
  const weekDays = useMemo(() => weekDatesFrom(anchor), [anchor])
  const [items, setItems] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await listAppointments({
          from: startOfDayIso(weekDays[0]),
          to: endOfDayIso(weekDays[6]),
          limit: 200,
        })
        if (!cancelled) setItems(res.items ?? [])
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [weekDays])

  const byDay = useMemo(() => {
    const map: Record<string, Appointment[]> = Object.fromEntries(
      weekDays.map((d) => [d, [] as Appointment[]]),
    )
    for (const a of items) {
      const key = dateKeyFromIso(a.starts_at)
      if (map[key]) map[key].push(a)
    }
    for (const key of weekDays) {
      map[key].sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    }
    return map
  }, [items, weekDays])

  const isCurrentWeek = weekDays[0] === weekDatesFrom(today)[0]

  return (
    <Card className="mt-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-bold tracking-tight text-xl text-ink">Agenda de la semana</h2>
          <p className="mt-0.5 text-sm text-muted tabular-nums">{formatWeekRange(weekDays)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            className="min-w-11"
            aria-label="Semana anterior"
            onClick={() => setAnchor(shiftDateStr(weekDays[0], -7))}
          >
            ←
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isCurrentWeek}
            onClick={() => setAnchor(today)}
          >
            Hoy
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-w-11"
            aria-label="Semana siguiente"
            onClick={() => setAnchor(shiftDateStr(weekDays[0], 7))}
          >
            →
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="-mx-1 overflow-x-auto pb-1">
          <div className="grid min-w-[52rem] grid-cols-7 gap-2 lg:min-w-0">
            {weekDays.map((dateStr, i) => {
              const isToday = dateStr === today
              const dayItems = byDay[dateStr] ?? []
              return (
                <section
                  key={dateStr}
                  className={`flex min-h-48 flex-col rounded-xl border p-2.5 ${
                    isToday
                      ? 'border-brand-300 bg-brand-50/60'
                      : 'border-border/80 bg-surface/50'
                  }`}
                >
                  <header className="mb-2 border-b border-border/50 pb-2">
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        isToday ? 'text-brand-800' : 'text-muted'
                      }`}
                    >
                      {DAY_LABELS[i]}
                    </p>
                    <p
                      className={`font-bold tracking-tight text-lg tabular-nums ${
                        isToday ? 'text-brand-800' : 'text-ink'
                      }`}
                    >
                      {formatDayWithMonth(dateStr)}
                    </p>
                  </header>
                  <ul className="flex flex-1 flex-col gap-1.5">
                    {dayItems.length === 0 ? (
                      <li className="py-2 text-center text-xs text-muted">Sin citas</li>
                    ) : (
                      dayItems.map((a) => (
                        <li
                          key={a.id}
                          className="rounded-lg border border-border/60 bg-card px-2 py-1.5 shadow-sm"
                        >
                          <p className="text-xs font-semibold tabular-nums text-brand-800">
                            {formatTimeInZone(a.starts_at)}
                          </p>
                          <p className="truncate text-sm font-medium text-ink">
                            {a.client?.name ?? 'Cliente'}
                          </p>
                          <p className="truncate text-[11px] text-muted">
                            {a.service?.name ?? 'Servicio'}
                            {a.professional?.name ? ` · ${a.professional.name}` : ''}
                          </p>
                          <div className="mt-1">
                            <AppointmentStatusBadge status={a.status} />
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </section>
              )
            })}
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-sm text-muted">
        <Link
          to="/app/appointments"
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          Abrir agenda completa
        </Link>
      </p>
    </Card>
  )
}
