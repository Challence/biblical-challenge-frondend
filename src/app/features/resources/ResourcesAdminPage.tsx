import { useState } from 'react'
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/shared/components/ui/card'
import { Input } from '@/app/shared/components/ui/input'
import { Label } from '@/app/shared/components/ui/label'
import { FileField } from '@/app/shared/components/fields/base/FileField'
import { SelectField } from '@/app/shared/components/fields/base/SelectField'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'
import { initialMonths, makeId, type Month, type Resource, type ResourceType } from './resources'
import { AdminBreadcrumb } from '@/app/shared/components/navigation/AdminBreadcrumb'

const blankMonth = () => ({ title: '', description: '' })
const blankResource = (): Omit<Resource, 'id'> => ({
  title: '',
  description: '',
  type: 'image',
  source: '',
})

export function ResourcesAdminPage() {
  const [months, setMonths] = useState<Month[]>(initialMonths)
  const [selectedId, setSelectedId] = useState(initialMonths[0]?.id ?? '')
  const [monthDraft, setMonthDraft] = useState(blankMonth())
  const [editingMonth, setEditingMonth] = useState<string | null>(null)
  const [monthDialogOpen, setMonthDialogOpen] = useState(false)
  const [resourceDraft, setResourceDraft] = useState(blankResource())
  const [editingResource, setEditingResource] = useState<string | null>(null)
  const [resourceMonthId, setResourceMonthId] = useState<string | null>(null)
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false)
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({})
  const resourceMonth = months.find((month) => month.id === resourceMonthId)

  const moveMonth = (index: number, direction: -1 | 1) =>
    setMonths((current) => {
      const next = [...current]
      const target = index + direction
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  const openNewMonth = () => {
    setEditingMonth(null)
    setMonthDraft(blankMonth())
    setMonthDialogOpen(true)
  }
  const openEditMonth = (month: Month) => {
    setEditingMonth(month.id)
    setMonthDraft({ title: month.title, description: month.description })
    setMonthDialogOpen(true)
  }
  const closeMonthDialog = () => {
    setMonthDialogOpen(false)
    setEditingMonth(null)
    setMonthDraft(blankMonth())
  }
  const saveMonth = () => {
    if (!monthDraft.title.trim()) return
    if (editingMonth)
      setMonths((all) =>
        all.map((month) => (month.id === editingMonth ? { ...month, ...monthDraft } : month)),
      )
    else {
      const month = { id: makeId(), ...monthDraft, resources: [] }
      setMonths((all) => [...all, month])
      setSelectedId(month.id)
    }
    closeMonthDialog()
  }
  const openNewResource = (monthId: string) => {
    setResourceMonthId(monthId)
    setEditingResource(null)
    setResourceDraft(blankResource())
    setResourceDialogOpen(true)
  }
  const openEditResource = (monthId: string, resource: Resource) => {
    setResourceMonthId(monthId)
    setEditingResource(resource.id)
    setResourceDraft({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      source: resource.source,
    })
    setResourceDialogOpen(true)
  }
  const closeResourceDialog = () => {
    setResourceDialogOpen(false)
    setResourceMonthId(null)
    setEditingResource(null)
    setResourceDraft(blankResource())
  }
  const saveResource = () => {
    if (!resourceMonthId || !resourceDraft.title.trim() || !resourceDraft.source.trim()) return
    setMonths((all) =>
      all.map((month) =>
        month.id !== resourceMonthId
          ? month
          : {
              ...month,
              resources: editingResource
                ? month.resources.map((item) =>
                    item.id === editingResource ? { ...resourceDraft, id: editingResource } : item,
                  )
                : [...month.resources, { ...resourceDraft, id: makeId() }],
            },
      ),
    )
    closeResourceDialog()
  }
  const setImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setResourceDraft((draft) => ({ ...draft, source: URL.createObjectURL(file), type: 'image' }))
  }
  const moveResource = (monthId: string, index: number, direction: -1 | 1) =>
    setMonths((all) =>
      all.map((month) => {
        if (month.id !== monthId) return month
        const resources = [...month.resources]
        const target = index + direction
        if (target < 0 || target >= resources.length) return month
        ;[resources[index], resources[target]] = [resources[target], resources[index]]
        return { ...month, resources }
      }),
    )

  return (
    <main className="mx-auto max-w-[76rem]">
      <AdminBreadcrumb
        items={[{ label: 'Recursos', to: '/admin/recursos' }]}
        currentLabel="Recursos por mes"
        backTo="/admin/recursos"
      />
      <header className="mb-8 flex items-end justify-between gap-6 max-[42rem]:mb-6 max-[42rem]:items-start max-[42rem]:flex-col">
        <div>
          <h1 className="m-0 font-[Merriweather,Georgia,serif] text-[clamp(2rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.04em]">
            Recursos por mes
          </h1>
          <p className="mt-2 mb-0 text-muted-foreground">
            Organiza meses y sus recursos antes de publicarlos.
          </p>
        </div>
        <Button onClick={openNewMonth}>
          <IconPlus aria-hidden="true" />
          Nuevo mes
        </Button>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Meses ({months.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {months.map((month, index) => {
            const expanded = expandedMonths[month.id] ?? false
            const resourcesId = `month-resources-${month.id}`
            return (
              <div
                key={month.id}
                className={`rounded-lg border p-3 ${selectedId === month.id ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`${expanded ? 'Contraer' : 'Expandir'} recursos de ${month.title}`}
                    aria-expanded={expanded}
                    aria-controls={resourcesId}
                    onClick={() =>
                      setExpandedMonths((current) => ({ ...current, [month.id]: !expanded }))
                    }
                  >
                    {expanded ? (
                      <IconChevronDown aria-hidden="true" />
                    ) : (
                      <IconChevronRight aria-hidden="true" />
                    )}
                  </Button>
                  <button
                    type="button"
                    className="min-h-11 min-w-0 flex-1 text-left"
                    onClick={() => setSelectedId(month.id)}
                  >
                    <span className="font-medium">{month.title}</span>
                    <span className="block text-sm text-muted-foreground">
                      {month.resources.length} recursos
                    </span>
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Subir mes"
                    disabled={index === 0}
                    onClick={() => moveMonth(index, -1)}
                  >
                    <IconArrowUp />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Bajar mes"
                    disabled={index === months.length - 1}
                    onClick={() => moveMonth(index, 1)}
                  >
                    <IconArrowDown />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Editar ${month.title}`}
                    onClick={() => openEditMonth(month)}
                  >
                    <IconEdit />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Eliminar ${month.title}`}
                    onClick={() => {
                      setMonths((all) => all.filter((item) => item.id !== month.id))
                      if (selectedId === month.id)
                        setSelectedId(months.find((item) => item.id !== month.id)?.id ?? '')
                    }}
                  >
                    <IconTrash />
                  </Button>
                </div>
                {expanded && (
                  <div
                    id={resourcesId}
                    className="mt-2 space-y-2 border-l-2 border-muted pl-10"
                    aria-label={`Recursos de ${month.title}`}
                  >
                    <Button onClick={() => openNewResource(month.id)}>
                      <IconPlus aria-hidden="true" />
                      Agregar recurso
                    </Button>
                    {month.resources.length === 0 ? (
                      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        Este mes todavía no tiene recursos.
                      </p>
                    ) : (
                      month.resources.map((resource, resourceIndex) => (
                        <div
                          key={resource.id}
                          className="flex flex-wrap items-center gap-2 rounded-lg border bg-background p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {resource.description || 'Sin descripción'}
                            </p>
                            <p className="text-xs uppercase text-muted-foreground">
                              {resource.type}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Subir recurso"
                            disabled={resourceIndex === 0}
                            onClick={() => moveResource(month.id, resourceIndex, -1)}
                          >
                            <IconArrowUp />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Bajar recurso"
                            disabled={resourceIndex === month.resources.length - 1}
                            onClick={() => moveResource(month.id, resourceIndex, 1)}
                          >
                            <IconArrowDown />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Editar ${resource.title}`}
                            onClick={() => openEditResource(month.id, resource)}
                          >
                            <IconEdit />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Eliminar ${resource.title}`}
                            onClick={() =>
                              setMonths((all) =>
                                all.map((item) =>
                                  item.id === month.id
                                    ? {
                                        ...item,
                                        resources: item.resources.filter(
                                          (resourceItem) => resourceItem.id !== resource.id,
                                        ),
                                      }
                                    : item,
                                ),
                              )
                            }
                          >
                            <IconTrash />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
      <Dialog
        open={monthDialogOpen}
        onOpenChange={(open) => (open ? setMonthDialogOpen(true) : closeMonthDialog())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMonth ? 'Editar mes' : 'Nuevo mes'}</DialogTitle>
            <DialogDescription>
              {editingMonth
                ? 'Actualiza la información del mes.'
                : 'Añade un nuevo mes para organizar sus recursos.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="month-title">Título *</Label>
              <Input
                id="month-title"
                required
                data-autofocus
                value={monthDraft.title}
                onChange={(e) => setMonthDraft({ ...monthDraft, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="month-description">Descripción</Label>
              <Input
                id="month-description"
                value={monthDraft.description}
                onChange={(e) => setMonthDraft({ ...monthDraft, description: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={saveMonth}>{editingMonth ? 'Guardar cambios' : 'Crear mes'}</Button>
              <Button variant="ghost" onClick={closeMonthDialog}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={resourceDialogOpen}
        onOpenChange={(open) => (open ? setResourceDialogOpen(true) : closeResourceDialog())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingResource ? 'Editar recurso' : 'Agregar recurso'}</DialogTitle>
            <DialogDescription>
              {resourceMonth
                ? `Recurso del mes ${resourceMonth.title}.`
                : 'Completa los datos del recurso.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="resource-title">Título *</Label>
              <Input
                id="resource-title"
                required
                data-autofocus
                value={resourceDraft.title}
                onChange={(e) => setResourceDraft({ ...resourceDraft, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="resource-description">Descripción</Label>
              <Input
                id="resource-description"
                value={resourceDraft.description}
                onChange={(e) =>
                  setResourceDraft({ ...resourceDraft, description: e.target.value })
                }
              />
            </div>
            <SelectField
              id="resource-type"
              label="Tipo"
              value={resourceDraft.type}
              onChange={(value) =>
                setResourceDraft({
                  ...resourceDraft,
                  type: value as ResourceType,
                  source: '',
                })
              }
              options={[
                { value: 'image', label: 'Imagen' },
                { value: 'video', label: 'Video' },
              ]}
            />
            {resourceDraft.type === 'image' ? (
              <div>
                <FileField
                  id="resource-file"
                  label="Archivo de imagen *"
                  accept="image/*"
                  required
                  onFileChange={(file) => file && setImageFile(file)}
                />
                {resourceDraft.source && (
                  <img
                    src={resourceDraft.source}
                    alt="Vista previa del recurso"
                    className="mt-2 max-h-48 rounded-md object-contain"
                  />
                )}
              </div>
            ) : (
              <div>
                <Label htmlFor="resource-url">URL del video *</Label>
                <Input
                  id="resource-url"
                  type="url"
                  required
                  value={resourceDraft.source}
                  onChange={(e) => setResourceDraft({ ...resourceDraft, source: e.target.value })}
                  placeholder="https://…"
                />
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <Button onClick={saveResource}>Guardar recurso</Button>
              <Button variant="ghost" onClick={closeResourceDialog}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
