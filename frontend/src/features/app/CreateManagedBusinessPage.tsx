import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { createManagedBusiness } from '../../shared/api/business'
import { useAuth } from '../../shared/auth/AuthContext'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import {
  Alert,
  Button,
  Card,
  FormFieldInput,
  PageHeader,
  TextLink,
} from '../../shared/ui'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function CreateManagedBusinessPage() {
  const { session, setSessionFromAuth } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await createManagedBusiness({ name: name.trim(), slug })
      setSessionFromAuth({
        scope: res.scope,
        business_id: res.business_id ?? res.business?.id,
        email: session?.email,
        businesses: res.businesses,
      })
      toast.success(`Negocio “${res.business?.name ?? name}” creado`)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Nuevo negocio"
        subtitle="Se agrega a tu misma cuenta. No crea otro usuario ni pide correo de nuevo."
      />
      <p className="mb-4 text-sm text-muted">
        <TextLink to="/app/profile">Volver al perfil</TextLink>
        {' · '}
        <Link className="font-medium text-brand-800 hover:underline" to="/app">
          Dashboard
        </Link>
      </p>

      <Card className="max-w-lg space-y-4">
        {error ? <Alert>{error}</Alert> : null}
        <form className="space-y-3.5" onSubmit={onSubmit}>
          <FormFieldInput
            id="managed-name"
            label="Nombre del negocio"
            required
            value={name}
            onChange={(e) => {
              const v = e.target.value
              setName(v)
              if (!slugTouched) setSlug(slugify(v))
            }}
          />
          <FormFieldInput
            id="managed-slug"
            label="Enlace público (slug)"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(slugify(e.target.value))
            }}
            hint={`Tus clientes reservarán en /${slug || 'tu-negocio'}`}
          />
          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? 'Creando…' : 'Crear y cambiar a este negocio'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
