import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/shared/components/ui/card'
import { FileField } from '@/app/shared/components/fields/base/FileField'
import { SelectField } from '@/app/shared/components/fields/base/SelectField'
import { RhfTextField } from '@/app/shared/components/fields/rhf/RhfTextField'
import { useController, useFormContext, useWatch } from 'react-hook-form'
import type { SegmentFormValues } from '../../../models/segmentFormSchema'
import { SEGMENT_MONTHS } from '../../../models/segmentCatalog'

interface SegmentInformationCardProps {
  onMonthChange: (month: string) => void
}

export function SegmentInformationCard({ onMonthChange }: SegmentInformationCardProps) {
  const { control, setValue } = useFormContext<SegmentFormValues>()
  const cover = useWatch({ control, name: 'cover' })
  const { field: monthField, fieldState: monthState } = useController({ control, name: 'month' })
  const [error, setError] = useState('')
  const selectCover = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen válido.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5 MB.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () =>
      setValue('cover', typeof reader.result === 'string' ? reader.result : '', {
        shouldDirty: true,
      })
    reader.readAsDataURL(file)
  }
  return (
    <Card>
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-lg">Información del segmento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        <RhfTextField<SegmentFormValues>
          id="segment-title"
          name="title"
          label="Título"
          required
          placeholder="Ej. Lecturas de enero"
        />
        <SelectField
          id="segment-month"
          label="Mes"
          required
          placeholder="Selecciona un mes"
          options={SEGMENT_MONTHS.map((item) => ({ value: item, label: item }))}
          value={monthField.value}
          onChange={onMonthChange}
          error={monthState.error?.message}
        />
        <FileField
          id="segment-cover"
          label="Imagen de portada (opcional)"
          accept="image/*"
          error={error}
          onFileChange={(file) => selectCover(file ?? undefined)}
        />
        {cover && (
          <img
            src={cover}
            alt="Vista previa de la portada"
            className="h-32 w-full rounded-md object-cover"
          />
        )}
      </CardContent>
    </Card>
  )
}
