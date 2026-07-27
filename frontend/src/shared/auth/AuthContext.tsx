import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearSession,
  loadSession,
  onSessionCleared,
  saveSession,
  type Session,
} from '../../shared/auth/session'
import type { AuthScope, SessionBusiness } from '../../shared/api/types'

export type AuthSessionInput = {
  access_token: string
  scope: AuthScope
  business_id?: string
  email?: string
  businesses?: SessionBusiness[]
}

interface AuthContextValue {
  session: Session | null
  isAuthenticated: boolean
  setSessionFromAuth: (input: AuthSessionInput) => void
  /** Patch metadata without replacing the token (e.g. refresh businesses from /me). */
  patchSession: (patch: Partial<Pick<Session, 'business_id' | 'email' | 'businesses'>>) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession())

  // Keep React state in sync when api client clears storage on 401
  useEffect(() => onSessionCleared(() => setSession(null)), [])

  const setSessionFromAuth = useCallback((input: AuthSessionInput) => {
    const next: Session = {
      access_token: input.access_token,
      scope: input.scope,
      business_id: input.business_id,
      email: input.email,
      businesses: input.businesses,
    }
    saveSession(next)
    setSession(next)
  }, [])

  const patchSession = useCallback(
    (patch: Partial<Pick<Session, 'business_id' | 'email' | 'businesses'>>) => {
      setSession((prev) => {
        if (!prev) return prev
        const next: Session = { ...prev, ...patch }
        saveSession(next)
        return next
      })
    },
    [],
  )

  const logout = useCallback(() => {
    clearSession()
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.access_token),
      setSessionFromAuth,
      patchSession,
      logout,
    }),
    [session, setSessionFromAuth, patchSession, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
