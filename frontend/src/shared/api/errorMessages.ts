export const ERROR_MESSAGES_ES: Record<string, string> = {
  VALIDATION_ERROR: 'Revisa los datos del formulario.',
  UNAUTHENTICATED: 'Debes iniciar sesión.',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  FORBIDDEN: 'No tienes permiso para esta acción.',
  ACCESS_DISABLED:
    'Tu negocio fue dado de baja. Contacta soporte de la plataforma.',
  BUSINESS_SUSPENDED: 'Este negocio está suspendido.',
  CLIENT_BLOCKED: 'Este cliente no puede reservar (bloqueado).',
  NOT_FOUND: 'No encontramos lo que buscas.',
  SLOT_OCCUPIED: 'Ese horario acabó de ocuparse. Elige otro.',
  PROFESSIONAL_INACTIVE: 'El profesional no está disponible.',
  INVALID_STATE_TRANSITION: 'No se puede cambiar el estado de esta cita.',
  EMAIL_ALREADY_REGISTERED: 'Ese correo ya está registrado.',
  DOCUMENT_ALREADY_REGISTERED: 'Ese documento ya está registrado.',
  DOCUMENT_MISMATCH: 'El documento no coincide con la cuenta de este correo.',
  SLUG_ALREADY_EXISTS: 'Ese enlace (slug) ya está en uso.',
  CONFLICT: 'Hay un conflicto con los datos enviados.',
  OUTSIDE_AVAILABILITY: 'El horario está fuera de la disponibilidad.',
  CANCELLATION_TOO_LATE: 'Ya no es posible cancelar esta cita.',
  CLIENT_APPOINTMENT_LIMIT: 'Alcanzaste el límite de citas permitidas.',
  INTERNAL_ERROR: 'Error del servidor. Intenta más tarde.',
  PROXY_ERROR: 'No pudimos conectar con el servicio. Intenta de nuevo en unos momentos.',
  NETWORK_ERROR: 'No hay conexión con el servicio. Revisa tu red e intenta de nuevo.',
}

/** Mensajes o códigos que no deben mostrarse al usuario (infra / proxy / URLs). */
export function looksLikeInfrastructureMessage(message: string): boolean {
  return /https?:\/\/|host\.docker\.internal|localhost:\d+|127\.0\.0\.1|0\.0\.0\.0|Cannot reach|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EAI_AGAIN|Failed to fetch|NetworkError|proxy error|ERR_CONNECTION|getaddrinfo/i.test(
    message,
  )
}

export function isInfrastructureErrorCode(code: string): boolean {
  return code === 'PROXY_ERROR' || code === 'NETWORK_ERROR' || code === 'INTERNAL_ERROR'
}

export function messageForErrorCode(code: string, fallback?: string): string {
  if (code === 'CONFLICT' && fallback) {
    const m = fallback.toLowerCase()
    if (m.includes('email')) return ERROR_MESSAGES_ES.EMAIL_ALREADY_REGISTERED
    if (m.includes('document')) return ERROR_MESSAGES_ES.DOCUMENT_ALREADY_REGISTERED
    if (m.includes('slug')) return ERROR_MESSAGES_ES.SLUG_ALREADY_EXISTS
  }
  const mapped = ERROR_MESSAGES_ES[code]
  if (mapped) return mapped
  if (fallback && looksLikeInfrastructureMessage(fallback)) {
    return ERROR_MESSAGES_ES.NETWORK_ERROR
  }
  if (fallback?.trim()) return fallback.trim()
  return 'Ocurrió un error inesperado.'
}
