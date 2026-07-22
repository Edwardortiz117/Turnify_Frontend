import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { cancelPublicAppointment } from './api'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { PublicLayout } from '../../shared/ui/layouts'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Card, TextLink } from '../../shared/ui/feedback'

export function CancelAppointmentPage() {
  const { appointmentId = '' } = useParams()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await cancelPublicAppointment(appointmentId, phone)
      setDone(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <Card>
        <h1 className="font-display text-2xl text-balance text-ink">Cancelar cita</h1>
        <p className="mt-1 text-sm text-pretty text-muted">
          Confirma con el teléfono usado en la reserva.
        </p>
        {done ? (
          <div className="mt-4 space-y-3 text-center sm:text-left">
            <h2 className="font-display text-2xl text-balance text-brand-800">
              Cita cancelada
            </h2>
            <p className="text-sm text-pretty text-muted">
              Tu cita fue cancelada correctamente.
            </p>
            <TextLink to="/">Volver al inicio</TextLink>
          </div>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            {error ? <Alert>{error}</Alert> : null}
            <div>
              <Label>ID de cita</Label>
              <Input value={appointmentId} readOnly />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button type="submit" variant="danger" className="w-full" disabled={loading}>
              {loading ? 'Cancelando…' : 'Cancelar cita'}
            </Button>
          </form>
        )}
      </Card>
    </PublicLayout>
  )
}
