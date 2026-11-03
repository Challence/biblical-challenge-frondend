import { useState } from 'react'
import { IconSettings } from '@tabler/icons-react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/app/shared/components/ui/button'
import { Card } from '@/app/shared/components/ui/card'
import { LoginDialog } from './LoginDialog'

export function AdminAccessSection() {
  const location = useLocation()
  const [open, setOpen] = useState(Boolean((location.state as { from?: string } | null)?.from))

  return (
    <section aria-labelledby="admin-title">
      <h2 id="admin-title" className="mb-3 font-heading text-xl font-bold">
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
        <Button type="button" onClick={() => setOpen(true)} className="w-full sm:w-auto">
          Iniciar sesión
        </Button>
      </Card>
      <LoginDialog open={open} onOpenChange={setOpen} />
    </section>
  )
}
