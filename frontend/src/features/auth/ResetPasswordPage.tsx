import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { resetPassword } from './api'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { AuthLayout, Alert, Button, FormFieldInput } from '../../shared/ui'

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
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-balance text-ink">
        Nueva contraseña
      </h1>
      {error ? (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
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
      <p className="mt-4 text-sm text-muted lg:text-left">
        <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/login">
          Volver al login
        </Link>
      </p>
    </AuthLayout>
  )
}
