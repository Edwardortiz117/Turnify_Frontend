const DEFAULT_TZ = 'America/Bogota'

/** Format an ISO UTC instant in a business timezone for display. */
export function formatInTimeZone(
  isoUtc: string,
  timeZone = DEFAULT_TZ,
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

export function formatTimeInZone(isoUtc: string, timeZone = DEFAULT_TZ): string {
  return formatInTimeZone(isoUtc, timeZone, { timeStyle: 'short' })
}

/** Today's calendar date in the given timezone as YYYY-MM-DD. */
export function toDateInputValue(date = new Date(), timeZone = DEFAULT_TZ): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date)
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
    return `${get('year')}-${get('month')}-${get('day')}`
  } catch {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
}

/**
 * Convert a wall-clock date+time in `timeZone` to a UTC ISO string.
 * `dateStr` = YYYY-MM-DD, `time` = HH:mm or HH:mm:ss or HH:mm:ss.sss
 */
export function wallTimeToUtcIso(
  dateStr: string,
  time: string,
  timeZone = DEFAULT_TZ,
): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const timeParts = time.split(':')
  const hh = Number(timeParts[0] ?? 0)
  const mm = Number(timeParts[1] ?? 0)
  const secRaw = timeParts[2] ?? '0'
  const secFloat = Number(secRaw)
  const seconds = Math.floor(secFloat)
  const ms = Math.round((secFloat - seconds) * 1000)

  const desiredAsUtc = Date.UTC(y, mo - 1, d, hh, mm, seconds, ms)
  let utcMs = desiredAsUtc

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })

  // Iteratively correct UTC so that formatting in `timeZone` matches wall clock
  for (let i = 0; i < 3; i++) {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date(utcMs))
        .filter((p) => p.type !== 'literal')
        .map((p) => [p.type, p.value]),
    ) as Record<string, string>

    const asIfUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
      ms,
    )
    utcMs += desiredAsUtc - asIfUtc
  }

  return new Date(utcMs).toISOString()
}

/** Start of calendar day (00:00:00.000) in business timezone → UTC ISO. */
export function startOfDayIso(dateStr: string, timeZone = DEFAULT_TZ): string {
  return wallTimeToUtcIso(dateStr, '00:00:00.000', timeZone)
}

/** End of calendar day (23:59:59.999) in business timezone → UTC ISO. */
export function endOfDayIso(dateStr: string, timeZone = DEFAULT_TZ): string {
  return wallTimeToUtcIso(dateStr, '23:59:59.999', timeZone)
}

/**
 * Convert `<input type="datetime-local">` value (`YYYY-MM-DDTHH:mm` or with seconds)
 * from business wall clock to UTC ISO.
 */
export function datetimeLocalToUtcIso(value: string, timeZone = DEFAULT_TZ): string {
  const [dateStr, timePart] = value.split('T')
  if (!dateStr || !timePart) {
    throw new Error('Fecha/hora inválida')
  }
  const time = timePart.length === 5 ? `${timePart}:00` : timePart
  return wallTimeToUtcIso(dateStr, time, timeZone)
}
