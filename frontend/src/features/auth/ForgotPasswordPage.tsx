import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from './api'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { AuthLayout } from '../../shared/ui/layouts'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Card, TextLink } from '../../shared/ui/feedback'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setResetToken(null)
    setLoading(true)
    try {
      const res = await forgotPassword({ email })
      setMessage(
        'Si el correo existe, enviamos instrucciones para restablecer la contraseña.',
      )
      if (res.reset_token) {
        setResetToken(res.reset_token)
      }
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
          Recuperar contraseña
        </h1>
        {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
        {message ? <div className="mb-3"><Alert tone="success">{message}</Alert></div> : null}
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar enlace'}
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
