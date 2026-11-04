import { AdminPageHeader } from '@/app/shared/components/navigation/AdminPageHeader'
import { ReminderTimeSection } from './shared/components/specialized/ReminderTimeSection'

export function SettingsAdminPage() {
  return (
    <section className="mx-auto max-w-[76rem]" aria-labelledby="settings-admin-title">
      <AdminPageHeader
        title="Configuración"
        titleId="settings-admin-title"
        description="Ajusta las preferencias de tu espacio de trabajo."
      />
      <ReminderTimeSection />
    </section>
  )
}
