import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from './api'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { AuthLayout } from '../../shared/ui/layouts'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Card } from '../../shared/ui/feedback'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState(params.get('token') ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      await resetPassword({ token: token.trim(), password })
      setMessage('Contraseña actualizada. Ya puedes iniciar sesión.')
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card>
        <h1 className="mb-4 font-display text-2xl text-balance text-ink">
          Nueva contraseña
        </h1>
        {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
        {message ? <div className="mb-3"><Alert tone="success">{message}</Alert></div> : null}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="token">Token de restablecimiento</Label>
            <Input
              id="token"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Guardando…' : 'Restablecer'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/login">
            Volver al login
          </Link>
        </p>
      </Card>
    </AuthLayout>
  )
}
