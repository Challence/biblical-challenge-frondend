import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/app/shared/components/ui/button'
import { SegmentMonthCoordinator } from '../../shared/components/specialized/SegmentMonthCoordinator'
import { createSegment, getSegment, updateSegment } from '../../services/segmentService'
import { segmentFormSchema, type SegmentFormValues } from '../../models/segmentFormSchema'
import { SEGMENT_MONTHS } from '../../models/segmentCatalog'

export function SegmentFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = useQuery({
    queryKey: ['segment', id],
    queryFn: () => getSegment(id as string),
    enabled: Boolean(id),
  })
  const form = useForm<SegmentFormValues>({
    resolver: zodResolver(segmentFormSchema),
    defaultValues: { title: '', month: '', cover: '', days: [] },
  })
  const { reset, handleSubmit, formState } = form
  useEffect(() => {
    if (!existing.data) return
    reset({
      title: existing.data.title,
      month: SEGMENT_MONTHS[existing.data.month - 1] ?? '',
      cover: existing.data.cover_path ?? '',
      days: existing.data.segment_days.map((day) => ({
        day: day.day,
        blocks: [...day.segment_blocks]
          .sort((a, b) => a.position - b.position)
          .map((block) => ({
            id: `${day.day}-${block.position}`,
            type: block.type,
            value: block.content,
            name: block.file_name,
          })),
      })),
    })
  }, [existing.data, reset])
  const save = (values: SegmentFormValues) => {
    const payload = {
      title: values.title.trim(),
      month: SEGMENT_MONTHS.indexOf(values.month as (typeof SEGMENT_MONTHS)[number]) + 1,
      year: new Date().getFullYear(),
      coverPath: values.cover || undefined,
      days: values.days.map(({ day, blocks }) => ({
        day,
        blocks: blocks.map((block) => ({
          type: block.type,
          content: block.value,
          fileName: block.name,
        })),
      })),
    }
    void (id ? updateSegment(id, payload) : createSegment(payload))
      .then(() => navigate('/admin/segmentos'))
      .catch(() => form.setError('root', { message: 'No se pudo guardar el segmento.' }))
  }
  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(save)} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SegmentMonthCoordinator />
          <div className="flex flex-wrap gap-2 lg:col-span-2 lg:justify-end">
            <Button type="submit" disabled={formState.isSubmitting}>
              Guardar segmento
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/segmentos')}>
              Cancelar
            </Button>
          </div>
        </form>
      </FormProvider>
      {formState.errors.root && (
        <p className="sr-only" role="alert">
          {formState.errors.root.message}
        </p>
      )}
    </>
  )
}
export { SegmentFormPage as NewSegmentPage }
