import { useEffect, useState, type SubmitEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  cancelPublicAppointment,
  getBusinessBySlug,
  lookupPublicAppointments,
} from '../../shared/api/public'
import { PublicRescheduleRequestModal } from './PublicRescheduleRequestModal'
import type { Appointment } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { formatInTimeZone } from '../../shared/datetime'
import {
  getClientPhone,
  listRememberedBusinesses,
  migrateLegacyClientPhone,
  rememberBusiness,
  setClientPhone,
  type RememberedBusiness,
} from '../../shared/storage/clientAppointmentsStorage'
import {
  PublicLayout,
  BrandLogo,
  Alert,
  AppointmentStatusBadge,
  Button,
  Input,
  Label,
  Card,
  EmptyState,
  TextLink,
} from '../../shared/ui'

export type ClientAppointment = Appointment & {
  business: RememberedBusiness
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function lookupAcrossBusinesses(
  phone: string,
  businesses: RememberedBusiness[],
): Promise<{ items: ClientAppointment[]; warnings: string[] }> {
  const warnings: string[] = []
  const settled = await Promise.allSettled(
    businesses.map(async (biz) => {
      const res = await lookupPublicAppointments(biz.slug, phone)
      return (res.items ?? []).map(
        (a): ClientAppointment => ({
          ...a,
          business: biz,
        }),
      )
    }),
  )

  const items: ClientAppointment[] = []
  settled.forEach((result, i) => {
    const biz = businesses[i]
    if (result.status === 'fulfilled') {
      items.push(...result.value)
      return
    }
    warnings.push(`No se pudieron cargar citas de /${biz.slug}.`)
  })

  items.sort((a, b) => a.starts_at.localeCompare(b.starts_at))
  return { items, warnings }
}

/**
 * Global client appointments hub (not tied to a single business URL).
 * Aggregates lookup across businesses remembered on this device.
 */
export function MyAppointmentsPage() {
  const { slug: routeSlug = '' } = useParams()
  const navigate = useNavigate()
  const seededSlug = slugify(routeSlug)

  const [phone, setPhone] = useState(() => migrateLegacyClientPhone(seededSlug) || getClientPhone())
  const [businesses, setBusinesses] = useState<RememberedBusiness[]>(() =>
    listRememberedBusinesses(),
  )
  const [items, setItems] = useState<ClientAppointment[]>([])
  const [addSlug, setAddSlug] = useState('')
  const [searched, setSearched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<ClientAppointment | null>(null)

  const [autoLookupDone, setAutoLookupDone] = useState(false)

  // Seed business from /:slug/mis-citas deep link
  useEffect(() => {
    if (!seededSlug) return
    let cancelled = false
    void getBusinessBySlug(seededSlug)
      .then((biz) => {
        if (cancelled) return
        const next = rememberBusiness({
          slug: biz.slug || seededSlug,
          name: biz.name,
          timezone: biz.timezone,
        })
        setBusinesses(next)
      })
      .catch(() => {
        if (cancelled) return
        setBusinesses(rememberBusiness({ slug: seededSlug, name: seededSlug }))
      })
    return () => {
      cancelled = true
    }
  }, [seededSlug])

  async function handleLookup(e?: SubmitEvent) {
    e?.preventDefault()
    setError(null)
    setMessage(null)
    setWarnings([])
    const cleanPhone = phone.trim()
    if (!cleanPhone) {
      setError('Ingresa el teléfono de la reserva.')
      return
    }

    const known = listRememberedBusinesses()
    setBusinesses(known)
    if (known.length === 0) {
      setSearched(true)
      setItems([])
      setError(
        'Aún no hay negocios en este dispositivo. Agrega el enlace (slug) de un negocio donde reservaste.',
      )
      return
    }

    setBusy(true)
    setSearched(true)
    setClientPhone(cleanPhone)
    try {
      const { items: found, warnings: w } = await lookupAcrossBusinesses(cleanPhone, known)
      setItems(found)
      setWarnings(w)
    } catch (err) {
      setItems([])
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (autoLookupDone) return
    if (!phone.trim() || businesses.length === 0) return
    setAutoLookupDone(true)
    void handleLookup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLookupDone, phone, businesses])

  async function handleAddBusiness(e: SubmitEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const clean = slugify(addSlug)
    if (!clean) {
      setError('Escribe el slug del negocio (ej. mi-barberia).')
      return
    }
    setAdding(true)
    try {
      const biz = await getBusinessBySlug(clean)
      if (biz.status === 'suspended') {
        setError('Ese negocio no está disponible por ahora.')
        return
      }
      const next = rememberBusiness({
        slug: biz.slug || clean,
        name: biz.name,
        timezone: biz.timezone,
      })
      setBusinesses(next)
      setAddSlug('')
      setMessage(`Negocio agregado: ${biz.name}`)
      if (phone.trim()) {
        setBusy(true)
        setSearched(true)
        setClientPhone(phone.trim())
        const { items: found, warnings: w } = await lookupAcrossBusinesses(phone.trim(), next)
        setItems(found)
        setWarnings(w)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setAdding(false)
      setBusy(false)
    }
  }

  async function handleCancel(appointmentId: string) {
    setError(null)
    setMessage(null)
    setCancellingId(appointmentId)
    try {
      await cancelPublicAppointment(appointmentId, phone.trim())
      setMessage('Cita cancelada.')
      setItems((prev) => prev.filter((a) => a.id !== appointmentId))
    } catch (err) {
      setError(getErrorMessage(err))
      // Refresh list — backend may have a different status than the last lookup.
      try {
        const known = listRememberedBusinesses()
        if (phone.trim() && known.length > 0) {
          const { items: found, warnings: w } = await lookupAcrossBusinesses(
            phone.trim(),
            known,
          )
          setItems(found)
          setWarnings(w)
        }
      } catch {
        /* keep previous items if refresh fails */
      }
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <PublicLayout wide>
      <header className="mb-5 sm:mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <BrandLogo size="md" className="!mx-0" />
          <TextLink to="/">Ir al inicio</TextLink>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-balance text-ink sm:text-3xl">
          Mis citas
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-pretty text-muted">
          Consulta reservas de todos los negocios Turnify que hayas visitado en este dispositivo,
          con el teléfono de la reserva.
        </p>
      </header>

      <Card className="mb-4 space-y-4">
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

        <form
          className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end"
          onSubmit={(e) => void handleAddBusiness(e)}
        >
          <div className="min-w-0 flex-1">
            <Label htmlFor="add-business-slug">Agregar negocio (slug)</Label>
            <div className="flex min-w-0 items-stretch overflow-hidden rounded-lg border border-border bg-card focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-500/20">
              <span className="flex items-center bg-slate-50 px-3 font-mono text-sm text-muted">
                /
              </span>
              <Input
                id="add-business-slug"
                className="rounded-none border-0 shadow-none focus:ring-0"
                value={addSlug}
                onChange={(e) => setAddSlug(slugify(e.target.value))}
                placeholder="nombre-del-negocio"
                autoComplete="off"
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              Si reservaste en otro local, agrégalo aquí para incluirlo en la búsqueda.
            </p>
          </div>
          <Button
            type="submit"
            variant="secondary"
            disabled={adding}
            className="w-full sm:w-auto"
            aria-busy={adding}
          >
            {adding ? 'Agregando…' : 'Agregar'}
          </Button>
        </form>

        {businesses.length > 0 ? (
          <p className="text-xs text-muted">
            Negocios en este dispositivo:{' '}
            {businesses.map((b) => b.name).join(' · ')}
          </p>
        ) : null}
      </Card>

      {error ? (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      {warnings.map((w) => (
        <div key={w} className="mb-2">
          <Alert tone="warning">{w}</Alert>
        </div>
      ))}
      {message ? (
        <div className="mb-3">
          <Alert tone="success">{message}</Alert>
        </div>
      ) : null}

      {searched && !busy && items.length === 0 && !error ? (
        <EmptyState
          title="Sin citas activas"
          description="No hay reservas confirmadas próximas con este teléfono en los negocios guardados."
          actionLabel="Ir al inicio"
          onAction={() => navigate('/')}
        />
      ) : null}

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((a) => {
            const tz = a.business.timezone || 'America/Bogota'
            return (
              <Card key={`${a.business.slug}-${a.id}`} className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <AppointmentStatusBadge status={a.status} />
                  <span className="font-semibold text-ink">
                    {a.service?.name ?? 'Servicio'}
                  </span>
                </div>
                <p className="text-sm font-medium text-brand-800">
                  {a.business.name}
                  <span className="font-mono text-xs font-normal text-muted">
                    {' '}
                    /{a.business.slug}
                  </span>
                </p>
                <p className="text-sm text-muted">
                  {formatInTimeZone(a.starts_at, tz)}
                  {a.professional?.name ? ` · ${a.professional.name}` : ''}
                </p>
                <p className="font-mono text-xs text-muted break-all">ID: {a.id}</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Link to={`/${a.business.slug}`} className="w-full sm:w-auto">
                    <Button variant="secondary" className="w-full">
                      Ir al negocio
                    </Button>
                  </Link>
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
            )
          })}
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/" className="font-semibold text-brand-700 hover:underline">
          ← Volver al inicio
        </Link>
      </p>

      {rescheduleTarget ? (
        <PublicRescheduleRequestModal
          open
          slug={rescheduleTarget.business.slug}
          appointmentId={rescheduleTarget.id}
          defaultPhone={phone}
          clientName={rescheduleTarget.client?.name}
          businessName={rescheduleTarget.business.name}
          onClose={() => setRescheduleTarget(null)}
        />
      ) : null}
    </PublicLayout>
  )
}
