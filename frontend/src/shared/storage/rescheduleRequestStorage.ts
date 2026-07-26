export type RescheduleRequest = {
  id: string
  slug: string
  appointmentId: string
  phone: string
  clientName?: string
  message: string
  createdAt: string
}

const storageKey = (slug: string) => `turnify.rescheduleRequests.${slug}`

export const readRescheduleRequests = (slug: string): RescheduleRequest[] => {
  try {
    const raw = localStorage.getItem(storageKey(slug))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is RescheduleRequest =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as RescheduleRequest).id === 'string' &&
        typeof (item as RescheduleRequest).appointmentId === 'string' &&
        typeof (item as RescheduleRequest).message === 'string',
    )
  } catch {
    return []
  }
}

const RESCHEDULE_CHANGED_EVENT = 'turnify:reschedule-requests-changed'

function notifyRescheduleRequestsChanged(slug: string) {
  try {
    window.dispatchEvent(
      new CustomEvent(RESCHEDULE_CHANGED_EVENT, { detail: { slug } }),
    )
  } catch {
    /* ignore */
  }
}

export const addRescheduleRequest = (
  input: Omit<RescheduleRequest, 'id' | 'createdAt'>,
): RescheduleRequest => {
  const request: RescheduleRequest = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  const prev = readRescheduleRequests(input.slug)
  localStorage.setItem(storageKey(input.slug), JSON.stringify([request, ...prev].slice(0, 50)))
  notifyRescheduleRequestsChanged(input.slug)
  return request
}

export const findRescheduleRequestByAppointmentId = (
  slug: string,
  appointmentId: string,
): RescheduleRequest | undefined =>
  readRescheduleRequests(slug).find((r) => r.appointmentId === appointmentId)

export const discardRescheduleRequest = (slug: string, requestId: string) => {
  const next = readRescheduleRequests(slug).filter((r) => r.id !== requestId)
  localStorage.setItem(storageKey(slug), JSON.stringify(next))
  notifyRescheduleRequestsChanged(slug)
}

export function onRescheduleRequestsChanged(
  listener: (slug?: string) => void,
): () => void {
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<{ slug?: string }>).detail
    listener(detail?.slug)
  }
  const onStorage = (e: StorageEvent) => {
    if (!e.key?.startsWith('turnify.rescheduleRequests.')) return
    listener(e.key.replace('turnify.rescheduleRequests.', ''))
  }
  window.addEventListener(RESCHEDULE_CHANGED_EVENT, onCustom)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(RESCHEDULE_CHANGED_EVENT, onCustom)
    window.removeEventListener('storage', onStorage)
  }
}
