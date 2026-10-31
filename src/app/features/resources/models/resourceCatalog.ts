import { IconBook2, IconPhoto } from '@tabler/icons-react'

export const READING_GUIDE_MONTHS = [
  { id: 'january', title: 'Enero' },
  { id: 'february', title: 'Febrero' },
  { id: 'march', title: 'Marzo' },
  { id: 'april', title: 'Abril' },
  { id: 'may', title: 'Mayo' },
  { id: 'june', title: 'Junio' },
  { id: 'july', title: 'Julio' },
  { id: 'august', title: 'Agosto' },
  { id: 'september', title: 'Septiembre' },
  { id: 'october', title: 'Octubre' },
  { id: 'november', title: 'Noviembre' },
  { id: 'december', title: 'Diciembre' },
] as const

export const RESOURCE_SECTIONS = [
  {
    to: '/admin/recursos/por-mes',
    title: 'Recursos por mes',
    description: 'Organiza los recursos de cada mes antes de publicarlos.',
    Icon: IconPhoto,
  },
  {
    to: '/admin/recursos/guia-lectura',
    title: 'Guía de lectura',
    description: 'Consulta y prepara la guía que acompaña el plan de lectura.',
    Icon: IconBook2,
  },
] as const
