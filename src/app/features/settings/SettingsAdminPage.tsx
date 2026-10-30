import { AdminBreadcrumb } from '@/app/shared/components/navigation/AdminBreadcrumb'

export function SettingsAdminPage() {
  return <section className="mx-auto max-w-[76rem]" aria-labelledby="settings-admin-title">
     <AdminBreadcrumb items={[{ label: 'Inicio', to: '/admin' }]} currentLabel="Configuración" backTo="/admin" />
    <header className="mb-8"><h1 id="settings-admin-title" className="m-0 font-[Merriweather,Georgia,serif] text-[clamp(2rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.04em]">Configuración</h1><p className="mt-2 mb-0 text-muted-foreground">Ajusta las preferencias de tu espacio de trabajo.</p></header>
    <p className="rounded-md border border-secondary/30 bg-secondary/10 p-4 text-sm text-muted-foreground">Este espacio estará disponible próximamente.</p>
  </section>
}
