import { useAuth } from '../../shared/auth/AuthContext'
import { Card, PageHeader, Badge } from '../../shared/ui/feedback'

export function PlatformAccountPage() {
  const { session } = useAuth()

  return (
    <div>
      <PageHeader
        title="Cuenta"
        subtitle="Perfil del administrador de plataforma"
      />
      <Card className="max-w-lg space-y-3">
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
        <p className="text-sm text-pretty text-muted">
          Desde aquí gestionas tenants, estados y asignación de gerentes. Usa el menú de
          usuario para cerrar sesión.
        </p>
      </Card>
    </div>
  )
}
