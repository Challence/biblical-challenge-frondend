import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePushNotifications } from '@/app/shared/hooks/usePushNotifications'
import { NotificationsSection } from './NotificationsSection'

vi.mock('@/app/shared/hooks/usePushNotifications', () => ({ usePushNotifications: vi.fn() }))

describe('NotificationsSection', () => {
  it('activa los recordatorios desde su switch accesible', () => {
    const enable = vi.fn(async () => undefined)
    vi.mocked(usePushNotifications).mockReturnValue({
      status: 'inactive',
      error: '',
      enable,
      disable: vi.fn(async () => undefined),
    })

    render(<NotificationsSection />)
    fireEvent.click(screen.getByRole('switch', { name: 'Recordatorios de lectura' }))

    expect(enable).toHaveBeenCalledOnce()
  })

  it('deshabilita el switch cuando el permiso está bloqueado', () => {
    vi.mocked(usePushNotifications).mockReturnValue({
      status: 'denied',
      error: '',
      enable: vi.fn(async () => undefined),
      disable: vi.fn(async () => undefined),
    })

    render(<NotificationsSection />)

    expect(screen.getByRole('switch')).toBeDisabled()
    expect(screen.getByText(/El permiso está bloqueado/)).toBeVisible()
  })
})
