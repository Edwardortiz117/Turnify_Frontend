import type { ChangeEventHandler, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Input } from '../atoms/Input'
import { Label } from '../atoms/Label'
import { Select } from '../atoms/Select'

type FieldMeta = {
  id: string
  label: string
  error?: string | null
  hint?: string
  className?: string
}

function FieldShell({
  id,
  label,
  error,
  hint,
  className,
  children,
}: FieldMeta & { children: ReactNode }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function FormField(props: FieldMeta & { children: ReactNode }) {
  return <FieldShell {...props} />
}

export type FormFieldInputProps = FieldMeta &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> & {
    onChange?: ChangeEventHandler<HTMLInputElement>
  }

export function FormFieldInput({
  id,
  label,
  error,
  hint,
  className,
  ...props
}: FormFieldInputProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className}>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
    </FieldShell>
  )
}

export type FormFieldSelectProps = FieldMeta &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'className'> & {
    children?: ReactNode
  }

export function FormFieldSelect({
  id,
  label,
  error,
  hint,
  className,
  children,
  ...props
}: FormFieldSelectProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className}>
      <Select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      >
        {children}
      </Select>
    </FieldShell>
  )
}
