import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from './api'
import { useAuth } from '../../shared/auth/AuthContext'
import { ApiError } from '../../shared/api/ApiError'
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

function isAccountConflict(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false
  if (
    err.code === 'EMAIL_ALREADY_REGISTERED' ||
    err.code === 'DOCUMENT_ALREADY_REGISTERED'
  ) {
    return true
  }
  if (err.code !== 'CONFLICT') return false
  const raw = (err.rawMessage ?? err.message).toLowerCase()
  return raw.includes('email') || raw.includes('document')
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
  const [accountExists, setAccountExists] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    setError(null)
    setAccountExists(false)
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
        businesses: res.businesses,
      })
      navigate('/app', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setAccountExists(isAccountConflict(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="home-rise home-rise-delay-2 mb-2 text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
        Registrar negocio
      </h1>
      <p className="home-rise home-rise-delay-3 mb-6 text-sm text-pretty text-slate-300 sm:text-base">
        Alta de una cuenta nueva. Si el correo o documento ya existen, inicia
        sesión; otro negocio se vincula desde plataforma (o con el selector del
        panel si ya tienes varios).
      </p>

      <Card className="home-card-settle space-y-4">
        {error ? <Alert>{error}</Alert> : null}
        {accountExists ? (
          <Alert tone="info">
            Este registro no agrega un segundo negocio a una cuenta existente.
            Inicia sesión con tu cuenta o pide a plataforma que cree el negocio y
            te vincule. Luego usa el selector de negocio en el panel.
          </Alert>
        ) : null}
        <form className="space-y-3.5" onSubmit={onSubmit}>
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
      </Card>

      <p className="home-rise home-rise-delay-5 mt-5 text-sm text-slate-300">
        ¿Ya tienes cuenta?{' '}
        <Link className="font-semibold text-brand-300 hover:text-brand-200" to="/login">
          Iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
