import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from './api'
import { useAuth } from '../../shared/auth/AuthContext'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { AuthLayout } from '../../shared/ui/layouts'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Card } from '../../shared/ui/feedback'

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

  async function onSubmit(e: FormEvent) {
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
      <Card>
        <h1 className="mb-4 font-display text-2xl text-balance text-ink">Registrar negocio</h1>
        {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="businessName">Nombre del negocio</Label>
            <Input
              id="businessName"
              required
              value={businessName}
              onChange={(e) => {
                const v = e.target.value
                setBusinessName(v)
                if (!slugTouched) setSlug(slugify(v))
              }}
            />
          </div>
          <div>
            <Label htmlFor="slug">Enlace público (slug)</Label>
            <Input
              id="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(slugify(e.target.value))
              }}
            />
            <p className="mt-1 text-xs text-muted">Tus clientes reservarán en /{slug || 'tu-negocio'}</p>
          </div>
          <div>
            <Label htmlFor="document">Documento del gerente</Label>
            <Input
              id="document"
              required
              autoComplete="off"
              placeholder="Cédula o documento"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value.replace(/[\s.\-]/g, ''))}
            />
            <p className="mt-1 text-xs text-muted">
              Identidad del gerente; la plataforma puede usarlo para validar el vínculo.
            </p>
          </div>
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
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
