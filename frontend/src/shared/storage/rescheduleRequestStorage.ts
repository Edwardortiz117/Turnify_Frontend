/**
 * Shape used by notification builders / tests.
 * Persistence is server-side only (`/business/reschedule-requests`).
 * Do not write these to localStorage — that was a temporary MVP fake.
 */
export type RescheduleRequest = {
  id: string
  slug: string
  appointmentId: string
  phone: string
  clientName?: string
  message: string
  createdAt: string
}

const LEGACY_PREFIX = 'turnify.rescheduleRequests.'

/** One-shot cleanup so old browser fakes cannot look like real API data. */
export function purgeLegacyRescheduleRequestStorage(): void {
  try {
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(LEGACY_PREFIX)) toRemove.push(key)
    }
    for (const key of toRemove) localStorage.removeItem(key)
  } catch {
    /* private mode / blocked storage */
  }
}
