import { AdminBreadcrumb } from '@/app/shared/components/navigation/AdminBreadcrumb'

/** Catálogo visual del breadcrumb administrativo compartido. */
export function AdminBreadcrumbCatalog() {
  return (
    <main className="space-y-8 p-8" aria-labelledby="admin-breadcrumb-catalog-title">
      <header>
        <h1 id="admin-breadcrumb-catalog-title" className="text-2xl font-semibold">
          AdminBreadcrumb
        </h1>
        <p className="text-muted-foreground">
          Navegación administrativa con retorno, niveles previos y página actual.
        </p>
      </header>
      <section className="space-y-3" aria-labelledby="admin-breadcrumb-example-title">
        <h2 id="admin-breadcrumb-example-title" className="text-lg font-medium">
          Ejemplo
        </h2>
        <AdminBreadcrumb
          items={[
            { label: 'Inicio', to: '/admin' },
            { label: 'Recursos', to: '/admin/recursos' },
          ]}
          currentLabel="Recursos por mes"
          backTo="/admin/recursos"
        />
      </section>
    </main>
  )
}
