import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { getProfile, updateProfile } from '../../shared/api/business'
import type { Business } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { ChangePasswordCard } from '../auth/ChangePasswordCard'
import {
  Alert,
  Button,
  ConfirmDialog,
  FormFieldInput,
  Badge,
  Card,
  EmptyState,
  PageHeader,
  PageLoading,
  TextLink,
} from '../../shared/ui'

export function ProfilePage() {
  const [profile, setProfile] = useState<Business | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)

  const loadProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      setProfile(await getProfile())
    } catch (err) {
      setProfile(null)
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfile()
  }, [])

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    if (!profile) return
    setError(null)
    setSaving(true)
    try {
      const updated = await updateProfile({
        name: profile.name,
        slug: profile.slug,
        cancellation_min_hours: profile.cancellation_min_hours,
      })
      setProfile(updated)
      toast.success('Perfil actualizado')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleToggleOpenClosed = async () => {
    if (!profile) return
    const next = profile.status === 'suspended' ? 'active' : 'suspended'
    setError(null)
    setToggling(true)
    try {
      const updated = await updateProfile({ status: next })
      setProfile({ ...profile, ...updated })
      setConfirmClose(false)
      toast.success(
        next === 'suspended'
          ? 'Negocio cerrado: la vitrina no acepta reservas'
          : 'Negocio abierto: la vitrina acepta reservas',
      )
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setToggling(false)
    }
  }

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) => (prev ? { ...prev, name: e.target.value } : prev))
  }

  const onSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) => (prev ? { ...prev, slug: e.target.value } : prev))
  }

  const onCancellationHoursChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) =>
      prev ? { ...prev, cancellation_min_hours: Number(e.target.value) } : prev,
    )
  }

  if (loading) return <PageLoading />

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader title="Ajustes" subtitle="Negocio, vitrina y contraseña" />
        {error ? (
          <div className="mb-3">
            <Alert>{error}</Alert>
          </div>
        ) : null}
        <EmptyState
          title="No se pudo cargar el perfil"
          description={error ?? 'Intenta de nuevo en unos segundos.'}
          actionLabel="Reintentar"
          onAction={() => void loadProfile()}
        />
      </div>
    )
  }

  const isOpen = profile.status !== 'suspended'

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title="Ajustes" subtitle="Negocio, vitrina y contraseña" />
      {error ? (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      <Card className="mb-4 space-y-3" interactive>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Estado de la vitrina</p>
            <p className="mt-1 text-xs text-pretty text-muted">
              Cerrar solo afecta reservas públicas. No bloquea tu acceso al panel.
            </p>
          </div>
          <Badge tone={isOpen ? 'success' : 'warning'}>{isOpen ? 'Abierto' : 'Cerrado'}</Badge>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant={isOpen ? 'danger' : 'primary'}
            className="w-full sm:w-auto"
            disabled={toggling}
            aria-busy={toggling}
            aria-pressed={!isOpen}
            onClick={() => {
              if (isOpen) setConfirmClose(true)
              else void handleToggleOpenClosed()
            }}
          >
            {toggling ? 'Actualizando…' : isOpen ? 'Cerrar negocio' : 'Abrir negocio'}
          </Button>
          <TextLink to={`/${profile.slug}`}>Ver vitrina pública</TextLink>
        </div>
      </Card>

      <Card className="mb-4" interactive>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <FormFieldInput
            id="business-name"
            label="Nombre"
            className="sm:col-span-2"
            value={profile.name}
            onChange={onNameChange}
            autoComplete="organization"
          />
          <FormFieldInput
            id="business-slug"
            label="Slug"
            value={profile.slug}
            onChange={onSlugChange}
            autoComplete="off"
            spellCheck={false}
            hint={`URL pública: /${profile.slug || '…'}`}
          />
          <FormFieldInput
            id="cancellation-hours"
            label="Horas mín. para cancelar"
            type="number"
            min={0}
            value={profile.cancellation_min_hours ?? 0}
            onChange={onCancellationHoursChange}
          />
          <FormFieldInput
            id="business-timezone"
            label="Timezone"
            className="sm:col-span-2"
            value={profile.timezone ?? 'America/Bogota'}
            disabled
            readOnly
            hint="Solo lectura (el API no permite editarlo aquí)."
          />
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar perfil'}
            </Button>
          </div>
        </form>
      </Card>

      <div className="mb-4 rounded-xl border border-dashed border-border bg-card px-4 py-3 text-sm text-muted">
        Horarios del equipo se editan en{' '}
        <Link className="font-semibold text-brand-700 hover:underline" to="/app/availability">
          Disponibilidad
        </Link>
        .
      </div>

      <ChangePasswordCard />

      <ConfirmDialog
        open={confirmClose}
        title="Cerrar la vitrina"
        description="Los clientes no podrán reservar en la URL pública. Tú seguirás pudiendo entrar al panel."
        confirmLabel="Cerrar negocio"
        danger
        loading={toggling}
        onClose={() => setConfirmClose(false)}
        onConfirm={() => void handleToggleOpenClosed()}
      />
    </div>
  )
}
