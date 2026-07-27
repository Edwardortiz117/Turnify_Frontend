import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { switchBusiness } from '../auth/api'
import { useAuth } from '../../shared/auth/AuthContext'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import type { SessionBusiness } from '../../shared/api/types'
import { cn } from '../../shared/lib/cn'

type BusinessSwitcherProps = {
  businesses: SessionBusiness[]
  activeBusinessId?: string
  className?: string
}

export function BusinessSwitcher({
  businesses,
  activeBusinessId,
  className,
}: BusinessSwitcherProps) {
  const { session, setSessionFromAuth } = useAuth()
  const navigate = useNavigate()
  const [switching, setSwitching] = useState(false)

  if (businesses.length === 0) return null

  const active =
    businesses.find((b) => b.id === activeBusinessId) ?? businesses[0]

  if (businesses.length === 1) {
    return (
      <p
        className={cn(
          'truncate text-sm font-semibold text-brand-800 sm:text-base',
          className,
        )}
        title={active.name}
      >
        {active.name}
      </p>
    )
  }

  async function onChange(e: ChangeEvent<HTMLSelectElement>) {
    const nextId = e.target.value
    if (!nextId || nextId === activeBusinessId || !session) return
    setSwitching(true)
    try {
      const res = await switchBusiness(nextId)
      setSessionFromAuth({
        access_token: res.access_token,
        scope: res.scope,
        business_id: res.business_id,
        email: session.email,
        businesses: res.businesses ?? businesses,
      })
      toast.success('Negocio activo actualizado')
      navigate('/app', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
      e.target.value = activeBusinessId ?? active.id
    } finally {
      setSwitching(false)
    }
  }

  return (
    <label className={cn('block min-w-0', className)}>
      <span className="sr-only">Negocio activo</span>
      <select
        className="max-w-full truncate rounded-lg border border-brand-200/80 bg-white/80 px-2.5 py-1.5 text-center text-sm font-semibold text-brand-800 shadow-sm backdrop-blur-md transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-60 sm:text-base"
        value={activeBusinessId ?? active.id}
        disabled={switching}
        onChange={(e) => void onChange(e)}
        aria-label="Cambiar negocio activo"
      >
        {businesses.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
            {b.status === 'suspended' ? ' (suspendido)' : ''}
          </option>
        ))}
      </select>
    </label>
  )
}
