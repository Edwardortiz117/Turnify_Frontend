import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../shared/auth/AuthContext'
import type { AuthScope } from '../shared/api/types'

export function RequireAuth({ scope }: { scope?: AuthScope }) {
  const { session, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (scope && session.scope !== scope) {
    const target = session.scope === 'platform' ? '/platform' : '/app'
    return <Navigate to={target} replace />
  }

  return <Outlet />
}
