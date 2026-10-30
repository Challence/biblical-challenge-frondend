export const READING_PROGRESS_KEY = 'desafio-biblico:reading-progress'

type ProgressByGuide = Record<string, number[]>

const readProgress = (): ProgressByGuide => {
  if (typeof window === 'undefined') return {}
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(READING_PROGRESS_KEY) ?? '{}')
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(
      Object.entries(value).map(([guide, days]) => [
        guide,
        Array.isArray(days)
          ? days.filter((day): day is number => Number.isInteger(day) && day > 0)
          : [],
      ]),
    )
  } catch {
    return {}
  }
}

export const getCompletedDays = (guide: string, mockProgress = 0): number[] => {
  const stored = readProgress()
  return stored[guide] ?? Array.from({ length: mockProgress }, (_, index) => index + 1)
}

export const saveCompletedDay = (guide: string, day: number) => {
  if (typeof window === 'undefined' || !Number.isInteger(day) || day < 1) return
  const progress = readProgress()
  const days = new Set(progress[guide] ?? [])
  days.add(day)
  progress[guide] = [...days].sort((a, b) => a - b)
  window.localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(progress))
}
