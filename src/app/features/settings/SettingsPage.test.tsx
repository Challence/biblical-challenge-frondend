import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { usePushNotifications } from '@/app/shared/hooks/usePushNotifications'
import { SettingsPage } from './SettingsPage'

vi.mock('@/app/shared/hooks/usePushNotifications', () => ({ usePushNotifications: vi.fn() }))

const enable = vi.fn(async () => undefined)
const disable = vi.fn(async () => undefined)

const renderPage = (status: ReturnType<typeof usePushNotifications>['status'], error = '') => {
  vi.mocked(usePushNotifications).mockReturnValue({ status, error, enable, disable })
  return render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>,
  )
}

describe('SettingsPage notifications', () => {
  it('activa los recordatorios desde un switch accesible', () => {
    renderPage('inactive')

    const control = screen.getByRole('switch', { name: 'Recordatorios de lectura' })
    expect(control).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(control)
    expect(enable).toHaveBeenCalledOnce()
  })

  it('comunica cuando el permiso está bloqueado', () => {
    renderPage('denied')

    expect(screen.getByRole('switch')).toBeDisabled()
    expect(screen.getByText(/El permiso está bloqueado/)).toBeVisible()
  })
})
