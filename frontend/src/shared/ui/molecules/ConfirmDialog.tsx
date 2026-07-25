import type { ReactNode } from 'react'
import { Button } from '../atoms/Button'
import { Modal } from './Modal'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  children?: ReactNode
  onConfirm: () => void
  onClose: () => void
}

/** Destructive / high-stakes confirmation before mutating. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  loading = false,
  children,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm text-pretty text-muted">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Procesando…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
