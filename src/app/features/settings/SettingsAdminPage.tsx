import { AdminPageHeader } from '@/app/shared/components/navigation/AdminPageHeader'

export function SettingsAdminPage() {
  return (
    <section className="mx-auto max-w-[76rem]" aria-labelledby="settings-admin-title">
      <AdminPageHeader
        title="Configuración"
        titleId="settings-admin-title"
        description="Ajusta las preferencias de tu espacio de trabajo."
      />
      <p className="rounded-md border border-secondary/30 bg-secondary/10 p-4 text-sm text-muted-foreground">
        Este espacio estará disponible próximamente.
      </p>
    </section>
  )
}
