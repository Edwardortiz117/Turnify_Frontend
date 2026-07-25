import { useAuth } from '../../shared/auth/AuthContext'
import { ChangePasswordCard } from '../auth/ChangePasswordCard'
import { Card, PageHeader, Badge } from '../../shared/ui'

export const PlatformAccountPage = () => {
  const { session } = useAuth()

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Ajustes"
        subtitle="Cuenta del administrador de plataforma"
      />
      <Card className="mb-4 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Correo</p>
          <p className="mt-1 font-medium text-ink">{session?.email ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Rol</p>
          <div className="mt-1">
            <Badge tone="brand">Admin plataforma</Badge>
          </div>
        </div>
      </Card>
      <ChangePasswordCard />
    </div>
  )
}
