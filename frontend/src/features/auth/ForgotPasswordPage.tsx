import { useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from './api'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { AuthLayout, Alert, Button, Card, FormFieldInput, TextLink } from '../../shared/ui'

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
      <h1 className="home-rise home-rise-delay-2 mb-2 text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
        Recuperar contraseña
      </h1>
      <p className="home-rise home-rise-delay-3 mb-6 text-sm text-pretty text-slate-300 sm:text-base">
        Te enviamos un enlace para restablecer el acceso.
      </p>

      <Card className="home-card-settle space-y-4 border-white/80 bg-white/75 shadow-xl shadow-slate-900/12 backdrop-blur-md">
        {error ? <Alert>{error}</Alert> : null}
        {message ? <Alert tone="success">{message}</Alert> : null}
        {resetToken ? (
          <div className="rounded-lg border border-border bg-brand-50 p-3 text-sm">
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
      </Card>

      <p className="home-rise home-rise-delay-5 mt-5 text-sm text-slate-300">
        <Link className="font-semibold text-brand-300 hover:text-brand-200" to="/login">
          Volver al login
        </Link>
      </p>
    </AuthLayout>
  )
}
