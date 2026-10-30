import { FileField } from '@/app/shared/components/fields/base/FileField'

/** Catálogo de desarrollo del FileField compartido. */
export function FileFieldCatalog() {
  return (
    <main aria-labelledby="file-field-catalog-title" className="max-w-2xl space-y-8 p-8">
      <header className="space-y-2"><h1 id="file-field-catalog-title" className="text-2xl font-semibold">FileField</h1><p>Subida por clic, teclado y arrastrar y soltar.</p></header>
      <section aria-label="Estados" className="space-y-6">
        <FileField id="catalog-normal" label="Archivo normal" accept="image/*" helperText="PNG o JPG hasta 10 MB" onFileChange={() => undefined} />
        <FileField id="catalog-drag" label="Estado de arrastre" onFileChange={() => undefined} />
        <FileField id="catalog-error" label="Con error" error="Selecciona un archivo válido" onFileChange={() => undefined} />
        <FileField id="catalog-disabled" label="Deshabilitado" disabled onFileChange={() => undefined} />
      </section>
    </main>
  )
}
