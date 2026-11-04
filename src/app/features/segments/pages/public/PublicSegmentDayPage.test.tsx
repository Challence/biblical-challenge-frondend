import '@testing-library/jest-dom/vitest'
import { act, render, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { usePublicSegment } from '../../hooks/usePublicSegments'
import { PublicSegmentDayPage } from './PublicSegmentDayPage'

vi.mock('../../hooks/usePublicSegments', () => ({ usePublicSegment: vi.fn() }))
vi.mock('../../shared/components/specialized/PublicSegmentDayTemplate', () => ({
  PublicSegmentDayTemplate: () => <div />,
}))

const segment = {
  id: 'november',
  title: 'Noviembre',
  month: 11,
  year: 2026,
  coverPath: '',
  slug: 'november',
  days: [
    { id: 'day-1', day: 1, blocks: [] },
    { id: 'day-2', day: 2, blocks: [] },
  ],
}

function DayNavigation() {
  const navigate = useNavigate()
  return <button onClick={() => navigate('/segmentos/november/dias/2')}>Cambiar día</button>
}

describe('PublicSegmentDayPage', () => {
  it('hace scroll al inicio al entrar y al cambiar de día', async () => {
    vi.mocked(usePublicSegment).mockReturnValue({
      data: segment,
      isLoading: false,
      isError: false,
    } as never)
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    const view = render(
      <MemoryRouter initialEntries={['/segmentos/november/dias/1']}>
        <Routes>
          <Route
            path="/segmentos/:slug/dias/:day"
            element={
              <>
                <DayNavigation />
                <PublicSegmentDayPage />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(scrollTo).toHaveBeenCalledWith(0, 0)
    scrollTo.mockClear()
    await act(async () => {
      view.getByRole('button', { name: 'Cambiar día' }).click()
    })
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, 0))
    scrollTo.mockRestore()
  })
})
