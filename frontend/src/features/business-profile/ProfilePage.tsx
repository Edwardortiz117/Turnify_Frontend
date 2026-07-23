import { useEffect, useState, type FormEvent } from 'react'
import { getProfile, updateProfile } from '../catalog/businessApi'
import type { Business } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { ChangePasswordCard } from '../auth/ChangePasswordCard'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Badge, Card, EmptyState, PageHeader, PageLoading } from '../../shared/ui/feedback'

export function ProfilePage() {
  const [profile, setProfile] = useState<Business | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  async function load() {
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
    void load()
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!profile) return
    setError(null)
    setSuccess(null)
    try {
      const updated = await updateProfile({
        name: profile.name,
        slug: profile.slug,
        cancellation_min_hours: profile.cancellation_min_hours,
      })
      setProfile(updated)
      setSuccess('Perfil actualizado.')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function toggleOpenClosed() {
    if (!profile) return
    const next = profile.status === 'suspended' ? 'active' : 'suspended'
    setError(null)
    setSuccess(null)
    setToggling(true)
    try {
      const updated = await updateProfile({ status: next })
      setProfile({ ...profile, ...updated })
      setSuccess(
        next === 'suspended'
          ? 'Negocio cerrado: la vitrina pública no acepta reservas. Sigues en el panel.'
          : 'Negocio abierto: la vitrina pública vuelve a aceptar reservas.',
      )
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return <PageLoading />
  }

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <PageHeader title="Ajustes" subtitle="Negocio, disponibilidad y contraseña" />
        {error ? (
          <div className="mb-3">
            <Alert>{error}</Alert>
          </div>
        ) : null}
        <EmptyState
          title="No se pudo cargar el perfil"
          description={error ?? 'Intenta de nuevo en unos segundos.'}
          actionLabel="Reintentar"
          onAction={() => void load()}
        />
      </div>
    )
  }

  const isOpen = profile.status !== 'suspended'

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title="Ajustes" subtitle="Negocio, disponibilidad y contraseña" />
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      {success ? <div className="mb-3"><Alert tone="success">{success}</Alert></div> : null}

      <Card className="mb-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Estado de la vitrina</p>
            <p className="mt-1 text-xs text-pretty text-muted">
              Cerrar solo afecta reservas públicas. No bloquea tu acceso al panel.
            </p>
          </div>
          <Badge tone={isOpen ? 'success' : 'warning'}>
            {isOpen ? 'Abierto' : 'Cerrado'}
          </Badge>
        </div>
        <Button
          variant={isOpen ? 'danger' : 'primary'}
          className="w-full sm:w-auto"
          disabled={toggling}
          onClick={() => void toggleOpenClosed()}
        >
          {toggling ? 'Actualizando…' : isOpen ? 'Cerrar negocio' : 'Abrir negocio'}
        </Button>
      </Card>

      <Card className="mb-4">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="sm:col-span-2">
            <Label>Nombre</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={profile.slug}
              onChange={(e) => setProfile({ ...profile, slug: e.target.value })}
            />
          </div>
          <div>
            <Label>Horas mín. para cancelar</Label>
            <Input
              type="number"
              min={0}
              value={profile.cancellation_min_hours ?? 0}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  cancellation_min_hours: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Timezone</Label>
            <Input value={profile.timezone ?? 'America/Bogota'} disabled readOnly />
            <p className="mt-1 text-xs text-muted">Solo lectura (el API no permite editarlo aquí).</p>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-auto">
              Guardar perfil
            </Button>
          </div>
        </form>
      </Card>

      <ChangePasswordCard />
    </div>
  )
}
