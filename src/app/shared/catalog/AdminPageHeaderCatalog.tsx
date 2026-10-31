import { Button } from '@/app/shared/components/button/button'
import { AdminPageHeader } from '@/app/shared/components/navigation/AdminPageHeader'

/** Catálogo visual del encabezado administrativo compartido. */
export function AdminPageHeaderCatalog() {
  return (
    <main className="space-y-8 p-8" aria-labelledby="admin-page-header-catalog-title">
      <header>
        <h1 id="admin-page-header-catalog-title" className="text-2xl font-semibold">
          AdminPageHeader
        </h1>
        <p className="text-muted-foreground">
          Encabezado responsive con descripción y acción compuesta.
        </p>
      </header>
      <section className="space-y-4" aria-labelledby="admin-page-header-example-title">
        <h2 id="admin-page-header-example-title" className="text-lg font-medium">
          Con descripción y acción
        </h2>
        <AdminPageHeader
          title="Recursos"
          titleId="catalog-resources-title"
          description="Administra el contenido disponible para la comunidad."
          action={<Button>Nuevo recurso</Button>}
        />
      </section>
      <section className="space-y-4" aria-labelledby="admin-page-header-minimal-title">
        <h2 id="admin-page-header-minimal-title" className="text-lg font-medium">
          Solo título
        </h2>
        <AdminPageHeader title="Configuración" titleId="catalog-settings-title" />
      </section>
    </main>
  )
}
