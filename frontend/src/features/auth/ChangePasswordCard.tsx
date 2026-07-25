import { useState, type SubmitEvent } from 'react'
import { toast } from 'sonner'
import { changePassword } from './api'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert, Button, Card, FormFieldInput } from '../../shared/ui'

export function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      toast.success('Contraseña actualizada')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card interactive>
      <h2 className="mb-3 font-semibold">Cambiar contraseña</h2>
      {error ? (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
        <FormFieldInput
          id="current-password"
          label="Contraseña actual"
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
        <FormFieldInput
          id="new-password"
          label="Nueva contraseña"
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          hint="Mínimo 8 caracteres."
        />
        <div className="sm:col-span-2">
          <Button type="submit" className="w-full sm:w-auto" disabled={loading} aria-busy={loading}>
            {loading ? 'Guardando…' : 'Actualizar contraseña'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
