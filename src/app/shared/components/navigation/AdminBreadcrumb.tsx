import { IconArrowLeft } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/app/shared/components/ui/button'

export type AdminBreadcrumbItem = { label: string; to: string }

type AdminBreadcrumbProps = {
  items: AdminBreadcrumbItem[]
  currentLabel: string
  backTo: string
}

export function AdminBreadcrumb({ items, currentLabel, backTo }: AdminBreadcrumbProps) {
  const navigate = useNavigate()

  return (
    <nav className="mb-3 flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground" aria-label="Migas de pan">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0 bg-accent/20 text-accent-foreground hover:bg-accent/40 hover:text-accent-foreground focus-visible:ring-accent"
        aria-label="Volver"
        title="Volver"
        onClick={() => navigate(backTo)}
      >
        <IconArrowLeft aria-hidden="true" />
      </Button>
      <ol className="flex min-w-0 flex-wrap items-center gap-2">
        {items.map((item) => <li key={item.to} className="flex min-w-0 items-center gap-2"><Link className="truncate underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" to={item.to}>{item.label}</Link><span aria-hidden="true">/</span></li>)}
        <li className="truncate font-medium text-foreground" aria-current="page">{currentLabel}</li>
      </ol>
    </nav>
  )
}
