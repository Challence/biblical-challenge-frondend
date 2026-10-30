import { IconBell, IconSettings } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/shared/components/ui/button'
import { Card } from '@/app/shared/components/ui/card'

export function SettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Preferencias
        </p>
        <h1 className="mt-1 font-[Merriweather,Georgia,serif] text-3xl font-bold tracking-[-0.03em]">
          Configuración
        </h1>
        <p className="mt-2 text-muted-foreground">Personaliza tu experiencia de lectura.</p>
      </header>

      <section aria-labelledby="notifications-title">
        <h2
          id="notifications-title"
          className="mb-3 font-[Merriweather,Georgia,serif] text-xl font-bold"
        >
          Notificaciones
        </h2>
        <Card className="flex items-center justify-between gap-4 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <IconBell className="mt-0.5 shrink-0 text-primary" size={22} aria-hidden="true" />
            <div>
              <h3 className="font-semibold">Recordatorios de lectura</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Recibe un recordatorio para mantener tu ritmo diario.
              </p>
            </div>
          </div>
          <span
            className="relative h-7 w-12 shrink-0 rounded-full bg-primary"
            role="img"
            aria-label="Recordatorios de lectura activados"
          >
            <span className="absolute top-1 translate-x-6 h-5 w-5 rounded-full bg-white shadow" />
          </span>
        </Card>
      </section>

      <section aria-labelledby="admin-title">
        <h2 id="admin-title" className="mb-3 font-[Merriweather,Georgia,serif] text-xl font-bold">
          Administración
        </h2>
        <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <IconSettings className="mt-0.5 shrink-0 text-primary" size={22} aria-hidden="true" />
            <div>
              <h3 className="font-semibold">Accede a tu cuenta</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Inicia sesión para administrar tus preferencias.
              </p>
            </div>
          </div>
          <Button type="button" onClick={() => navigate('/admin')} className="w-full sm:w-auto">
            Iniciar sesión
          </Button>
        </Card>
      </section>
    </div>
  )
}
