import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'
import { Button } from '@/app/shared/components/button/button'
import { usePwaInstall } from '@/app/shared/hooks/usePwaInstall'

export function PwaInstallPrompt() {
  const { canInstall, isIos, install, dismiss } = usePwaInstall()

  return (
    <Dialog open={canInstall} onOpenChange={(open) => !open && dismiss()}>
      <DialogContent
        aria-labelledby="pwa-install-title"
        aria-describedby="pwa-install-description"
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle id="pwa-install-title">Instala Desafío Bíblico</DialogTitle>
          <DialogDescription id="pwa-install-description">
            {isIos
              ? 'Para tener la aplicación siempre a mano, toca Compartir y luego Añadir a pantalla de inicio.'
              : 'Añade la aplicación a tu dispositivo para leer y reflexionar sin buscarla cada vez.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={dismiss}>
            Ahora no
          </Button>
          {!isIos && (
            <Button type="button" onClick={install}>
              Instalar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
