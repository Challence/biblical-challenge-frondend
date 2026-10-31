import { TextField } from '@/app/shared/components/fields/base/TextField'

/** Catálogo de desarrollo del TextField compartido. */
export function TextFieldCatalog() {
  return (
    <main aria-labelledby="text-field-catalog-title" className="max-w-2xl space-y-8 p-8">
      <header className="space-y-2">
        <h1 id="text-field-catalog-title" className="text-2xl font-semibold">
          TextField
        </h1>
        <p>Entrada de texto accesible y reutilizable.</p>
      </header>
      <section aria-label="Estados" className="space-y-6">
        <TextField id="catalog-normal" label="Nombre" value="María" onChange={() => undefined} />
        <TextField
          id="catalog-required"
          label="Correo"
          value=""
          onChange={() => undefined}
          required
          helperText="Usa tu correo de trabajo."
        />
        <TextField
          id="catalog-error"
          label="Con error"
          value="invalido"
          onChange={() => undefined}
          error="Introduce un correo válido"
        />
        <TextField
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
