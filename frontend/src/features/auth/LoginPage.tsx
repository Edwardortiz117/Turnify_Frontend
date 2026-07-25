import { useState, type SubmitEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from './api'
import { useAuth } from '../../shared/auth/AuthContext'
import { ApiError } from '../../shared/api/ApiError'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { AuthLayout, Alert, Button, FormFieldInput, Card, TextLink } from '../../shared/ui'

export function LoginPage() {
  const { setSessionFromAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await login({ email, password })
      setSessionFromAuth({
        access_token: res.access_token,
        scope: res.scope,
        business_id: res.business_id,
        email,
      })
      const defaultTarget = res.scope === 'platform' ? '/platform' : '/app'
      const safeFrom =
        from &&
        ((res.scope === 'platform' && from.startsWith('/platform')) ||
          (res.scope === 'business' && from.startsWith('/app')))
          ? from
          : defaultTarget
      navigate(safeFrom, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ACCESS_DISABLED') {
        setError('Tu negocio fue dado de baja. Contacta soporte de la plataforma.')
      } else {
        setError(getErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card interactive>
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-balance text-ink">
          Iniciar sesión
        </h1>
        {error ? (
          <div className="mb-3">
            <Alert>{error}</Alert>
          </div>
        ) : null}
        <form className="space-y-4" onSubmit={onSubmit}>
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
        <p className="mt-3 text-center text-sm">
          <TextLink to="/forgot-password">¿Olvidaste tu contraseña?</TextLink>
        </p>
        <p className="mt-4 text-center text-sm text-muted">
          ¿Nuevo negocio?{' '}
          <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/register">
            Crear cuenta
          </Link>
        </p>
      </Card>
    </AuthLayout>
  )
}
