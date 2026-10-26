export const SEGMENT_COVER_KEY = 'desafio-biblico:active-segment-cover'
const LEGACY_SEGMENT_COVER_KEY = 'jacobito:active-segment-cover'
export const DEFAULT_SEGMENT_COVER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 420'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1'%3E%3Cstop stop-color='%236b4a2e'/%3E%3Cstop offset='1' stop-color='%23e0b84d'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='420' fill='url(%23g)'/%3E%3C/svg%3E`
export function getActiveSegmentCover() {
  if (typeof window === 'undefined') return DEFAULT_SEGMENT_COVER
  const currentCover = window.localStorage.getItem(SEGMENT_COVER_KEY)
  if (currentCover) return currentCover
  const legacyCover = window.localStorage.getItem(LEGACY_SEGMENT_COVER_KEY)
  if (legacyCover) {
    window.localStorage.setItem(SEGMENT_COVER_KEY, legacyCover)
    return legacyCover
  }
  return DEFAULT_SEGMENT_COVER
}
export function saveActiveSegmentCover(cover: string) { window.localStorage.setItem(SEGMENT_COVER_KEY, cover) }
