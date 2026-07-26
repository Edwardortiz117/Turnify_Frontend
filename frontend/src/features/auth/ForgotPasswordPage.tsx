import { useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from './api'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { AuthLayout, Alert, Button, FormFieldInput, TextLink } from '../../shared/ui'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setResetToken(null)
    setLoading(true)
    try {
      const res = await forgotPassword({ email })
      setMessage('Si el correo existe, enviamos instrucciones para restablecer la contraseña.')
      if (res.reset_token) setResetToken(res.reset_token)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-balance text-ink">
        Recuperar contraseña
      </h1>
      {error ? (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      {message ? (
        <div className="mb-3">
          <Alert tone="success">{message}</Alert>
        </div>
      ) : null}
      {resetToken ? (
        <div className="mb-3 rounded-lg border border-border bg-brand-50 p-3 text-sm">
          <p className="font-semibold text-brand-800">Token de desarrollo</p>
          <p className="mt-1 break-all font-mono text-xs text-ink">{resetToken}</p>
          <p className="mt-2">
            <TextLink to={`/reset-password?token=${encodeURIComponent(resetToken)}`}>
              Continuar a restablecer
            </TextLink>
          </p>
        </div>
      ) : null}
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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar enlace'}
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
