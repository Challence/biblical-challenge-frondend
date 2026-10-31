import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconPhoto,
  IconPlus,
  IconTrash,
  IconVideo,
} from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'
import { FileField } from '@/app/shared/components/fields/base/FileField'
import { Input } from '@/app/shared/components/ui/input'
import { Label } from '@/app/shared/components/ui/label'
import { Textarea } from '@/app/shared/components/ui/textarea'
import type { SegmentFormValues } from '../../../models/segmentFormSchema'
import { SEGMENT_MONTHS, SEGMENT_WEEKDAYS } from '../../../models/segmentCatalog'
type Block = SegmentFormValues['days'][number]['blocks'][number]
export function getDaysValidationMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined
  const message = (error as { message?: unknown }).message
  if (typeof message === 'string') return message
  for (const child of Object.values(error)) {
    const childMessage = getDaysValidationMessage(child)
    if (childMessage) return childMessage
  }
  return undefined
}
interface SegmentCalendarCardProps {
  onMonthChange: (month: string) => void
}
export function SegmentCalendarCard({ onMonthChange }: SegmentCalendarCardProps) {
  const { control, setValue, formState } = useFormContext<SegmentFormValues>()
  const daysValue = useWatch({ control, name: 'days' })
  const monthValue = useWatch({ control, name: 'month' })
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [draft, setDraft] = useState<Block[]>([])
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)
  const [imageError, setImageError] = useState('')
  const year = new Date().getFullYear()
  const selectedMonth = SEGMENT_MONTHS.indexOf(monthValue as (typeof SEGMENT_MONTHS)[number])
  const calendarMonth = selectedMonth >= 0 ? selectedMonth : new Date().getMonth()
  const changeMonth = (offset: number) =>
    onMonthChange(SEGMENT_MONTHS[(calendarMonth + offset + 12) % 12])
  const openDay = (day: number) => {
    setEditingDay(day)
    setDraft(daysValue.find((item) => item.day === day)?.blocks ?? [])
  }
  const saveDay = () => {
    if (editingDay === null) return
    const next = daysValue.filter((item) => item.day !== editingDay)
    if (draft.length) next.push({ day: editingDay, blocks: draft })
    setValue(
      'days',
      next.sort((a, b) => a.day - b.day),
      { shouldDirty: true, shouldValidate: true },
    )
    setEditingDay(null)
  }
  const addBlock = (type: Block['type']) => {
    setImageError('')
    setEditingBlock({ id: `${Date.now()}-${Math.random()}`, type, value: '' })
  }
  const commitBlock = () => {
    if (!editingBlock || (editingBlock.type !== 'image' && !editingBlock.value.trim())) return
    if (editingBlock.type === 'video') {
      try {
        new URL(editingBlock.value)
      } catch {
        return
      }
    }
    setDraft((items) => {
      const index = items.findIndex((item) => item.id === editingBlock.id)
      return index < 0
        ? [...items, editingBlock]
        : items.map((item, i) => (i === index ? editingBlock : item))
    })
    setEditingBlock(null)
  }
  const selectImage = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Selecciona un archivo de imagen válido.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('La imagen no puede superar los 5 MB.')
      return
    }
    setImageError('')
    const reader = new FileReader()
    reader.onload = () =>
      setEditingBlock((block) =>
        block
          ? {
              ...block,
              value: typeof reader.result === 'string' ? reader.result : '',
              name: file.name,
            }
          : block,
      )
    reader.readAsDataURL(file)
  }
  const firstDay = new Date(year, calendarMonth, 1).getDay()
  const offset = (firstDay + 6) % 7
  const monthDays = new Date(year, calendarMonth + 1, 0).getDate()
  return (
    <>
      <Card>
        <CardHeader className="p-4 pb-3">
          <CardTitle className="text-lg">Calendario mensual</CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecciona los días que formarán parte del segmento.
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="mb-3 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Mes anterior"
              onClick={() => changeMonth(-1)}
            >
              <IconChevronLeft />
            </Button>
            <strong>
              {SEGMENT_MONTHS[calendarMonth]} {year}
            </strong>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Mes siguiente"
              onClick={() => changeMonth(1)}
            >
              <IconChevronRight />
            </Button>
          </div>
          <div
            className="grid grid-cols-7 gap-px text-center text-sm"
            role="grid"
            aria-label={`Calendario de ${SEGMENT_MONTHS[calendarMonth]}`}
          >
            {SEGMENT_WEEKDAYS.map((day) => (
              <span key={day} className="py-1 text-xs font-bold text-muted-foreground">
                {day}
              </span>
            ))}
            {Array.from({ length: offset }, (_, index) => (
              <span key={`empty-${index}`} />
            ))}
            {Array.from({ length: monthDays }, (_, index) => {
              const day = index + 1
              const active = daysValue.some((item) => item.day === day)
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => openDay(day)}
                  aria-label={`Día ${day}${active ? ', configurado' : ''}`}
                  aria-pressed={active}
                  className={`relative h-10 w-10 justify-self-center rounded-md border text-sm ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-transparent hover:border-border hover:bg-muted'}`}
                >
                  {day}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
            {daysValue.length} {daysValue.length === 1 ? 'día seleccionado' : 'días seleccionados'}
          </p>
          {formState.isSubmitted && formState.errors.days && (
            <p className="mt-2 text-sm text-destructive">
              {getDaysValidationMessage(formState.errors.days) ??
                'Revisa que cada día tenga al menos un bloque.'}
            </p>
          )}
        </CardContent>
      </Card>
      <Dialog open={editingDay !== null} onOpenChange={(open) => !open && setEditingDay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDay ? `${SEGMENT_MONTHS[calendarMonth]} ${editingDay}` : ''}
            </DialogTitle>
            <DialogDescription>
              Agrega y ordena los bloques de contenido de este día.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => addBlock('text')}>
                <IconPlus size={16} /> Texto
              </Button>
              <Button type="button" variant="outline" onClick={() => addBlock('image')}>
                <IconPhoto size={16} /> Imagen
              </Button>
              <Button type="button" variant="outline" onClick={() => addBlock('video')}>
                <IconVideo size={16} /> Video
              </Button>
            </div>
            {draft.length === 0 && (
              <p className="text-sm text-muted-foreground">Aún no hay bloques.</p>
            )}
            <ol className="space-y-2" aria-label="Bloques del día">
              {draft.map((block, index) => (
                <li key={block.id} className="flex items-center gap-2 rounded-md border p-2">
                  <span className="flex-1 truncate text-sm">
                    {block.name || block.value || 'Texto vacío'}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar bloque ${index + 1}`}
                    onClick={() => setEditingBlock(block)}
                  >
                    <IconEdit size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Subir bloque ${index + 1}`}
                    disabled={!index}
                    onClick={() =>
                      setDraft((items) => {
                        const next = [...items]
                        ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                        return next
                      })
                    }
                  >
                    <IconArrowUp size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Bajar bloque ${index + 1}`}
                    disabled={index === draft.length - 1}
                    onClick={() =>
                      setDraft((items) => {
                        const next = [...items]
                        ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
                        return next
                      })
                    }
                  >
                    <IconArrowDown size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar bloque ${index + 1}`}
                    onClick={() =>
                      setDraft((items) => items.filter((item) => item.id !== block.id))
                    }
                  >
                    <IconTrash size={16} />
                  </Button>
                </li>
              ))}
            </ol>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingDay(null)}>
                Cancelar
              </Button>
              <Button type="button" onClick={saveDay}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={editingBlock !== null} onOpenChange={(open) => !open && setEditingBlock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBlock?.id && draft.some((block) => block.id === editingBlock.id)
                ? 'Editar bloque'
                : 'Nuevo bloque'}
            </DialogTitle>
          </DialogHeader>
          {editingBlock?.type === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="block-text">Texto</Label>
              <Textarea
                id="block-text"
                autoFocus
                value={editingBlock.value}
                onChange={(event) =>
                  setEditingBlock({ ...editingBlock, value: event.target.value })
                }
              />
            </div>
          )}
          {editingBlock?.type === 'video' && (
            <div className="space-y-2">
              <Label htmlFor="block-video">URL del video</Label>
              <Input
                id="block-video"
                type="url"
                autoFocus
                value={editingBlock.value}
                onChange={(event) =>
                  setEditingBlock({ ...editingBlock, value: event.target.value })
                }
                placeholder="https://..."
              />
            </div>
          )}
          {editingBlock?.type === 'image' && (
            <>
              <FileField
                id="block-image"
                label="Imagen (máximo 5 MB)"
                accept="image/*"
                error={imageError}
                onFileChange={(file) => selectImage(file ?? undefined)}
              />
              {editingBlock.value && (
                <img
                  src={editingBlock.value}
                  alt="Vista previa del bloque"
                  className="max-h-48 w-full rounded-md object-contain"
                />
              )}
            </>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditingBlock(null)}>
              Cancelar
            </Button>
            <Button type="button" onClick={commitBlock} disabled={!editingBlock?.value.trim()}>
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
