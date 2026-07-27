import type { SessionBusiness } from '../api/types'

const STORAGE_KEY = 'turnify.session'

export interface Session {
  access_token: string
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
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
  notifySessionCleared()
}

export function getAccessToken(): string | null {
  return loadSession()?.access_token ?? null
}
