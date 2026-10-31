import { IconSearch } from '@tabler/icons-react'
import { Input } from '@/app/shared/components/ui/input'

type Props = { value: string; onChange: (value: string) => void }

export function AnnouncementFilters({ value, onChange }: Props) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <label className="flex min-h-11 min-w-0 items-center gap-2 rounded-md border bg-card px-3">
        <IconSearch size={18} aria-hidden="true" />
        <span className="sr-only">Buscar anuncios</span>
        <Input
          className="min-w-0 border-0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar por enlace..."
          type="search"
        />
      </label>
    </div>
  )
}
