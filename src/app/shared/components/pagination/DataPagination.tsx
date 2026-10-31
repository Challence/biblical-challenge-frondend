import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/app/shared/components/ui/pagination'

export type DataPaginationProps = {
  page: number
  totalPages: number
  pageSize: number
  totalItems: number
  visibleItems: number
  itemLabel: string
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function DataPagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  visibleItems,
  itemLabel,
  onPageChange,
  disabled = false,
}: DataPaginationProps) {
  const normalizedTotalPages = Math.max(1, Math.floor(totalPages) || 1)
  const currentPage = Math.min(normalizedTotalPages, Math.max(1, Math.floor(page) || 1))
  const safePageSize = Math.max(0, pageSize)
  const safeTotalItems = Math.max(0, totalItems)
  const safeVisibleItems = Math.max(0, visibleItems)
  const start = safeVisibleItems > 0 ? (currentPage - 1) * safePageSize + 1 : 0
  const end = safeVisibleItems > 0 ? Math.min(start + safeVisibleItems - 1, safeTotalItems) : 0
  const goTo = (nextPage: number) => {
    if (!disabled && nextPage >= 1 && nextPage <= normalizedTotalPages) onPageChange(nextPage)
  }

  return (
    <div className="flex items-center justify-between gap-4 py-5 text-sm text-muted-foreground max-[32rem]:items-start max-[32rem]:flex-col">
      <span>
        Mostrando {start}–{end} de {safeTotalItems} {itemLabel}
      </span>
      <Pagination aria-label="Paginación de resultados" className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              href="#"
              size="default"
              aria-label="Página anterior"
              aria-disabled={disabled || currentPage === 1}
              tabIndex={disabled || currentPage === 1 ? -1 : undefined}
              className="gap-1 pl-2.5 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
              onClick={(event) => {
                event.preventDefault()
                goTo(currentPage - 1)
              }}
            >
              <IconChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span>Anterior</span>
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              href="#"
              size="icon"
              isActive
              aria-label={`Página ${currentPage}`}
              aria-current="page"
              onClick={(event) => event.preventDefault()}
            >
              {currentPage}
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              href="#"
              size="default"
              aria-label="Página siguiente"
              aria-disabled={disabled || currentPage === normalizedTotalPages}
              tabIndex={disabled || currentPage === normalizedTotalPages ? -1 : undefined}
              className="gap-1 pr-2.5 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
              onClick={(event) => {
                event.preventDefault()
                goTo(currentPage + 1)
              }}
            >
              <span>Siguiente</span>
              <IconChevronRight className="h-4 w-4" aria-hidden="true" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
