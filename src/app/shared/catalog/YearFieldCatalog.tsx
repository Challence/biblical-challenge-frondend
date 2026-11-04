import { useState } from 'react'
import { YearField } from '@/app/shared/components/fields/base/YearField'

/** Catálogo de desarrollo del YearField compartido. */
export function YearFieldCatalog() {
  const [year, setYear] = useState('2026')
  return (
    <main aria-labelledby="year-field-catalog-title" className="max-w-2xl space-y-8 p-8">
      <header className="space-y-2">
        <h1 id="year-field-catalog-title" className="text-2xl font-semibold">
          YearField
        </h1>
        <p>Selector accesible de año con intervalos acotados.</p>
      </header>
      <section aria-label="Estados" className="space-y-6">
        <YearField
          id="year-normal"
          label="Normal"
          value={year}
          onChange={setYear}
          min={2000}
          max={2200}
        />
        <YearField
          id="year-empty"
          label="Vacío"
          value=""
          onChange={() => undefined}
          min={2024}
          max={2031}
          helperText="Selecciona el período."
        />
        <YearField
          id="year-error"
          label="Con error"
          value=""
          onChange={() => undefined}
          min={2024}
          max={2031}
          error="Selecciona un año."
          required
        />
        <YearField
          id="year-disabled"
          label="Deshabilitado"
          value="2026"
          onChange={() => undefined}
          min={2024}
          max={2031}
          disabled
        />
      </section>
    </main>
  )
}
