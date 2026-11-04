import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import type { SegmentFormValues } from '../../../models/segmentFormSchema'
import { SegmentMonthCoordinator } from './SegmentMonthCoordinator'

function FormState() {
  const values = useWatch<SegmentFormValues>()
  return <output aria-label="Estado del formulario">{JSON.stringify(values)}</output>
}

function TestForm({
  days = [],
  month = 'Marzo',
  year = new Date().getFullYear(),
}: Partial<Pick<SegmentFormValues, 'days' | 'month' | 'year'>>) {
  const form = useForm<SegmentFormValues>({
    defaultValues: { title: '', month, year, cover: '', days },
  })
  return (
    <FormProvider {...form}>
      <SegmentMonthCoordinator />
      <FormState />
    </FormProvider>
  )
}

describe('SegmentMonthCoordinator', () => {
  it('uses the form month in the calendar and changes both immediately when there are no days', () => {
    render(<TestForm />)

    expect(screen.getByRole('grid', { name: 'Calendario de Marzo' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Mes *' })).toHaveValue('Abril')
    expect(screen.getByRole('grid', { name: 'Calendario de Abril' })).toBeInTheDocument()
  })

  it('announces invalid days and only applies a month change after confirmation', () => {
    render(
      <TestForm
        days={[
          { day: 28, blocks: [{ id: '28-1', type: 'text', value: 'Válido' }] },
          { day: 31, blocks: [{ id: '31-1', type: 'text', value: 'Se elimina' }] },
        ]}
      />,
    )

    fireEvent.change(screen.getByRole('combobox', { name: 'Mes *' }), {
      target: { value: 'Febrero' },
    })

    const dialog = screen.getByRole('dialog', { name: 'Cambiar calendario del segmento' })
    expect(dialog).toHaveTextContent('Se eliminarán los días que no existen en Febrero: 31')
    expect(screen.getByRole('combobox', { name: 'Mes *' })).toHaveValue('Marzo')

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('grid', { name: 'Calendario de Marzo' })).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: 'Mes *' }), {
      target: { value: 'Febrero' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cambio' }))

    expect(screen.getByRole('combobox', { name: 'Mes *' })).toHaveValue('Febrero')
    expect(screen.getByRole('grid', { name: 'Calendario de Febrero' })).toBeInTheDocument()
    expect(screen.getByLabelText('Estado del formulario')).toHaveTextContent('"day":28')
    expect(screen.getByLabelText('Estado del formulario')).not.toHaveTextContent('"day":31')
  })

  it('confirms year changes that invalidate leap-day selections', () => {
    render(
      <TestForm
        month="Febrero"
        year={2024}
        days={[{ day: 29, blocks: [{ id: '29-1', type: 'text', value: 'Válido en bisiesto' }] }]}
      />,
    )

    const yearField = screen.getByRole('button', { name: 'Año * 2024' })
    fireEvent.click(yearField)
    fireEvent.click(screen.getByRole('button', { name: 'Años anteriores' }))
    fireEvent.click(screen.getByRole('button', { name: '2023' }))

    expect(
      screen.getByRole('dialog', { name: 'Cambiar calendario del segmento' }),
    ).toHaveTextContent('Se eliminarán los días que no existen en Febrero: 29')
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cambio' }))

    expect(screen.getByRole('button', { name: 'Año * 2023' })).toBeInTheDocument()
    expect(screen.getByLabelText('Estado del formulario')).not.toHaveTextContent('"day":29')
  })

  it('offers only years inside the supported range', () => {
    render(<TestForm year={2024} />)

    fireEvent.click(screen.getByRole('button', { name: 'Año * 2024' }))
    expect(screen.queryByRole('button', { name: '1999' })).not.toBeInTheDocument()
    expect(screen.getByText('2024–2035')).toBeInTheDocument()
    expect(screen.getByLabelText('Estado del formulario')).toHaveTextContent('"year":2024')
  })
})
