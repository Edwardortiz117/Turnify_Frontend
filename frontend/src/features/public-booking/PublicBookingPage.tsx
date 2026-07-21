import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  createPublicAppointment,
  getBusinessBySlug,
  listProfessionalsForService,
  listPublicServices,
  listSlots,
} from './api'
import type { Professional, PublicBusiness, Service, Slot } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { ApiError } from '../../shared/api/ApiError'
import { formatInTimeZone, formatTimeInZone, toDateInputValue } from '../../shared/datetime'
import { PublicLayout } from '../../shared/ui/layouts'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Card, EmptyState, Spinner } from '../../shared/ui/feedback'

type Step = 'service' | 'professional' | 'slot' | 'contact' | 'done'

export function PublicBookingPage() {
  const { slug = '' } = useParams()
  const [business, setBusiness] = useState<PublicBusiness | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [step, setStep] = useState<Step>('service')
  const [service, setService] = useState<Service | null>(null)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [date, setDate] = useState(toDateInputValue())
  const [slot, setSlot] = useState<Slot | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tz = business?.timezone || 'America/Bogota'

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const biz = await getBusinessBySlug(slug)
        if (cancelled) return
        if (biz.status === 'suspended') {
          setError('BUSINESS_SUSPENDED')
          setBusiness(biz)
          return
        }
        setBusiness(biz)
        const svc =
          biz.services?.filter((s) => s.active) ??
          (await listPublicServices(slug)).filter((s) => s.active)
        setServices(svc)
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
  }, [slug])

  useEffect(() => {
    if (!service) return
    let cancelled = false
    async function loadPros() {
      setBusy(true)
      setError(null)
      try {
        const list = await listProfessionalsForService(slug, service!.id)
        if (!cancelled) {
          setProfessionals(list.filter((p) => p.status === 'active'))
          setStep('professional')
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setBusy(false)
      }
    }
    void loadPros()
    return () => {
      cancelled = true
    }
  }, [service, slug])

  useEffect(() => {
    if (!service || !professional || step !== 'slot') return
    let cancelled = false
    async function loadSlots() {
      setBusy(true)
      setError(null)
      try {
        const list = await listSlots(slug, professional!.id, service!.id, date)
        if (!cancelled) setSlots(list)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setBusy(false)
      }
    }
    void loadSlots()
    return () => {
      cancelled = true
    }
  }, [service, professional, date, step, slug])

  const stepsLabel = useMemo(
    () => ['Servicio', 'Profesional', 'Horario', 'Datos'],
    [],
  )

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!service || !professional || !slot) return
    setBusy(true)
    setError(null)
    try {
      const idem = crypto.randomUUID()
      const appt = await createPublicAppointment(
        slug,
        {
          professional_id: professional.id,
          service_id: service.id,
          starts_at: slot.starts_at,
          client: { name, phone, email: email || null },
        },
        idem,
      )
      setAppointmentId(appt.id)
      localStorage.setItem(
        'turnify.lastAppointment',
        JSON.stringify({ id: appt.id, slug, phone }),
      )
      setStep('done')
    } catch (err) {
      setError(getErrorMessage(err))
      if (err instanceof ApiError && err.code === 'SLOT_OCCUPIED') {
        setStep('slot')
        setSlot(null)
      }
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center py-20"><Spinner /></div>
      </PublicLayout>
    )
  }

  if (error === 'BUSINESS_SUSPENDED' || (business?.status === 'suspended')) {
    return (
      <PublicLayout>
        <EmptyState
          title="Negocio no disponible"
          description="Este negocio está temporalmente suspendido."
        />
      </PublicLayout>
    )
  }

  if (!business) {
    return (
      <PublicLayout>
        <EmptyState title="Negocio no encontrado" description={error ?? undefined} />
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Turnify</p>
        <h1 className="mt-1 font-display text-4xl text-ink">{business.name}</h1>
        <p className="mt-2 text-muted">Reserva tu cita en pocos pasos.</p>
      </header>

      {step !== 'done' ? (
        <ol className="mb-6 flex flex-wrap gap-2 text-xs font-semibold text-muted">
          {stepsLabel.map((label, i) => (
            <li
              key={label}
              className={`rounded-full px-3 py-1 ${
                i <= ['service', 'professional', 'slot', 'contact'].indexOf(step)
                  ? 'bg-brand-100 text-brand-800'
                  : 'bg-white text-slate-400'
              }`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>
      ) : null}

      {error && error !== 'BUSINESS_SUSPENDED' ? (
        <div className="mb-4"><Alert>{error}</Alert></div>
      ) : null}

      {step === 'service' ? (
        <div className="space-y-3">
          {services.length === 0 ? (
            <EmptyState title="Sin servicios" description="Este negocio aún no publicó servicios." />
          ) : (
            services.map((s) => (
              <button
                key={s.id}
                type="button"
                className="w-full rounded-xl border border-border bg-white p-4 text-left shadow-sm transition hover:border-brand-500"
                onClick={() => {
                  setService(s)
                  setProfessional(null)
                  setSlot(null)
                }}
              >
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted">{s.duration_minutes} min</p>
              </button>
            ))
          )}
        </div>
      ) : null}

      {step === 'professional' ? (
        <div className="space-y-3">
          <Button variant="ghost" onClick={() => { setService(null); setStep('service') }}>
            ← Cambiar servicio
          </Button>
          {busy ? <Spinner /> : null}
          {!busy && professionals.length === 0 ? (
            <EmptyState title="Sin profesionales" description="Nadie ofrece este servicio ahora." />
          ) : null}
          {professionals.map((p) => (
            <button
              key={p.id}
              type="button"
              className="w-full rounded-xl border border-border bg-white p-4 text-left shadow-sm hover:border-brand-500"
              onClick={() => {
                setProfessional(p)
                setStep('slot')
              }}
            >
              <p className="font-semibold">{p.name}</p>
            </button>
          ))}
        </div>
      ) : null}

      {step === 'slot' && professional && service ? (
        <Card className="space-y-4">
          <Button variant="ghost" onClick={() => setStep('professional')}>
            ← Cambiar profesional
          </Button>
          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              min={toDateInputValue()}
              onChange={(e) => {
                setDate(e.target.value)
                setSlot(null)
              }}
            />
          </div>
          {busy ? <Spinner /> : null}
          {!busy && slots.length === 0 ? (
            <EmptyState
              title="Sin horarios"
              description="Prueba otra fecha."
            />
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s.starts_at}
                  type="button"
                  className={`rounded-lg border px-2 py-2 text-sm font-medium ${
                    slot?.starts_at === s.starts_at
                      ? 'border-brand-600 bg-brand-100 text-brand-800'
                      : 'border-border bg-white hover:border-brand-400'
                  }`}
                  onClick={() => {
                    setSlot(s)
                    setStep('contact')
                  }}
                >
                  {formatTimeInZone(s.starts_at, tz)}
                </button>
              ))}
            </div>
          )}
        </Card>
      ) : null}

      {step === 'contact' && slot && service && professional ? (
        <Card>
          <p className="mb-4 text-sm text-muted">
            {service.name} · {professional.name} ·{' '}
            {formatInTimeZone(slot.starts_at, tz)}
          </p>
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Correo (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setStep('slot')}>
                Atrás
              </Button>
              <Button type="submit" disabled={busy} className="flex-1">
                {busy ? 'Reservando…' : 'Confirmar cita'}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {step === 'done' && appointmentId ? (
        <Card className="text-center">
          <h2 className="font-display text-2xl text-brand-800">¡Cita confirmada!</h2>
          <p className="mt-2 text-sm text-muted">
            Guarda este código: <span className="font-mono text-ink">{appointmentId}</span>
          </p>
          {slot ? (
            <p className="mt-3 font-medium">{formatInTimeZone(slot.starts_at, tz)}</p>
          ) : null}
          <div className="mt-6">
            <Link
              className="text-sm font-semibold text-brand-700 underline"
              to={`/cancel/${appointmentId}`}
            >
              ¿Necesitas cancelar?
            </Link>
          </div>
        </Card>
      ) : null}
    </PublicLayout>
  )
}
