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
  return request
}
