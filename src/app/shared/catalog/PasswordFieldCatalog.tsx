import { PasswordField } from '@/app/shared/components/fields/base/PasswordField'

/** Catálogo de desarrollo del PasswordField compartido. */
export function PasswordFieldCatalog() {
  return (
    <main aria-labelledby="password-field-catalog-title" className="max-w-2xl space-y-8 p-8">
      <header className="space-y-2">
        <h1 id="password-field-catalog-title" className="text-2xl font-semibold">
          PasswordField
        </h1>
        <p>Entrada de contraseña controlada con visibilidad alternable.</p>
      </header>
      <section aria-label="Estados" className="space-y-6">
        <PasswordField
          id="catalog-password"
          label="Contraseña"
          value="secreta"
          onChange={() => undefined}
        />
        <PasswordField
          id="catalog-password-required"
          label="Nueva contraseña"
          value=""
          onChange={() => undefined}
          required
          helperText="Usa al menos 8 caracteres."
        />
        <PasswordField
          id="catalog-password-error"
          label="Contraseña con error"
          value="corta"
          onChange={() => undefined}
          error="La contraseña debe tener al menos 8 caracteres."
        />
        <PasswordField
          id="catalog-password-disabled"
          label="Contraseña deshabilitada"
          value="No editable"
          onChange={() => undefined}
          disabled
        />
      </section>
    </main>
  )
}
