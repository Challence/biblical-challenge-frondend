import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DataTable } from './DataTable'

type Item = { id: string; name: string }

const columns = [{ key: 'name', header: 'Nombre', cell: (item: Item) => item.name }]

describe('DataTable', () => {
  it('renders headers and custom cells', () => {
    render(
      <DataTable
        columns={columns}
        data={[{ id: '1', name: 'Uno' }]}
        getRowId={(item) => item.id}
        caption="Items"
      />,
    )
    expect(screen.getByText('Nombre')).toBeTruthy()
    expect(screen.getByText('Uno')).toBeTruthy()
    expect(screen.getByText('Items')).toBeTruthy()
  })

  it('renders generic states', () => {
    const props = { columns, data: [], getRowId: (item: Item) => item.id }
    const { rerender } = render(<DataTable {...props} empty="Vacío" />)
    expect(screen.getByText('Vacío')).toBeTruthy()
    rerender(<DataTable {...props} loading loadingMessage="Cargando" />)
    expect(screen.getByText('Cargando')).toBeTruthy()
    rerender(<DataTable {...props} error="Error" />)
    expect(screen.getByText('Error')).toBeTruthy()
  })
})
