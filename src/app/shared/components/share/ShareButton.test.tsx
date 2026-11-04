import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ShareButton } from './ShareButton'

const track = vi.fn()
vi.mock('@/app/shared/analytics/useAnalytics', () => ({ useAnalytics: () => ({ track }) }))

describe('ShareButton', () => {
  beforeEach(() => {
    track.mockReset()
    Object.assign(navigator, { share: undefined, clipboard: { writeText: vi.fn() } })
  })

  it('uses native sharing and tracks only after success', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { share })
    render(
      <ShareButton
        title="Título"
        text="Texto"
        url="https://example.test"
        entityType="segment"
        entityId="1"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }))
    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        title: 'Título',
        text: 'Texto',
        url: 'https://example.test',
      }),
    )
    expect(track).toHaveBeenCalledWith({
      type: 'content_shared',
      entityType: 'segment',
      entityId: '1',
      method: 'native',
    })
  })

  it('falls back to clipboard when native sharing is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<ShareButton title="Título" text="Texto" url="https://example.test" />)
    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }))
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('Título\nTexto\nhttps://example.test'),
    )
    expect(track).not.toHaveBeenCalled()
  })

  it('renders the admin variant with a contextual accessible name', () => {
    render(
      <ShareButton
        title="Título"
        text="Texto"
        url="https://example.test"
        variant="admin"
        accessibleLabel="Compartir Título"
      />,
    )

    const button = screen.getByRole('button', { name: 'Compartir Título' })
    expect(button).toHaveClass('size-10', 'rounded-md')
    expect(button).not.toHaveClass('bg-yellow-400')
    const icon = button.querySelector('svg')
    expect(icon).toHaveClass('text-muted-foreground')
    expect(icon).toHaveAttribute('width', '16')
    expect(icon).toHaveAttribute('height', '16')
  })

  it('combines the external disabled state with its sharing state', () => {
    render(<ShareButton title="Título" text="Texto" url="https://example.test" disabled />)

    expect(screen.getByRole('button', { name: 'Compartir' })).toBeDisabled()
  })
})
