import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from './api'
import { useAuth } from '../../shared/auth/AuthContext'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { AuthLayout } from '../../shared/ui/layouts'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Card } from '../../shared/ui/feedback'

export function LoginPage() {
  const { setSessionFromAuth } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
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
      navigate(res.scope === 'platform' ? '/platform' : '/app', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card>
        <h1 className="mb-4 text-lg font-semibold">Iniciar sesión</h1>
        {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          ¿Nuevo negocio?{' '}
          <Link className="font-semibold text-brand-700" to="/register">
            Crear cuenta
          </Link>
        </p>
      </Card>
    </AuthLayout>
  )
}
