import { useEffect, useState, type FormEvent } from 'react'
import { listClients, updateClient } from '../catalog/businessApi'
import type { Client, Paginated } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert } from '../../shared/ui/Alert'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Label } from '../../shared/ui/Label'
import { Card, EmptyState, PageHeader, Spinner } from '../../shared/ui/feedback'

function normalizeClients(data: Client[] | Paginated<Client>): Client[] {
  return Array.isArray(data) ? data : data.items ?? []
}

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
      setItems(normalizeClients(data))
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
        email: editing.email,
        active: editing.active,
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
        className="mb-4 flex gap-2"
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
        <Button type="submit">Buscar</Button>
      </form>
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="Sin clientes" description="Aparecerán al recibir o crear citas." />
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
            <Card key={c.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-muted">{c.phone}{c.email ? ` · ${c.email}` : ''}</p>
              </div>
              <Button variant="secondary" onClick={() => setEditing(c)}>
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
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit">Guardar</Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
    </div>
  )
}
