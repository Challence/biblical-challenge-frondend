import { SelectField } from '@/app/shared/components/fields/base/SelectField'

export function ResourceMonthFilters({
  value,
  onChange,
}: {
  value: { month: string; year: string }
  onChange: (value: { month: string; year: string }) => void
}) {
  const months = [
    { value: '', label: 'Todos' },
    ...Array.from({ length: 12 }, (_, index) => ({
      value: String(index + 1),
      label: new Intl.DateTimeFormat('es', { month: 'long' }).format(new Date(2020, index, 1)),
    })),
  ]
  const currentYear = new Date().getFullYear()
  const years = [
    { value: '', label: 'Todos' },
    ...Array.from({ length: 21 }, (_, index) => {
      const year = String(currentYear + 5 - index)
      return { value: year, label: year }
    }),
  ]
  return (
    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SelectField
        id="resource-month-filter"
        label="Mes"
        options={months}
        value={value.month}
        onChange={(month) => onChange({ ...value, month })}
      />
      <SelectField
        id="resource-year-filter"
        label="Año"
        options={years}
        value={value.year}
        onChange={(year) => onChange({ ...value, year })}
      />
    </div>
  )
}
