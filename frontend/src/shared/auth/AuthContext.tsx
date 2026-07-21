import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearSession,
  loadSession,
  saveSession,
  type Session,
} from '../../shared/auth/session'
import type { AuthScope } from '../../shared/api/types'

interface AuthContextValue {
  session: Session | null
  isAuthenticated: boolean
  setSessionFromAuth: (input: {
    access_token: string
    scope: AuthScope
    business_id?: string
    email?: string
  }) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession())

  const setSessionFromAuth = useCallback(
    (input: {
      access_token: string
      scope: AuthScope
      business_id?: string
      email?: string
    }) => {
      const next: Session = {
        access_token: input.access_token,
        scope: input.scope,
        business_id: input.business_id,
        email: input.email,
      }
      saveSession(next)
      setSession(next)
    },
    [],
  )

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.access_token),
      setSessionFromAuth,
      logout,
    }),
    [session, setSessionFromAuth, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
