import { useState } from 'react'
import { Button } from '@/app/shared/components/ui/button'
import { Card, CardContent } from '@/app/shared/components/ui/card'
import { AdminPageHeader } from '@/app/shared/components/navigation/AdminPageHeader'
import { DataPagination } from '@/app/shared/components/pagination/DataPagination'
import { ResourceMonthFilters } from './shared/components/specialized/ResourceMonthFilters'
import { ResourceMonthList } from './shared/components/specialized/ResourceMonthList'
import { RESOURCE_MONTH_PAGE_SIZE, useResourceMonths } from './hooks/useResourceMonths'
import type { ResourceMonth } from './models/resource'
import { ResourceMonthFormDialog } from './shared/components/specialized/ResourceMonthFormDialog'
import { useModalAlert } from '@/app/shared/hooks/useModalAlert'
import { ResourceFormDialog } from './shared/components/specialized/ResourceFormDialog'
import { useMonthlyResources } from './hooks/useMonthlyResources'
import type { MonthlyResource, ResourceInput } from './models/resource'

export type ResourcesAdminPageProps = {
  onCreateMonth?: () => void
  onEditMonth?: (month: ResourceMonth) => void
  onDeleteMonth?: (month: ResourceMonth) => void
  onMoveMonth?: (month: ResourceMonth, direction: -1 | 1) => void
}
export function ResourcesAdminPage({
  onCreateMonth,
  onEditMonth,
  onDeleteMonth,
  onMoveMonth,
}: ResourcesAdminPageProps) {
  const [page, setPage] = useState(1),
    [filters, setFilters] = useState({ month: '', year: '' })
  const months = useResourceMonths(page, filters)
  const [formMonth, setFormMonth] = useState<ResourceMonth | undefined>()
  const [formOpen, setFormOpen] = useState(false)
  const [resourceMonth, setResourceMonth] = useState<ResourceMonth>()
  const [resourceForm, setResourceForm] = useState<MonthlyResource>()
  const resourceMonthId = resourceMonth?.id ?? ''
  const resourceActions = useMonthlyResources(resourceMonthId, false)
  const { warning, error } = useModalAlert()
  const save = (values: { monthDate: string }) =>
    void (
      formMonth
        ? months.update.mutateAsync({ id: formMonth.id, input: values })
        : months.create.mutateAsync(values)
    )
      .then(() => {
        setFormOpen(false)
        setFormMonth(undefined)
      })
      .catch(() => void error({ title: 'No se pudo guardar', message: 'Inténtalo de nuevo.' }))
  const remove = (month: ResourceMonth) =>
    void warning({
      title: 'Eliminar mes',
      message: '¿Seguro que quieres eliminar este mes?',
      confirmLabel: 'Eliminar',
    }).then((result) => {
      if (result.action === 'confirm')
        return months.remove
          .mutateAsync(month.id)
          .then(() => onDeleteMonth?.(month))
          .catch(() => void error({ title: 'No se pudo eliminar', message: 'Inténtalo de nuevo.' }))
    })
  const items = months.data?.items ?? []
  const move = (month: ResourceMonth, direction: -1 | 1) =>
    void months.reorder.mutate(
      { id: month.id, position: month.position + direction },
      { onSuccess: () => onMoveMonth?.(month, direction) },
    )
  const saveResource = (input: ResourceInput) =>
    void (
      resourceForm
        ? resourceActions.update.mutateAsync({ id: resourceForm.id, input })
        : resourceActions.create.mutateAsync(input)
    )
      .then(() => {
        setResourceForm(undefined)
        setResourceMonth(undefined)
      })
      .catch(() => void error({ title: 'No se pudo guardar', message: 'Inténtalo de nuevo.' }))
  const deleteResource = (resource: MonthlyResource) =>
    void warning({
      title: 'Eliminar recurso',
      message: '¿Seguro que quieres eliminar este recurso?',
      confirmLabel: 'Eliminar',
    }).then((result) => {
      if (result.action === 'confirm')
        return resourceActions.remove
          .mutateAsync(resource.id)
          .catch(() => void error({ title: 'No se pudo eliminar', message: 'Inténtalo de nuevo.' }))
    })
  return (
    <>
      <main className="mx-auto max-w-[76rem]">
        <AdminPageHeader
          title="Recursos por mes"
          description="Organiza meses y sus recursos antes de publicarlos."
          action={
            <Button
              onClick={() => {
                setFormMonth(undefined)
                setFormOpen(true)
                onCreateMonth?.()
              }}
            >
              Nuevo mes
            </Button>
          }
        />
        <ResourceMonthFilters
          value={filters}
          onChange={(value) => {
            setFilters(value)
            setPage(1)
          }}
        />
        {months.isLoading ? (
          <p role="status">Cargando meses…</p>
        ) : months.error ? (
          <div role="alert">
            <p>No se pudieron cargar los meses.</p>
            <Button variant="ghost" onClick={() => void months.refetch()}>
              Reintentar
            </Button>
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No hay meses para mostrar.
            </CardContent>
          </Card>
        ) : (
          <ResourceMonthList
            months={items}
            expanded={months.expanded}
            onToggle={months.toggle}
            onEdit={(month) => {
              setFormMonth(month)
              setFormOpen(true)
              onEditMonth?.(month)
            }}
            onDelete={remove}
            onMove={move}
            onCreateResource={(month) => {
              setResourceMonth(month)
              setResourceForm(undefined)
            }}
            onEditResource={(resource) => {
              setResourceMonth(items.find((month) => month.id === resource.resourceMonthId))
              setResourceForm(resource)
            }}
            onDeleteResourceRequest={deleteResource}
          />
        )}
        {items.length > 0 && (
          <DataPagination
            page={page}
            totalPages={months.data?.totalPages ?? 1}
            pageSize={RESOURCE_MONTH_PAGE_SIZE}
            totalItems={months.data?.total ?? 0}
            visibleItems={items.length}
            itemLabel="meses"
            onPageChange={setPage}
            disabled={months.isLoading}
          />
        )}
      </main>
      <ResourceMonthFormDialog
        open={formOpen}
        month={formMonth}
        pending={months.create.isPending || months.update.isPending}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setFormMonth(undefined)
        }}
        onSubmit={save}
      />
      <ResourceFormDialog
        open={Boolean(resourceMonth && (resourceForm || !resourceForm))}
        resource={resourceForm}
        pending={resourceActions.create.isPending || resourceActions.update.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setResourceForm(undefined)
            setResourceMonth(undefined)
          }
        }}
        onSubmit={saveResource}
      />
    </>
  )
}
