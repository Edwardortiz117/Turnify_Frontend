import type { SessionBusiness } from '../api/types'

const STORAGE_KEY = 'turnify.session'

export interface Session {
  scope: 'business' | 'platform'
  business_id?: string
  email?: string
  /** Manager memberships (business scope). Active tenant is `business_id`. */
  businesses?: SessionBusiness[]
}

type SessionClearedListener = () => void

const clearedListeners = new Set<SessionClearedListener>()

/** Subscribe to session cleared (logout / 401). Returns unsubscribe. */
export function onSessionCleared(listener: SessionClearedListener): () => void {
  clearedListeners.add(listener)
  return () => {
    clearedListeners.delete(listener)
  }
}

function notifySessionCleared() {
  clearedListeners.forEach((listener) => listener())
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Session & { access_token?: string }>
    if (parsed.scope !== 'business' && parsed.scope !== 'platform') return null

    // One-time legacy cleanup: purge token if it was persisted in older clients.
    const sanitized: Session = {
      scope: parsed.scope,
      business_id: parsed.business_id,
      email: parsed.email,
      businesses: parsed.businesses,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized))
    return sanitized
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  const stored: Session = {
    scope: session.scope,
    business_id: session.business_id,
    email: session.email,
    businesses: session.businesses,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
  notifySessionCleared()
}

export function getAccessToken(): string | null {
  // JWT is HttpOnly cookie managed by backend; never exposed to JS.
  return null
}
