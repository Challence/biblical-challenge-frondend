type ReadingGuideErrorContext = 'load' | 'save' | 'delete'

const fallbackMessages: Record<ReadingGuideErrorContext, string> = {
  load: 'No se pudieron cargar las guías. Inténtalo de nuevo.',
  save: 'No se pudo guardar la guía. Inténtalo de nuevo.',
  delete: 'No se pudo eliminar la guía. Inténtalo de nuevo.',
}

const errorCode = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code ?? '')
    : ''

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : '')

export function getReadingGuideErrorMessage(error: unknown, context: ReadingGuideErrorContext) {
  const code = errorCode(error)
  const message = errorMessage(error)

  if (code === '23505') return 'Ya existe una guía para el período seleccionado.'
  if (code === '22007' || message.startsWith('El período'))
    return 'El período seleccionado no es válido.'
  if (/iniciar sesi[oó]n/i.test(message))
    return 'Tu sesión no está disponible. Inicia sesión nuevamente.'

  return fallbackMessages[context]
}
