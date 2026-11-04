import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BackofficeLayout } from './BackofficeLayout'

const { getSession, unsubscribe } = vi.hoisted(() => ({
  getSession: vi.fn(),
  unsubscribe: vi.fn(),
}))

vi.mock('@/app/shared/analytics/AnalyticsTracker', () => ({
  AnalyticsTracker: () => null,
}))

vi.mock('@/app/shared/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession,
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe } } })),
    },
  },
}))

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        path: '/admin',
        element: <BackofficeLayout />,
        children: [{ index: true, element: <div>Dashboard</div> }],
      },
    ],
    { initialEntries: ['/admin'] },
  )

  return render(<RouterProvider router={router} />)
}

describe('BackofficeLayout profile identity', () => {
  beforeEach(() => {
    getSession.mockReset()
    unsubscribe.mockClear()
  })

  it('shows the session email as the primary identity without a duplicate line', async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { email: 'admin@example.com' } } },
    })

    renderLayout()

    const profileButton = screen.getByRole('button', { name: 'Abrir menú de perfil' })
    await waitFor(() => expect(within(profileButton).getByText('admin@example.com')).toBeVisible())

    expect(within(profileButton).getAllByText('admin@example.com')).toHaveLength(1)
    expect(within(profileButton).getByText('Administradora')).toBeVisible()
    expect(within(profileButton).queryByText('María López')).not.toBeInTheDocument()
  })

  it('uses a non-fictional fallback when the session has no email', async () => {
    getSession.mockResolvedValue({ data: { session: null } })

    renderLayout()

    const profileButton = screen.getByRole('button', { name: 'Abrir menú de perfil' })
    await waitFor(() =>
      expect(within(profileButton).getByText('Correo no disponible')).toBeVisible(),
    )
    expect(within(profileButton).getByText('Administradora')).toBeVisible()
  })
})
