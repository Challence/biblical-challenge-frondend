import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { getPushReminderSettings } from '../../../requests/pushReminderSettingsRequests'
import { ReminderTimeSection } from './ReminderTimeSection'

vi.mock('../../../requests/pushReminderSettingsRequests', () => ({
  getPushReminderSettings: vi.fn(),
  savePushReminderSettings: vi.fn(),
}))

describe('ReminderTimeSection', () => {
  it('carga la hora HH:mm en un campo time con precisión de minutos', async () => {
    vi.mocked(getPushReminderSettings).mockResolvedValue({ reminder_time: '08:30' })

    render(<ReminderTimeSection />)

    const input = await screen.findByLabelText('Hora de envío *')
    await waitFor(() => expect(input).toHaveValue('08:30'))
    expect(input).toHaveAttribute('type', 'time')
    expect(input).toHaveAttribute('step', '60')
    expect(screen.getByText(/Zona horaria detectada:/)).toBeVisible()
  })

  it('abre el selector nativo al hacer clic cuando showPicker está disponible', async () => {
    vi.mocked(getPushReminderSettings).mockResolvedValue({ reminder_time: '08:30' })
    render(<ReminderTimeSection />)

    const input = await screen.findByLabelText('Hora de envío *')
    const showPicker = vi.fn()
    Object.defineProperty(input, 'showPicker', { configurable: true, value: showPicker })

    fireEvent.click(input)

    expect(showPicker).toHaveBeenCalledOnce()
  })

  it('no falla al hacer clic cuando showPicker no está disponible', async () => {
    vi.mocked(getPushReminderSettings).mockResolvedValue({ reminder_time: '08:30' })
    render(<ReminderTimeSection />)

    const input = await screen.findByLabelText('Hora de envío *')
    expect(() => fireEvent.click(input)).not.toThrow()
  })
})
