import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { resetPassword } from './api'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { AuthLayout, Alert, Button, Card, FormFieldInput } from '../../shared/ui'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState(params.get('token') ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await resetPassword({ token: token.trim(), password })
      toast.success('Contraseña actualizada')
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="home-rise home-rise-delay-2 mb-2 text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
        Nueva contraseña
      </h1>
      <p className="home-rise home-rise-delay-3 mb-6 text-sm text-pretty text-slate-300 sm:text-base">
        Elige una contraseña nueva para tu cuenta.
      </p>

      <Card className="home-card-settle space-y-4">
        {error ? <Alert>{error}</Alert> : null}
        <form className="space-y-3.5" onSubmit={onSubmit}>
          <FormFieldInput
            id="token"
            label="Token de restablecimiento"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
          />
          <FormFieldInput
            id="password"
            label="Nueva contraseña"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            hint="Mínimo 8 caracteres."
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Guardando…' : 'Restablecer'}
          </Button>
        </form>
      </Card>

      <p className="home-rise home-rise-delay-5 mt-5 text-sm text-slate-300">
        <Link className="font-semibold text-brand-300 hover:text-brand-200" to="/login">
          Volver al login
        </Link>
      </p>
    </AuthLayout>
  )
}
