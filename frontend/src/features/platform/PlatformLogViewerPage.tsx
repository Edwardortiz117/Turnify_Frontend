import { useEffect, useState, type SubmitEvent } from 'react'
import { getPlatformLogs } from './api'
import type { PlatformLogItem } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert, Button, Input, Label, Select, Card, EmptyState, PageHeader, PageLoading } from '../../shared/ui'

const formatLogTime = (time: unknown): string => {
  if (typeof time === 'number') {
    try {
      return new Date(time).toLocaleString()
    } catch {
      return String(time)
    }
  }
  if (typeof time === 'string' && time.length > 0) return time
  return '—'
}

export function PlatformLogViewerPage() {
  const [items, setItems] = useState<PlatformLogItem[]>([])
  const [meta, setMeta] = useState<{ total: number; buffer_size: number; buffer_capacity: number } | null>(
    null,
  )
  const [level, setLevel] = useState('')
  const [q, setQ] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh(next?: { level?: string; q?: string }) {
    setLoading(true)
    setError(null)
    try {
      const res = await getPlatformLogs({
        level: (next?.level ?? level) || undefined,
        q: (next?.q ?? q) || undefined,
        limit: 100,
      })
      setItems(res.items ?? [])
      setMeta({
        total: res.total,
        buffer_size: res.buffer_size,
        buffer_capacity: res.buffer_capacity,
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  function onFilter(e: SubmitEvent) {
    e.preventDefault()
    void refresh()
  }

  return (
    <div>
      <PageHeader
        title="Log viewer"
        subtitle={
          meta
            ? `${meta.total} visibles · buffer ${meta.buffer_size}/${meta.buffer_capacity}`
            : 'Diagnóstico en memoria del proceso'
        }
      />
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      <Card className="mb-4">
        <form className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap" onSubmit={onFilter}>
          <div className="sm:min-w-[140px]">
            <Label htmlFor="log-level">Nivel</Label>
            <Select id="log-level" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">Todos</option>
              <option value="error">error</option>
              <option value="warn">warn</option>
              <option value="info">info</option>
              <option value="debug">debug</option>
            </Select>
          </div>
          <div className="min-w-0 flex-1 sm:min-w-[200px]">
            <Label htmlFor="log-q">Buscar</Label>
            <Input
              id="log-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="SLOT, ACCESS_DISABLED…"
            />
          </div>
          <Button type="submit" className="w-full self-end sm:w-auto">
            Filtrar
          </Button>
        </form>
      </Card>
      {loading ? (
        <PageLoading />
      ) : items.length === 0 ? (
        <EmptyState title="Sin logs" description="No hay entradas en el buffer con ese filtro." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Nivel</th>
                <th className="px-3 py-2 font-semibold">Tiempo</th>
                <th className="px-3 py-2 font-semibold">Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                    {String(row.level_label ?? row.level ?? '—')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums text-xs text-muted">
                    {formatLogTime(row.time)}
                  </td>
                  <td className="max-w-xl px-3 py-2 text-pretty">
                    {String(row.msg ?? row.message ?? JSON.stringify(row))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
