import { useEffect, useMemo, useState, type SubmitEvent } from 'react'
import { useParams } from 'react-router-dom'
import {
  createPublicAppointment,
  getBusinessBySlug,
  listProfessionalsForService,
  listPublicServices,
  listSlots,
} from '../../shared/api/public'
import type { Professional, PublicBusiness, Service, Slot } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { ApiError } from '../../shared/api/ApiError'
import { toDateInputValue } from '../../shared/datetime'
import { PublicLayout, BrandLogo, Alert, EmptyState, PageLoading, TextLink, WizardSteps } from '../../shared/ui'
import { PublicRescheduleRequestModal } from './PublicRescheduleRequestModal'
import { BookingContactStep } from './components/BookingContactStep'
import { BookingProfessionalStep } from './components/BookingProfessionalStep'
import { BookingServiceStep } from './components/BookingServiceStep'
import { BookingSlotStep } from './components/BookingSlotStep'
import { BookingSuccessStep } from './components/BookingSuccessStep'

type Step = 'service' | 'professional' | 'slot' | 'contact' | 'done'

function rememberedPhone(slug: string): string {
  try {
    return localStorage.getItem(`turnify.phone.${slug}`) ?? ''
  } catch {
    return ''
  }
}

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
  const [phone, setPhone] = useState(() => rememberedPhone(slug))
  const [email, setEmail] = useState('')
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)

  const tz = business?.timezone || 'America/Bogota'
  const stepsLabel = useMemo(() => ['Servicio', 'Profesional', 'Horario', 'Datos'], [])

  useEffect(() => {
    setPhone(rememberedPhone(slug))
  }, [slug])

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const biz = await getBusinessBySlug(slug)
        if (controller.signal.aborted) return
        if (biz.status === 'suspended') {
          setError('BUSINESS_SUSPENDED')
          setBusiness(biz)
          return
        }
        setBusiness(biz)
        const svc =
          biz.services?.filter((s) => s.active) ??
          (await listPublicServices(slug)).filter((s) => s.active)
        if (!controller.signal.aborted) setServices(svc)
      } catch (err) {
        if (controller.signal.aborted) return
        if (err instanceof ApiError && err.code === 'BUSINESS_SUSPENDED') {
          setError('BUSINESS_SUSPENDED')
        } else {
          setError(getErrorMessage(err))
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [slug])

  useEffect(() => {
    if (!service) return
    const controller = new AbortController()
    async function loadPros() {
      setBusy(true)
      setError(null)
      try {
        const list = await listProfessionalsForService(slug, service!.id)
        if (!controller.signal.aborted) {
          setProfessionals(list.filter((p) => p.status === 'active'))
          setStep('professional')
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(getErrorMessage(err))
      } finally {
        if (!controller.signal.aborted) setBusy(false)
      }
    }
    void loadPros()
    return () => controller.abort()
  }, [service, slug])

  useEffect(() => {
    if (!service || !professional || step !== 'slot') return
    const controller = new AbortController()
    async function loadSlots() {
      setBusy(true)
      setError(null)
      try {
        const list = await listSlots(slug, professional!.id, service!.id, date)
        if (!controller.signal.aborted) setSlots(list)
      } catch (err) {
        if (!controller.signal.aborted) setError(getErrorMessage(err))
      } finally {
        if (!controller.signal.aborted) setBusy(false)
      }
    }
    void loadSlots()
    return () => controller.abort()
  }, [service, professional, date, step, slug])

  async function submit(e: SubmitEvent) {
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
      try {
        localStorage.setItem(
          'turnify.lastAppointment',
          JSON.stringify({ id: appt.id, slug, phone }),
        )
        localStorage.setItem(`turnify.phone.${slug}`, phone)
      } catch {
        /* ignore quota */
      }
      setStep('done')
    } catch (err) {
      if (err instanceof ApiError && err.code === 'CLIENT_BLOCKED') {
        setError('Este teléfono está bloqueado y no puede reservar. Contacta al negocio.')
      } else {
        setError(getErrorMessage(err))
      }
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
        <PageLoading />
      </PublicLayout>
    )
  }

  if (error === 'BUSINESS_SUSPENDED' || business?.status === 'suspended') {
    return (
      <PublicLayout>
        <EmptyState
          title="Negocio no disponible"
          description="Este negocio está temporalmente suspendido o cerrado. Intenta más tarde."
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

  const wizardIndex = ['service', 'professional', 'slot', 'contact'].indexOf(step)

  return (
    <PublicLayout>
      <header className="mb-7 sm:mb-9">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <BrandLogo size="md" className="!mx-0" />
          <TextLink to={`/${slug}/mis-citas`}>Mis citas</TextLink>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">
          {business.name}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-pretty text-muted sm:text-base">
          Reserva tu cita en pocos pasos.
        </p>
      </header>

      {step !== 'done' && wizardIndex >= 0 ? (
        <WizardSteps steps={stepsLabel} activeIndex={wizardIndex} />
      ) : null}

      {error && error !== 'BUSINESS_SUSPENDED' ? (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      {step === 'service' ? (
        <BookingServiceStep
          services={services}
          selectedId={service?.id}
          onSelect={(s) => {
            setService(s)
            setProfessional(null)
            setSlot(null)
          }}
        />
      ) : null}

      {step === 'professional' ? (
        <BookingProfessionalStep
          professionals={professionals}
          busy={busy}
          selectedId={professional?.id}
          onBack={() => {
            setService(null)
            setStep('service')
          }}
          onSelect={(p) => {
            setProfessional(p)
            setStep('slot')
          }}
        />
      ) : null}

      {step === 'slot' && professional && service ? (
        <BookingSlotStep
          date={date}
          timezone={tz}
          slots={slots}
          busy={busy}
          selectedStartsAt={slot?.starts_at}
          onBack={() => setStep('professional')}
          onDateChange={(d) => {
            setDate(d)
            setSlot(null)
          }}
          onSelect={(s) => {
            setSlot(s)
            setStep('contact')
          }}
        />
      ) : null}

      {step === 'contact' && slot && service && professional ? (
        <BookingContactStep
          service={service}
          professional={professional}
          slot={slot}
          timezone={tz}
          name={name}
          phone={phone}
          email={email}
          busy={busy}
          onName={setName}
          onPhone={setPhone}
          onEmail={setEmail}
          onBack={() => setStep('slot')}
          onSubmit={(e) => void submit(e)}
        />
      ) : null}

      {step === 'done' && appointmentId ? (
        <BookingSuccessStep
          slug={slug}
          appointmentId={appointmentId}
          startsAt={slot?.starts_at}
          timezone={tz}
          onRequestReschedule={() => setRescheduleOpen(true)}
        />
      ) : null}

      {appointmentId ? (
        <PublicRescheduleRequestModal
          open={rescheduleOpen}
          slug={slug}
          appointmentId={appointmentId}
          defaultPhone={phone}
          clientName={name}
          onClose={() => setRescheduleOpen(false)}
        />
      ) : null}
    </PublicLayout>
  )
}
