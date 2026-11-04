import { ShareButton } from '@/app/shared/components/share/ShareButton'

/** Desarrollo: catálogo visual del botón global de compartir. */
export function ShareButtonCatalog() {
  return (
    <main aria-labelledby="share-button-catalog-title" className="space-y-8 p-8">
      <header className="space-y-2">
        <h1 id="share-button-catalog-title" className="text-2xl font-semibold">
          ShareButton
        </h1>
        <p>Comparte contenido con Web Share API o copia sus datos al portapapeles.</p>
      </header>
      <section aria-labelledby="share-button-example-title" className="space-y-4">
        <h2 id="share-button-example-title" className="text-lg font-medium">
          Estados
        </h2>
        <ShareButton title="Título de ejemplo" text="Texto de ejemplo" url="https://example.test" />
        <ShareButton
          title="Título de administración"
          text="Texto de ejemplo"
          url="https://example.test"
          variant="admin"
          accessibleLabel="Compartir Título de administración"
        />
      </section>
    </main>
  )
}
