const STORAGE_KEY = 'turnify.session'

export interface Session {
  access_token: string
  scope: 'business' | 'platform'
  business_id?: string
  email?: string
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
}

export function getAccessToken(): string | null {
  return loadSession()?.access_token ?? null
}
