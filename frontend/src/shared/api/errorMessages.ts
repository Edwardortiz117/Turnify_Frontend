export const ERROR_MESSAGES_ES: Record<string, string> = {
  VALIDATION_ERROR: 'Revisa los datos del formulario.',
  UNAUTHENTICATED: 'Debes iniciar sesión.',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  FORBIDDEN: 'No tienes permiso para esta acción.',
  BUSINESS_SUSPENDED: 'Este negocio está suspendido.',
  NOT_FOUND: 'No encontramos lo que buscas.',
  SLOT_OCCUPIED: 'Ese horario acaba de ocuparse. Elige otro.',
  PROFESSIONAL_INACTIVE: 'El profesional no está disponible.',
  INVALID_STATE_TRANSITION: 'No se puede cambiar el estado de esta cita.',
  SLUG_ALREADY_EXISTS: 'Ese enlace (slug) ya está en uso.',
  CONFLICT: 'Hay un conflicto con los datos enviados.',
  OUTSIDE_AVAILABILITY: 'El horario está fuera de la disponibilidad.',
  CANCELLATION_TOO_LATE: 'Ya no es posible cancelar esta cita.',
  CLIENT_APPOINTMENT_LIMIT: 'Alcanzaste el límite de citas permitidas.',
  INTERNAL_ERROR: 'Error del servidor. Intenta más tarde.',
}

export function messageForErrorCode(code: string, fallback?: string): string {
  return ERROR_MESSAGES_ES[code] ?? fallback ?? 'Ocurrió un error inesperado.'
}
