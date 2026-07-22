import { useEffect, useState } from 'react'
import { getPlatformHealth } from './api'
import type { PlatformHealth } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert } from '../../shared/ui/Alert'
import { Badge, Card, PageHeader, PageLoading } from '../../shared/ui/feedback'
import { Button } from '../../shared/ui/Button'

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}h ${m}m ${s}s`
}

export function PlatformHealthPage() {
  const [data, setData] = useState<PlatformHealth | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setData(await getPlatformHealth())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  if (loading) return <PageLoading />

  return (
    <div>
      <PageHeader
        title="Salud del sistema"
        subtitle="Estado del proceso backend"
        actions={
          <Button variant="secondary" className="w-full sm:w-auto" onClick={() => void load()}>
            Actualizar
          </Button>
        }
      />
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      {data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Status</p>
            <div className="mt-2">
              <Badge tone={data.status === 'ok' ? 'success' : 'warning'}>{data.status}</Badge>
            </div>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Database</p>
            <div className="mt-2">
              <Badge tone={data.database === 'ok' ? 'success' : 'danger'}>{data.database}</Badge>
            </div>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Uptime</p>
            <p className="mt-2 text-xl font-semibold tabular-nums">
              {formatUptime(data.uptime_seconds)}
            </p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Servicio</p>
            <p className="mt-2 font-medium">{data.service}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Log buffer</p>
            <p className="mt-2 text-xl font-semibold tabular-nums">{data.log_buffer_size}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Timestamp</p>
            <p className="mt-2 text-sm tabular-nums text-muted">{data.timestamp}</p>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
