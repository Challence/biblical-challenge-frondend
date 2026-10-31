import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/shared/components/ui/card'
import { AdminPageHeader } from '@/app/shared/components/navigation/AdminPageHeader'
import { RESOURCE_SECTIONS } from './models/resourceCatalog'

export function ResourcesHubPage() {
  return (
    <main className="mx-auto max-w-[76rem]">
      <AdminPageHeader
        title="Recursos"
        titleId="resources-title"
        description="Elige el espacio de recursos que quieres administrar."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {RESOURCE_SECTIONS.map(({ to, title, description, Icon }) => (
          <Link
            key={to}
            to={to}
            className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Icon size={24} aria-hidden="true" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
