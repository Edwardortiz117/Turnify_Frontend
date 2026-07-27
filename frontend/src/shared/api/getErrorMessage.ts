import { ApiError } from '../api/ApiError'
import {
  looksLikeInfrastructureMessage,
  messageForErrorCode,
} from './errorMessages'

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === 'VALIDATION_ERROR' && err.details) {
      const detailText = formatValidationDetails(err.details)
      if (detailText) return detailText
    }
    if (err.code === 'CONFLICT' && err.details) {
      const field = err.details.field
      if (field === 'email') return messageForErrorCode('EMAIL_ALREADY_REGISTERED')
      if (field === 'document') return messageForErrorCode('DOCUMENT_ALREADY_REGISTERED')
      if (field === 'slug') return messageForErrorCode('SLUG_ALREADY_EXISTS')
    }
    // Prefer original API text for CONFLICT field detection.
    return messageForErrorCode(err.code, err.rawMessage ?? err.message)
  }
  if (err instanceof Error) {
    if (isBrowserNetworkFailure(err) || looksLikeInfrastructureMessage(err.message)) {
      return messageForErrorCode('NETWORK_ERROR')
    }
    return err.message.trim() || 'Ocurrió un error inesperado.'
  }
  return 'Ocurrió un error inesperado.'
}

function isBrowserNetworkFailure(err: Error): boolean {
  return /failed to fetch|load failed|networkerror|network request failed/i.test(err.message)
}

function formatValidationDetails(details: Record<string, unknown>): string | null {
  const fieldErrors = details.fieldErrors
  if (fieldErrors && typeof fieldErrors === 'object' && !Array.isArray(fieldErrors)) {
    const parts = Object.entries(fieldErrors as Record<string, unknown>)
      .flatMap(([field, msgs]) => {
        const list = Array.isArray(msgs) ? msgs : [msgs]
        return list
          .filter((m): m is string => typeof m === 'string' && m.length > 0)
          .map((m) => labelField(field, m))
      })
    if (parts.length) return parts.join(' ')
  }

  const formErrors = details.formErrors
  if (Array.isArray(formErrors) && formErrors.length) {
    return formErrors.filter((m): m is string => typeof m === 'string').join(' ')
  }

  const flatParts = Object.entries(details)
    .filter(([key]) => key !== 'fieldErrors' && key !== 'formErrors')
    .flatMap(([field, msgs]) => {
      const list = Array.isArray(msgs) ? msgs : [msgs]
      return list
        .filter((m): m is string => typeof m === 'string' && m.length > 0)
        .map((m) => labelField(field, m))
    })
  if (flatParts.length) return flatParts.join(' ')

  return null
}

function labelField(field: string, message: string): string {
  if (field === 'user_id') {
    return 'ID de usuario: debe ser un UUID válido.'
  }
  if (field === 'document') {
    return 'Documento: debe tener entre 5 y 32 caracteres alfanuméricos.'
  }
  return `${field}: ${message}`
}
