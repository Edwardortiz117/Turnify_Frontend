import { useState, type FormEvent } from 'react'
import { changePassword } from './api'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Card } from '../../shared/ui/feedback'

export function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
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
      setSuccess('Contraseña actualizada.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h2 className="mb-3 font-semibold">Cambiar contraseña</h2>
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      {success ? <div className="mb-3"><Alert tone="success">{success}</Alert></div> : null}
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="current-password">Contraseña actual</Label>
          <Input
            id="current-password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div>
          <Label htmlFor="new-password">Nueva contraseña</Label>
          <Input
            id="new-password"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? 'Guardando…' : 'Actualizar contraseña'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
