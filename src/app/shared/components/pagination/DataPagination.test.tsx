import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DataPagination } from './DataPagination'

describe('DataPagination', () => {
  it('shows the range and changes pages', () => {
    const onPageChange = vi.fn()
    render(
      <DataPagination
        page={2}
        totalPages={3}
        pageSize={10}
        totalItems={25}
        visibleItems={10}
        itemLabel="segmentos"
        onPageChange={onPageChange}
      />,
    )
    expect(screen.getByText('Mostrando 11–20 de 25 segmentos')).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Página siguiente' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
    fireEvent.click(screen.getByRole('link', { name: 'Página 2' }))
    expect(onPageChange).toHaveBeenCalledTimes(1)
  })

  it('uses a normal size for text navigation and an icon size for the current page', () => {
    render(
      <DataPagination
        page={2}
        totalPages={3}
        pageSize={10}
        totalItems={25}
        visibleItems={10}
        itemLabel="segmentos"
        onPageChange={() => undefined}
      />,
    )

    expect(screen.getByRole('link', { name: 'Página anterior' }).classList).toContain('h-10')
    expect(screen.getByRole('link', { name: 'Página anterior' }).classList).toContain('px-4')
    expect(screen.getByRole('link', { name: 'Página siguiente' }).classList).toContain('h-10')
    expect(screen.getByRole('link', { name: 'Página siguiente' }).classList).toContain('px-4')
    expect(screen.getByRole('link', { name: 'Página 2' }).classList).toContain('w-10')
  })

  it('avoids an invalid range when empty and clamps the page', () => {
    render(
      <DataPagination
        page={99}
        totalPages={0}
        pageSize={10}
        totalItems={0}
        visibleItems={0}
        itemLabel="segmentos"
        onPageChange={() => undefined}
      />,
    )
    expect(screen.getByText('Mostrando 0–0 de 0 segmentos')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Página 1' })).toBeTruthy()
  })
})
