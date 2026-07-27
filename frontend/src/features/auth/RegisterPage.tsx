import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { login, register } from './api'
import { createManagedBusiness } from '../../shared/api/business'
import { useAuth } from '../../shared/auth/AuthContext'
import { ApiError } from '../../shared/api/ApiError'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import type { AuthTokenResponse } from '../../shared/api/types'
import { AuthLayout, Alert, Button, Card, FormFieldInput } from '../../shared/ui'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function isSlugConflict(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false
  if (err.code === 'SLUG_ALREADY_EXISTS') return true
  if (err.code !== 'CONFLICT') return false
  return (err.rawMessage ?? err.message).toLowerCase().includes('slug')
}

/** Email/document already belong to an account — can try login + managed-businesses. */
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
  const [loading, setLoading] = useState(false)

  function applySession(res: AuthTokenResponse, fallbackEmail: string) {
    setSessionFromAuth({
      access_token: res.access_token,
      scope: res.scope,
      business_id: res.business_id ?? res.business?.id,
      email: res.user?.email ?? fallbackEmail,
      businesses: res.businesses,
    })
  }

  async function createExtraBusinessAsExistingManager() {
    const loginRes = await login({ email, password })
    if (loginRes.scope !== 'business') {
      throw new ApiError(
        'FORBIDDEN',
        'Esta cuenta no es de gerente de negocio.',
        403,
      )
    }
    applySession(loginRes, email)
    const created = await createManagedBusiness({
      name: businessName.trim(),
      slug,
    })
    applySession(created, email)
    toast.success('Negocio agregado a tu cuenta')
    navigate('/app', { replace: true })
  }

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
        business: { name: businessName.trim(), slug },
      })
      applySession(res, email)
      navigate('/app', { replace: true })
    } catch (err) {
      if (isSlugConflict(err)) {
        setError(
          'Ese enlace (slug) ya está en uso. Prueba otro, por ejemplo ' +
            `${slug}-2.`,
        )
        return
      }
      if (isAccountConflict(err)) {
        try {
          await createExtraBusinessAsExistingManager()
          return
        } catch (retryErr) {
          if (
            retryErr instanceof ApiError &&
            (retryErr.code === 'INVALID_CREDENTIALS' || retryErr.status === 401)
          ) {
            setError(
              'Ese correo o documento ya existe. Usa la contraseña correcta de tu cuenta, o inicia sesión y crea el negocio desde el menú.',
            )
          } else {
            setError(getErrorMessage(retryErr))
          }
          return
        }
      }
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
        Cuenta nueva o, si el correo ya existe, agregamos el negocio a tu misma
        cuenta (con la contraseña correcta).
      </p>

      <Card className="home-card-settle space-y-4">
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
            {loading ? 'Creando…' : 'Crear negocio'}
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
