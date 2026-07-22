import { useEffect, useState, type FormEvent } from 'react'
import { getProfile, updateProfile } from '../catalog/businessApi'
import type { Business } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Card, EmptyState, PageHeader, PageLoading } from '../../shared/ui/feedback'

export function ProfilePage() {
  const [profile, setProfile] = useState<Business | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return <PageLoading />
  }

  if (!profile) {
    return (
      <div>
        <PageHeader title="Perfil del negocio" subtitle="Nombre, slug y políticas" />
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

  return (
    <div>
      <PageHeader title="Perfil del negocio" subtitle="Nombre, slug y políticas" />
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      {success ? <div className="mb-3"><Alert tone="success">{success}</Alert></div> : null}
      <Card>
        <form className="max-w-lg space-y-4" onSubmit={onSubmit}>
          <div>
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
            <Label>Timezone</Label>
            <Input value={profile.timezone ?? 'America/Bogota'} disabled readOnly />
            <p className="mt-1 text-xs text-muted">Solo lectura (el API no permite editarlo aquí).</p>
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
          <Button type="submit" className="w-full sm:w-auto">
            Guardar
          </Button>
        </form>
      </Card>
    </div>
  )
}
