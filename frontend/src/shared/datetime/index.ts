/** Format an ISO UTC instant in a business timezone for display. */
export function formatInTimeZone(
  isoUtc: string,
  timeZone = 'America/Bogota',
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  },
): string {
  try {
    return new Intl.DateTimeFormat('es-CO', { ...options, timeZone }).format(new Date(isoUtc))
  } catch {
    return new Date(isoUtc).toLocaleString('es-CO')
  }
}

export function formatTimeInZone(isoUtc: string, timeZone = 'America/Bogota'): string {
  return formatInTimeZone(isoUtc, timeZone, { timeStyle: 'short' })
}

export function toDateInputValue(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function startOfDayIso(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString()
}

export function endOfDayIso(dateStr: string): string {
  return new Date(`${dateStr}T23:59:59.999Z`).toISOString()
}
