import { NotificationsSection } from './shared/components/specialized/NotificationsSection'
import { AdminAccessSection } from './shared/components/specialized/AdminAccessSection'

export function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Preferencias
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-[-0.03em]">Configuración</h1>
      </header>
      <NotificationsSection />
      <AdminAccessSection />
    </div>
  )
}
