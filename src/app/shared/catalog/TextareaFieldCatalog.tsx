import { TextareaField } from '@/app/shared/components/fields/base/TextareaField'

/** Catálogo de desarrollo del TextareaField compartido. */
export function TextareaFieldCatalog() {
  return (
    <main aria-labelledby="textarea-field-catalog-title" className="max-w-2xl space-y-8 p-8">
      <header className="space-y-2">
        <h1 id="textarea-field-catalog-title" className="text-2xl font-semibold">
          TextareaField
        </h1>
        <p>Texto multilínea accesible y reutilizable.</p>
      </header>
      <section aria-label="Estados" className="space-y-6">
        <TextareaField
          id="catalog-normal"
          label="Descripción"
          value="Contenido de ejemplo"
          onChange={() => undefined}
        />
        <TextareaField
          id="catalog-required"
          label="Comentarios"
          value=""
          onChange={() => undefined}
          required
          helperText="Comparte más detalles."
        />
        <TextareaField
          id="catalog-error"
          label="Con error"
          value=""
          onChange={() => undefined}
          error="Este campo es obligatorio"
        />
        <TextareaField
          id="catalog-disabled"
          label="Deshabilitado"
          value="No editable"
          onChange={() => undefined}
          disabled
        />
      </section>
    </main>
  )
}
