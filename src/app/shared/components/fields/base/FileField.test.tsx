import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FileField } from './FileField'

describe('FileField', () => {
  it('selects a file by input and displays its name', () => {
    const onFileChange = vi.fn()
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    render(<FileField id="document" label="Documento" accept=".txt" onFileChange={onFileChange} />)
    fireEvent.change(screen.getByLabelText('Documento'), { target: { files: [file] } })
    expect(onFileChange).toHaveBeenCalledWith(file)
    expect(screen.getByText('notes.txt')).toBeInTheDocument()
  })

  it('accepts a dropped file and rejects an invalid file', () => {
    const onFileChange = vi.fn()
    const valid = new File(['image'], 'photo.png', { type: 'image/png' })
    const invalid = new File(['text'], 'notes.txt', { type: 'text/plain' })
    render(<FileField id="photo" label="Foto" accept="image/*" onFileChange={onFileChange} />)
    const dropzone = screen.getByRole('button')
    fireEvent.drop(dropzone, { dataTransfer: { files: [valid] } })
    fireEvent.drop(dropzone, { dataTransfer: { files: [invalid] } })
    expect(onFileChange).toHaveBeenCalledTimes(1)
    expect(screen.getByText('photo.png')).toBeInTheDocument()
  })

  it('does not open or change when disabled', () => {
    const onFileChange = vi.fn()
    const file = new File(['x'], 'file.txt', { type: 'text/plain' })
    render(<FileField id="disabled-file" label="Archivo" disabled onFileChange={onFileChange} />)
    const input = screen.getByLabelText('Archivo')
    fireEvent.change(input, { target: { files: [file] } })
    expect(input).toBeDisabled()
    expect(onFileChange).not.toHaveBeenCalled()
  })
})
