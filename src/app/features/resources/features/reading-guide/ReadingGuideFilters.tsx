import { SelectField } from '@/app/shared/components/fields/base/SelectField'
import type { ReadingGuide } from './models/readingGuide'

export type ReadingGuideFilterValues = { month: string; year: string }

const monthOptions = [
  { value: '', label: 'Todos' },
  ...Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1).padStart(2, '0'),
    label: new Intl.DateTimeFormat('es', { month: 'long' }).format(new Date(2020, index, 1)),
  })),
]

export function ReadingGuideFilters({
  guides,
  value,
  onChange,
}: {
  guides: ReadingGuide[]
  value: ReadingGuideFilterValues
  onChange: (value: ReadingGuideFilterValues) => void
}) {
  const years = [...new Set(guides.map((guide) => guide.monthDate.slice(0, 4)))]
    .sort((a, b) => Number(a) - Number(b))
    .map((year) => ({ value: year, label: year }))

  return (
    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <SelectField
        id="reading-guide-month-filter"
        label="Mes"
        options={monthOptions}
        value={value.month}
        onChange={(month) => onChange({ ...value, month })}
      />
      <SelectField
        id="reading-guide-year-filter"
        label="Año"
        options={[{ value: '', label: 'Todos' }, ...years]}
        value={value.year}
        onChange={(year) => onChange({ ...value, year })}
      />
    </div>
  )
}
