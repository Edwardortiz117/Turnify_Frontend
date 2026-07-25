import { useEffect, useState, type SubmitEvent } from 'react'
import { toast } from 'sonner'
import { blockClient, listClients, unblockClient, updateClient } from '../../shared/api/business'
import type { Client } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert, Button, ConfirmDialog, Input, Label, Badge, Card, EmptyState, PageHeader, PageLoading } from '../../shared/ui'

export function ClientsPage() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Client[]>([])
  const [editing, setEditing] = useState<Client | null>(null)
  const [blockTarget, setBlockTarget] = useState<Client | null>(null)
  const [blockLoading, setBlockLoading] = useState(false)
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

  async function onSave(e: SubmitEvent) {
    e.preventDefault()
    if (!editing) return
    try {
      await updateClient(editing.id, {
        name: editing.name,
        phone: editing.phone,
        email: editing.email || null,
      })
      setEditing(null)
      toast.success('Cliente actualizado')
      await refresh(q)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function onConfirmBlock() {
    if (!blockTarget) return
    setBlockLoading(true)
    setError(null)
    try {
      await blockClient(blockTarget.id)
      toast.success(`${blockTarget.name} bloqueado`)
      setBlockTarget(null)
      await refresh(q)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBlockLoading(false)
    }
  }

  async function onUnblock(c: Client) {
    setError(null)
    try {
      await unblockClient(c.id)
      toast.success(`${c.name} desbloqueado`)
      await refresh(q)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader title="Clientes" subtitle="Búsqueda, edición y bloqueo" />
      {error ? (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
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
        <PageLoading />
      ) : items.length === 0 ? (
        <EmptyState title="Sin clientes" description="Aparecerán al recibir o crear citas." />
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
            <Card
              key={c.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{c.name}</p>
                  <Badge tone={c.active ? 'success' : 'danger'}>
                    {c.active ? 'Activo' : 'Bloqueado'}
                  </Badge>
                </div>
                <p className="break-all text-sm text-muted">
                  {c.phone}
                  {c.email ? ` · ${c.email}` : ''}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setEditing(c)}
                >
                  Editar
                </Button>
                {c.active ? (
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setBlockTarget(c)}
                  >
                    Bloquear
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => void onUnblock(c)}
                  >
                    Desbloquear
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing ? (
        <Card className="mt-4" interactive>
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

      <ConfirmDialog
        open={!!blockTarget}
        title={blockTarget ? `Bloquear a ${blockTarget.name}` : 'Bloquear'}
        description="No podrá reservar por la vitrina pública hasta que lo desbloquees."
        confirmLabel="Bloquear"
        danger
        loading={blockLoading}
        onClose={() => setBlockTarget(null)}
        onConfirm={() => void onConfirmBlock()}
      />
    </div>
  )
}
