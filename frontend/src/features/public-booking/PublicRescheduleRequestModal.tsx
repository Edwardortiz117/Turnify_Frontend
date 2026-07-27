import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react'
import { createPublicRescheduleRequest } from '../../shared/api/public'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert, Button, Input, Label, Modal } from '../../shared/ui'

type PublicRescheduleRequestModalProps = {
  open: boolean
  slug: string
  appointmentId: string
  defaultPhone?: string
  clientName?: string
  businessName?: string
  onClose: () => void
}

export const PublicRescheduleRequestModal = ({
  open,
  appointmentId,
  defaultPhone = '',
  onClose,
}: PublicRescheduleRequestModalProps) => {
  const [phone, setPhone] = useState(defaultPhone)
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setPhone(defaultPhone)
    setMessage('')
    setDone(false)
    setLoading(false)
    setError(null)
  }, [open, defaultPhone])

  const handleClose = () => {
    setDone(false)
    setError(null)
    setMessage('')
    setLoading(false)
    onClose()
  }

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    setError(null)
    const trimmed = message.trim()
    if (trimmed.length < 8) {
      setError('Escribe un mensaje breve sobre cuándo te gustaría reprogramar.')
      return
    }
    if (!phone.trim()) {
      setError('Confirma el teléfono de la reserva.')
      return
    }
    setLoading(true)
    try {
      await createPublicRescheduleRequest(appointmentId, {
        phone: phone.trim(),
        message: trimmed,
      })
      setDone(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} title="Solicitar reprogramación" onClose={handleClose}>
      {done ? (
        <div className="space-y-4 text-center sm:text-left">
          <Alert tone="success">
            Tu solicitud fue enviada al negocio. Te contactarán para confirmar el nuevo horario.
          </Alert>
          <p className="text-sm text-pretty text-muted">
            No puedes elegir el horario desde aquí: el equipo lo reprograma por ti.
          </p>
          <Button className="w-full sm:w-auto" onClick={handleClose}>
            Entendido
          </Button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
          <p className="text-sm text-pretty text-muted">
            Cuéntale al negocio cuándo podrías venir. Ellos te confirmarán la nueva cita.
          </p>
          {error ? <Alert>{error}</Alert> : null}
          <div>
            <Label htmlFor="reschedule-phone">Teléfono de la reserva</Label>
            <Input
              id="reschedule-phone"
              required
              value={phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div>
            <Label htmlFor="reschedule-message">Mensaje para el equipo</Label>
            <textarea
              id="reschedule-message"
              required
              rows={4}
              value={message}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              placeholder="Ej: ¿Pueden moverme al viernes por la mañana?"
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar solicitud'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
