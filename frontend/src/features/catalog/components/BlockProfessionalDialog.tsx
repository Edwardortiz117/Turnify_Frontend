import type { Professional } from '../../../shared/api/types'
import { ConfirmDialog } from '../../../shared/ui'

type Props = {
  professional: Professional | null
  cancelFuture: boolean
  loading?: boolean
  onCancelFutureChange: (value: boolean) => void
  onConfirm: () => void
  onClose: () => void
}

export function BlockProfessionalDialog({
  professional,
  cancelFuture,
  loading = false,
  onCancelFutureChange,
  onConfirm,
  onClose,
}: Props) {
  return (
    <ConfirmDialog
      open={!!professional}
      title={professional ? `Bloquear a ${professional.name}` : 'Bloquear'}
      description="Quedará inactivo: no aparece en la vitrina ni recibe citas nuevas."
      confirmLabel="Confirmar bloqueo"
      danger
      loading={loading}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      <label className="flex items-start gap-2 text-sm text-ink">
        <input
          type="checkbox"
          className="mt-1"
          checked={cancelFuture}
          onChange={(e) => onCancelFutureChange(e.target.checked)}
        />
        <span>Cancelar también las citas confirmadas futuras</span>
      </label>
    </ConfirmDialog>
  )
}
