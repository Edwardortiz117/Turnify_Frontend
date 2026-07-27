import { useState, type SubmitEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from './api'
import { useAuth } from '../../shared/auth/AuthContext'
import { ApiError } from '../../shared/api/ApiError'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { AuthLayout, Alert, Button, Card, FormFieldInput, TextLink } from '../../shared/ui'

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
        businesses: res.businesses,
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
      <h1 className="home-rise home-rise-delay-2 mb-2 text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
        Iniciar sesión
      </h1>
      <p className="home-rise home-rise-delay-3 mb-6 text-sm text-pretty text-slate-300 sm:text-base">
        Accede al panel de tu negocio o de la plataforma.
      </p>

      <Card className="home-card-settle space-y-4">
        {error ? <Alert>{error}</Alert> : null}
        <form className="space-y-3.5" onSubmit={onSubmit}>
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
          <Button
            type="submit"
            className="w-full shadow-md shadow-brand-700/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:hover:translate-y-0"
            disabled={loading}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
        <p className="text-sm">
          <TextLink to="/forgot-password">¿Olvidaste tu contraseña?</TextLink>
        </p>
      </Card>

      <p className="home-rise home-rise-delay-5 mt-5 text-sm text-slate-300">
        ¿Nuevo negocio?{' '}
        <Link className="font-semibold text-brand-300 hover:text-brand-200" to="/register">
          Crear cuenta
        </Link>
      </p>
    </AuthLayout>
  )
}
