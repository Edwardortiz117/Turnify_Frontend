import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from './api'
import { useAuth } from '../../shared/auth/AuthContext'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { AuthLayout, Alert, Button, Card, FormFieldInput } from '../../shared/ui'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function RegisterPage() {
  const { setSessionFromAuth } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    setError(null)
    const doc = documentId.trim()
    if (!doc || doc.length < 5) {
      setError('Ingresa un documento válido (mínimo 5 caracteres).')
      return
    }
    setLoading(true)
    try {
      const res = await register({
        email,
        password,
        document: doc,
        business: { name: businessName, slug },
      })
      setSessionFromAuth({
        access_token: res.access_token,
        scope: res.scope,
        business_id: res.business_id ?? res.business?.id,
        email: res.user?.email ?? email,
      })
      navigate('/app', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card interactive>
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-balance text-ink">
          Registrar negocio
        </h1>
        {error ? (
          <div className="mb-3">
            <Alert>{error}</Alert>
          </div>
        ) : null}
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormFieldInput
            id="businessName"
            label="Nombre del negocio"
            required
            value={businessName}
            onChange={(e) => {
              const v = e.target.value
              setBusinessName(v)
              if (!slugTouched) setSlug(slugify(v))
            }}
          />
          <FormFieldInput
            id="slug"
            label="Enlace público (slug)"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(slugify(e.target.value))
            }}
            hint={`Tus clientes reservarán en /${slug || 'tu-negocio'}`}
          />
          <FormFieldInput
            id="document"
            label="Documento del gerente"
            required
            autoComplete="off"
            placeholder="Cédula o documento"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value.replace(/[\s.\-]/g, ''))}
            hint="Identidad del gerente; la plataforma puede usarlo para validar el vínculo."
          />
          <FormFieldInput
            id="email"
            label="Correo"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <FormFieldInput
            id="password"
            label="Contraseña"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creando…' : 'Crear cuenta'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          ¿Ya tienes cuenta?{' '}
          <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/login">
            Iniciar sesión
          </Link>
        </p>
      </Card>
    </AuthLayout>
  )
}
