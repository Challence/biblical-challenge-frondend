import { IconBook2, IconPhoto } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/shared/components/ui/card'
import { AdminBreadcrumb } from '@/app/shared/components/navigation/AdminBreadcrumb'

const resourceSections = [
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
]

export function ResourcesHubPage() {
  return <main className="mx-auto max-w-[76rem]">
     <AdminBreadcrumb items={[{ label: 'Inicio', to: '/admin' }]} currentLabel="Recursos" backTo="/admin" />
    <header className="mb-8"><h1 className="m-0 font-[Merriweather,Georgia,serif] text-[clamp(2rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.04em]">Recursos</h1><p className="mt-2 mb-0 text-muted-foreground">Elige el espacio de recursos que quieres administrar.</p></header>
    <div className="grid gap-5 sm:grid-cols-2">
      {resourceSections.map(({ to, title, description, Icon }) => <Link key={to} to={to} className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Card className="h-full transition-colors hover:border-primary">
          <CardHeader><CardTitle className="flex items-center gap-3"><Icon size={24} aria-hidden="true" />{title}</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">{description}</p></CardContent>
        </Card>
      </Link>)}
    </div>
  </main>
}
