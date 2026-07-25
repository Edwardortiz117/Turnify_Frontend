import { useEffect, useState, type SubmitEvent } from 'react'
import { toast } from 'sonner'
import {
  blockProfessional,
  createProfessional,
  getProfessionalServices,
  getWeeklySchedule,
  listExceptions,
  listProfessionals,
  listServices,
  putProfessionalServices,
  unblockProfessional,
} from '../../shared/api/business'
import type { Professional, Service } from '../../shared/api/types'
import { getErrorMessage } from '../../shared/api/getErrorMessage'
import { Alert, Button, Input, Label, Badge, Card, EmptyState, PageHeader, PageLoading } from '../../shared/ui'
import { BlockProfessionalDialog } from './components/BlockProfessionalDialog'
import {
  ProfessionalDetailPanel,
  type ProfessionalDetailData,
} from './components/ProfessionalDetailPanel'

export function ProfessionalsPage() {
  const [items, setItems] = useState<Professional[]>([])
  const [catalogServices, setCatalogServices] = useState<Service[]>([])
  const [name, setName] = useState('')
  const [detail, setDetail] = useState<ProfessionalDetailData | null>(null)
  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [savingServices, setSavingServices] = useState(false)
  const [blockTarget, setBlockTarget] = useState<Professional | null>(null)
  const [cancelFuture, setCancelFuture] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const [pros, svcs] = await Promise.all([listProfessionals(), listServices()])
      setItems(pros)
      setCatalogServices(svcs)
      if (detail) {
        const updated = pros.find((p) => p.id === detail.professional.id)
        if (updated) {
          setDetail((prev) => (prev ? { ...prev, professional: updated } : prev))
        }
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, [])

  const handleCreate = async (e: SubmitEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await createProfessional({ name, status: 'active' })
      setName('')
      toast.success('Profesional agregado')
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleOpenDetails = async (professional: Professional) => {
    setError(null)
    setDetailLoading(true)
    setBlockTarget(null)
    try {
      const [offered, schedule, exceptions] = await Promise.all([
        getProfessionalServices(professional.id),
        getWeeklySchedule(professional.id),
        listExceptions(professional.id),
      ])
      setDetail({
        professional,
        offered,
        schedule: schedule.slots ?? [],
        exceptions,
      })
      setServiceIds(offered.map((s) => s.id))
    } catch (err) {
      setError(getErrorMessage(err))
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSaveServices = async () => {
    if (!detail) return
    setSavingServices(true)
    setError(null)
    try {
      const offered = await putProfessionalServices(detail.professional.id, serviceIds)
      setDetail({ ...detail, offered })
      toast.success('Servicios actualizados')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSavingServices(false)
    }
  }

  const handleConfirmBlock = async () => {
    if (!blockTarget) return
    setBlockLoading(true)
    setError(null)
    try {
      await blockProfessional(blockTarget.id, cancelFuture)
      toast.success(
        cancelFuture
          ? `${blockTarget.name} bloqueado y citas futuras canceladas`
          : `${blockTarget.name} bloqueado`,
      )
      const target = blockTarget
      setBlockTarget(null)
      setCancelFuture(false)
      await refresh()
      if (detail?.professional.id === target.id) {
        await handleOpenDetails({ ...target, status: 'inactive' })
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBlockLoading(false)
    }
  }

  const handleUnblock = async (p: Professional) => {
    setError(null)
    try {
      await unblockProfessional(p.id)
      toast.success(`${p.name} desbloqueado`)
      await refresh()
      if (detail?.professional.id === p.id) {
        await handleOpenDetails({ ...p, status: 'active' })
      }
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader title="Equipo" subtitle="Profesionales agendables (sin login en MVP)" />
      {error ? (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      <Card className="mb-4" interactive>
        <form className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap" onSubmit={handleCreate}>
          <div className="min-w-0 flex-1 sm:min-w-[200px]">
            <Label htmlFor="professional-name">Nombre</Label>
            <Input
              id="professional-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <Button type="submit" className="w-full self-end sm:w-auto">
            Agregar
          </Button>
        </form>
      </Card>

      {loading ? (
        <PageLoading />
      ) : items.length === 0 ? (
        <EmptyState title="Sin profesionales" description="Agrega al menos uno para abrir slots." />
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <Card
              key={p.id}
              className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${
                detail?.professional.id === p.id ? 'ring-1 ring-brand-200' : ''
              }`}
            >
              <div>
                <p className="font-semibold">{p.name}</p>
                <Badge tone={p.status === 'active' ? 'success' : 'neutral'}>
                  {p.status === 'active' ? 'Activo' : 'Bloqueado'}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                  aria-expanded={detail?.professional.id === p.id}
                  onClick={() => void handleOpenDetails(p)}
                >
                  Detalles
                </Button>
                {p.status === 'active' ? (
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setBlockTarget(p)
                      setCancelFuture(false)
                    }}
                  >
                    Bloquear
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => void handleUnblock(p)}
                  >
                    Desbloquear
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <BlockProfessionalDialog
        professional={blockTarget}
        cancelFuture={cancelFuture}
        loading={blockLoading}
        onCancelFutureChange={setCancelFuture}
        onConfirm={() => void handleConfirmBlock()}
        onClose={() => setBlockTarget(null)}
      />

      {detailLoading ? (
        <div className="mt-4">
          <PageLoading />
        </div>
      ) : null}

      {detail && !detailLoading ? (
        <ProfessionalDetailPanel
          detail={detail}
          catalogServices={catalogServices}
          serviceIds={serviceIds}
          savingServices={savingServices}
          onClose={() => {
            setDetail(null)
            setServiceIds([])
          }}
          onToggleService={(serviceId) =>
            setServiceIds((prev) =>
              prev.includes(serviceId)
                ? prev.filter((id) => id !== serviceId)
                : [...prev, serviceId],
            )
          }
          onSaveServices={() => void handleSaveServices()}
        />
      ) : null}
    </div>
  )
}
