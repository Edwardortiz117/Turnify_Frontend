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
      <h1 className="home-rise home-rise-delay-2 mb-2 text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
        Registrar negocio
      </h1>
      <p className="home-rise home-rise-delay-3 mb-6 text-sm text-pretty text-slate-300 sm:text-base">
        Crea tu cuenta y publica el enlace de reservas.
      </p>

      <Card className="home-card-settle space-y-4 border-white/80 bg-white/75 shadow-xl shadow-slate-900/12 backdrop-blur-md">
        {error ? <Alert>{error}</Alert> : null}
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
