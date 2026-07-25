import { useEffect, useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { createBusiness, listBusinesses } from './api'
import type { Business } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert, Button, Input, Label, Badge, Card, EmptyState, PageHeader, PageLoading } from '../../shared/ui'

export function PlatformBusinessesPage() {
  const [items, setItems] = useState<Business[]>([])
  const [total, setTotal] = useState(0)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [managerDocument, setManagerDocument] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const res = await listBusinesses()
      setItems(res.items ?? [])
      setTotal(res.total ?? 0)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function onCreate(e: SubmitEvent) {
    e.preventDefault()
    setError(null)
    try {
      const doc = managerDocument.trim()
      await createBusiness({
        name,
        slug,
        timezone: 'America/Bogota',
        ...(doc ? { manager_document: doc } : {}),
      })
      setName('')
      setSlug('')
      setManagerDocument('')
      toast.success('Negocio creado')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader title="Negocios" subtitle={`${total} tenants`} />
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      <Card className="mb-4">
        <p className="mb-3 text-sm text-pretty text-muted">
          Camino principal: el gerente se autoregistra. Crear tenant aquí es ops.
        </p>
        <form className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap" onSubmit={onCreate}>
          <div className="min-w-0 flex-1 sm:min-w-[160px]">
            <Label htmlFor="platform-business-name">Nombre</Label>
            <Input
              id="platform-business-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="min-w-0 flex-1 sm:min-w-[140px]">
            <Label htmlFor="platform-business-slug">Slug</Label>
            <Input
              id="platform-business-slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <div className="min-w-0 flex-1 sm:min-w-[160px]">
            <Label htmlFor="platform-manager-document">Documento gerente (opcional)</Label>
            <Input
              id="platform-manager-document"
              autoComplete="off"
              placeholder="Cédula esperada"
              value={managerDocument}
              onChange={(e) => setManagerDocument(e.target.value.replace(/[\s.\-]/g, ''))}
            />
          </div>
          <Button type="submit" className="w-full self-end sm:w-auto">
            Crear
          </Button>
        </form>
      </Card>
      {loading ? (
        <PageLoading />
      ) : items.length === 0 ? (
        <EmptyState
          title="Sin negocios"
          description="Crea el primero para administrar tenants."
          actionLabel="Crear negocio"
          onAction={() => {
            document.getElementById('platform-business-name')?.focus()
          }}
        />
      ) : (
        <div className="space-y-2">
          {items.map((b) => (
            <Card key={b.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">{b.name}</p>
                <p className="text-sm text-muted">/{b.slug}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Badge tone={b.status === 'suspended' ? 'danger' : 'success'}>
                  {b.status ?? 'active'}
                </Badge>
                <Link to={`/platform/businesses/${b.id}`} className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full">
                    Detalle
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
