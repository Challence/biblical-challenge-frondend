export type ResourceType = 'image' | 'video'

export type Resource = {
  id: string
  title: string
  description: string
  type: ResourceType
  source: string
}

export type Month = {
  id: string
  title: string
  description: string
  resources: Resource[]
}

export const initialMonths: Month[] = [
  { id: 'march-2026', title: 'Marzo 2026', description: 'Encuentros y materiales para compartir durante el mes.', resources: [
    { id: 'r-1', title: 'Encuentro de marzo', description: 'Imágenes del encuentro comunitario.', type: 'image', source: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&q=80' },
    { id: 'r-2', title: 'Reflexión semanal', description: 'Una reflexión para acompañar la semana.', type: 'video', source: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  ] },
  { id: 'february-2026', title: 'Febrero 2026', description: 'Recursos de la comunidad en acción.', resources: [
    { id: 'r-3', title: 'Comunidad en acción', description: 'Momentos compartidos por la comunidad.', type: 'image', source: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80' },
  ] },
]

export const makeId = () => globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
