import { useEffect, useState, type SubmitEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  cancelPublicAppointment,
  getBusinessBySlug,
  lookupPublicAppointments,
} from '../../shared/api/public'
import { PublicRescheduleRequestModal } from './PublicRescheduleRequestModal'
import type { Appointment, PublicBusiness } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { ApiError } from '../../shared/api/ApiError'
import { formatInTimeZone } from '../../shared/datetime'
import { PublicLayout, BrandLogo, Alert, AppointmentStatusBadge, Button, Input, Label, Card, EmptyState, PageLoading, TextLink } from '../../shared/ui'

const PHONE_KEY = (slug: string) => `turnify.myAppointments.phone.${slug}`

export const MyAppointmentsPage = () => {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState<PublicBusiness | null>(null)
  const [phone, setPhone] = useState(() => {
    try {
      return localStorage.getItem(PHONE_KEY(slug)) ?? ''
    } catch {
      return ''
    }
  })
  const [items, setItems] = useState<Appointment[]>([])
  const [searched, setSearched] = useState(false)
  const [loadingBiz, setLoadingBiz] = useState(true)
  const [busy, setBusy] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null)

  const tz = business?.timezone || 'America/Bogota'

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingBiz(true)
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
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.code === 'BUSINESS_SUSPENDED') {
            setError('BUSINESS_SUSPENDED')
          } else {
            setError(getErrorMessage(err))
          }
        }
      } finally {
        if (!cancelled) setLoadingBiz(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [slug])

  const handleLookup = async (e?: SubmitEvent) => {
    e?.preventDefault()
    setError(null)
    setMessage(null)
    setBusy(true)
    setSearched(true)
    try {
      localStorage.setItem(PHONE_KEY(slug), phone.trim())
      const res = await lookupPublicAppointments(slug, phone.trim())
      setItems(res.items ?? [])
    } catch (err) {
      setItems([])
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!business || !phone.trim()) return
    void handleLookup()
    // Auto-lookup once when business loads and a remembered phone exists
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id])

  const handleCancel = async (appointmentId: string) => {
    setError(null)
    setMessage(null)
    setCancellingId(appointmentId)
    try {
      await cancelPublicAppointment(appointmentId, phone.trim())
      setMessage('Cita cancelada.')
      setItems((prev) => prev.filter((a) => a.id !== appointmentId))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCancellingId(null)
    }
  }

  if (loadingBiz) {
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
          description="Este negocio está temporalmente suspendido o cerrado."
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
      <header className="mb-7 sm:mb-9">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <BrandLogo size="md" className="!mx-0" />
          <TextLink to={`/${slug}`}>Reservar cita</TextLink>
        </div>
        <h1 className="mt-3 font-bold tracking-tight text-3xl tracking-tight text-balance text-ink sm:text-4xl">
          Mis citas
        </h1>
        <p className="mt-2 max-w-xl text-sm text-pretty text-muted sm:text-base">
          Consulta y gestiona tus reservas en {business.name} con el teléfono de la reserva.
        </p>
      </header>

      <Card className="mb-4">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleLookup}>
          <div className="min-w-0 flex-1">
            <Label htmlFor="my-phone">Teléfono</Label>
            <Input
              id="my-phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="El mismo de la reserva"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full sm:w-auto" aria-busy={busy}>
            {busy ? 'Buscando…' : 'Ver citas'}
          </Button>
        </form>
      </Card>

      {error && error !== 'BUSINESS_SUSPENDED' ? (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      {message ? (
        <div className="mb-3">
          <Alert tone="success">{message}</Alert>
        </div>
      ) : null}

      {searched && !busy && items.length === 0 && !error ? (
        <EmptyState
          title="Sin citas activas"
          description="No hay reservas confirmadas próximas con este teléfono."
          actionLabel="Reservar cita"
          onAction={() => navigate(`/${slug}`)}
        />
      ) : null}

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a.id} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <AppointmentStatusBadge status={a.status} />
                <span className="font-semibold text-ink">
                  {a.service?.name ?? 'Servicio'}
                </span>
              </div>
              <p className="text-sm text-muted">
                {formatInTimeZone(a.starts_at, tz)}
                {a.professional?.name ? ` · ${a.professional.name}` : ''}
              </p>
              <p className="font-mono text-xs text-muted break-all">ID: {a.id}</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => setRescheduleTarget(a)}
                >
                  Solicitar reprogramación
                </Button>
                <Button
                  variant="danger"
                  className="w-full sm:w-auto"
                  disabled={cancellingId === a.id}
                  aria-busy={cancellingId === a.id}
                  onClick={() => void handleCancel(a.id)}
                >
                  {cancellingId === a.id ? 'Cancelando…' : 'Cancelar cita'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-muted">
        <Link to={`/${slug}`} className="font-semibold text-brand-700 hover:underline">
          ← Volver a reservar
        </Link>
      </p>

      {rescheduleTarget ? (
        <PublicRescheduleRequestModal
          open
          slug={slug}
          appointmentId={rescheduleTarget.id}
          defaultPhone={phone}
          clientName={rescheduleTarget.client?.name}
          onClose={() => setRescheduleTarget(null)}
        />
      ) : null}
    </PublicLayout>
  )
}
