import { useState } from 'react'
import { Switch } from '@/app/shared/components/ui/switch'

/** Desarrollo: catálogo visual del Switch compartido. */
export function SwitchCatalog() {
  const [checked, setChecked] = useState(false)

  return (
    <main className="space-y-8 p-8" aria-labelledby="switch-catalog-title">
      <header className="space-y-2">
        <h1 id="switch-catalog-title" className="text-2xl font-semibold">
          Switch
        </h1>
        <p>Control binario accesible con estado controlado y foco visible.</p>
      </header>
      <section className="space-y-4" aria-labelledby="switch-states-title">
        <h2 id="switch-states-title" className="text-lg font-medium">
          Estados
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2">
            <Switch aria-label="Recordatorios" checked={checked} onCheckedChange={setChecked} />
            <span>{checked ? 'Activado' : 'Desactivado'}</span>
          </label>
          <label className="flex items-center gap-2">
            <Switch aria-label="Deshabilitado" disabled />
            <span>Deshabilitado</span>
          </label>
        </div>
      </section>
    </main>
  )
}
