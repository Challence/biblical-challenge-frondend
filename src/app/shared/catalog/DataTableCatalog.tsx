import { DataTable } from '@/app/shared/components/table/DataTable'

const rows = [
  { id: '1', name: 'Segmento de ejemplo', status: 'Activo' },
  { id: '2', name: 'Otro segmento', status: 'Borrador' },
]

/** Desarrollo: catálogo visual del DataTable compuesto y sus estados. */
export function DataTableCatalog() {
  return (
    <main className="space-y-8 p-8" aria-labelledby="data-table-catalog-title">
      <header>
        <h1 id="data-table-catalog-title" className="text-2xl font-semibold">
          DataTable
        </h1>
        <p>Estructura tabular reutilizable con contenido y estados genéricos.</p>
      </header>
      <DataTable
        caption="Segmentos de ejemplo"
        columns={[
          { key: 'name', header: 'Nombre', cell: (row) => <strong>{row.name}</strong> },
          { key: 'status', header: 'Estado', cell: (row) => row.status },
        ]}
        data={rows}
        getRowId={(row) => row.id}
      />
    </main>
  )
}
