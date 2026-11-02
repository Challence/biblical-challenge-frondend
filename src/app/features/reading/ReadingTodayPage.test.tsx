import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePublicSegmentDetails, usePublicSegments } from '../segments/hooks/usePublicSegments'
import { ReadingTodayPage } from './ReadingTodayPage'

vi.mock('../segments/hooks/usePublicSegments', () => ({
  usePublicSegmentDetails: vi.fn(),
  usePublicSegments: vi.fn(),
}))
vi.mock('../segments/shared/components/specialized/PublicSegmentDayTemplate', () => ({
  PublicSegmentDayTemplate: ({ day }: { day: { day: number } }) => (
    <div data-testid="day-template">Lectura del día {day.day}</div>
  ),
}))

const segmentSummary = { id: 'november', title: 'Noviembre', month: 11, year: 2026, days: 3 }
const segmentDetail = {
  ...segmentSummary,
  days: [
    { day: 12, blocks: [] },
    { day: 2, blocks: [] },
    { day: 8, blocks: [] },
  ],
  status: 'active' as const,
  coverPath: '',
  position: 1,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ReadingTodayPage />
    </MemoryRouter>,
  )
}

function mockLists(overrides = {}) {
  vi.mocked(usePublicSegments).mockReturnValue({
    data: [segmentSummary],
    isLoading: false,
    isError: false,
    ...overrides,
  } as ReturnType<typeof usePublicSegments>)
}

function mockDetail(overrides = {}) {
  vi.mocked(usePublicSegmentDetails).mockReturnValue([
    {
      data: segmentDetail,
      isLoading: false,
      isError: false,
      ...overrides,
    },
  ] as unknown as ReturnType<typeof usePublicSegmentDetails>)
}

describe('ReadingTodayPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 8, 12))
    mockLists()
    mockDetail()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('conserva la plantilla pública cuando existe la lectura del día actual', () => {
    renderPage()

    expect(screen.getByTestId('day-template')).toHaveTextContent('Lectura del día 8')
    expect(screen.queryByText('No tenemos una lectura para hoy.')).not.toBeInTheDocument()
  })

  it('ofrece los días configurados anterior y siguiente más cercanos sin depender del orden', () => {
    vi.setSystemTime(new Date(2026, 10, 10, 12))

    renderPage()

    expect(screen.getByRole('heading', { name: 'No tenemos una lectura para hoy.' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Lectura anterior: 8/11/2026' })).toHaveAttribute(
      'href',
      '/segmentos/november/dias/8',
    )
    expect(screen.getByRole('link', { name: 'Lectura siguiente: 12/11/2026' })).toHaveAttribute(
      'href',
      '/segmentos/november/dias/12',
    )
  })

  it.each([
    [1, 'Lectura siguiente: 2/11/2026', 'Lectura anterior:'],
    [15, 'Lectura anterior: 12/11/2026', 'Lectura siguiente:'],
  ])('en el día %i ofrece únicamente la alternativa disponible', (day, available, absent) => {
    vi.setSystemTime(new Date(2026, 10, day, 12))

    renderPage()

    expect(screen.getByRole('link', { name: available })).toBeVisible()
    expect(screen.queryByRole('link', { name: new RegExp(absent) })).not.toBeInTheDocument()
  })

  it('diferencia un error remoto del estado sin lectura', () => {
    mockDetail({ data: undefined, isError: true })

    renderPage()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No pudimos cargar la lectura de hoy. Intenta nuevamente más tarde.',
    )
    expect(screen.queryByText('No tenemos una lectura para hoy.')).not.toBeInTheDocument()
  })

  it('recomienda alternativas globales cuando no existe el segmento mensual', () => {
    const previous = { ...segmentSummary, id: 'october', title: 'Octubre', month: 10, year: 2026 }
    const next = { ...segmentSummary, id: 'december', title: 'Diciembre', month: 12, year: 2026 }
    mockLists({ data: [previous, next] })
    vi.mocked(usePublicSegmentDetails).mockReturnValue([
      {
        data: { ...previous, days: [{ day: 31, blocks: [] }] },
        isLoading: false,
        isError: false,
      },
      {
        data: { ...next, days: [{ day: 1, blocks: [] }] },
        isLoading: false,
        isError: false,
      },
    ] as unknown as ReturnType<typeof usePublicSegmentDetails>)

    renderPage()

    expect(screen.getByRole('heading', { name: 'No tenemos una lectura para hoy.' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Lectura anterior: 31/10/2026' })).toHaveAttribute(
      'href',
      '/segmentos/october/dias/31',
    )
    expect(screen.getByRole('link', { name: 'Lectura siguiente: 1/12/2026' })).toHaveAttribute(
      'href',
      '/segmentos/december/dias/1',
    )
  })
})
