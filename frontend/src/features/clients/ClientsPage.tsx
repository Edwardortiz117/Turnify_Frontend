import { useEffect, useState, type FormEvent } from 'react'
import { listClients, updateClient } from '../catalog/businessApi'
import type { Client } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Card, EmptyState, PageHeader, Spinner } from '../../shared/ui/feedback'

export function ClientsPage() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Client[]>([])
  const [editing, setEditing] = useState<Client | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh(query?: string) {
    setLoading(true)
    setError(null)
    try {
      const data = await listClients(query)
      setItems(data.items ?? [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    try {
      await updateClient(editing.id, {
        name: editing.name,
        phone: editing.phone,
        email: editing.email || null,
      })
      setEditing(null)
      await refresh(q)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader title="Clientes" subtitle="Búsqueda y edición básica" />
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      <form
        className="mb-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault()
          void refresh(q)
        }}
      >
        <Input
          placeholder="Buscar por nombre o teléfono"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button type="submit" className="w-full shrink-0 sm:w-auto">
          Buscar
        </Button>
      </form>
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="Sin clientes" description="Aparecerán al recibir o crear citas." />
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
            <Card key={c.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">{c.name}</p>
                <p className="break-all text-sm text-muted">
                  {c.phone}
                  {c.email ? ` · ${c.email}` : ''}
                </p>
              </div>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => setEditing(c)}
              >
                Editar
              </Button>
            </Card>
          ))}
        </div>
      )}

      {editing ? (
        <Card className="mt-4">
          <h2 className="mb-3 font-semibold">Editar cliente</h2>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSave}>
            <div>
              <Label>Nombre</Label>
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Email</Label>
              <Input
                value={editing.email ?? ''}
                onChange={(e) => setEditing({ ...editing, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
              <Button type="submit" className="w-full sm:w-auto">
                Guardar
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
    </div>
  )
}
