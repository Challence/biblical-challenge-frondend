import type { ReactNode } from 'react'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/shared/components/ui/table'
import { cn } from '@/app/shared/lib/utils'

export type DataTableColumn<T> = {
  key: string
  header: ReactNode
  cell: (item: T) => ReactNode
  className?: string
  headerClassName?: string
}

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (item: T) => string
  caption?: ReactNode
  loading?: boolean
  error?: ReactNode
  empty?: ReactNode
  loadingMessage?: ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  caption = 'Tabla de datos',
  loading = false,
  error,
  empty = 'No hay datos disponibles.',
  loadingMessage = 'Cargando…',
  className,
}: DataTableProps<T>) {
  const stateMessage = loading ? loadingMessage : error || (!data.length ? empty : null)

  return (
    <Table className={className}>
      <TableCaption className="sr-only">{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead className={column.headerClassName} key={column.key}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {stateMessage ? (
          <TableRow>
            <TableCell className="p-8 text-center text-muted-foreground" colSpan={columns.length}>
              {stateMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={getRowId(item)}>
              {columns.map((column) => (
                <TableCell className={cn(column.className)} key={column.key}>
                  {column.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
