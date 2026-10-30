import { SelectField } from '@/app/shared/components/fields/base/SelectField'

const options = [{ value: 'first', label: 'Primera opción' }, { value: 'second', label: 'Segunda opción' }]

/** Catálogo de desarrollo del SelectField compartido. */
export function SelectFieldCatalog() {
  return (
    <main aria-labelledby="select-field-catalog-title" className="max-w-2xl space-y-8 p-8">
      <header className="space-y-2"><h1 id="select-field-catalog-title" className="text-2xl font-semibold">SelectField</h1><p>Selección nativa accesible y reutilizable.</p></header>
      <section aria-label="Estados" className="space-y-6">
        <SelectField id="catalog-normal" label="Normal" options={options} value="first" onChange={() => undefined} />
        <SelectField id="catalog-error" label="Con error" options={options} value="" onChange={() => undefined} error="Selecciona una opción" />
        <SelectField id="catalog-disabled" label="Deshabilitado" options={options} value="first" onChange={() => undefined} disabled />
        <SelectField id="catalog-placeholder" label="Con placeholder" options={options} value="" onChange={() => undefined} placeholder="Elige una opción" helperText="Este campo es opcional." />
      </section>
    </main>
  )
}
