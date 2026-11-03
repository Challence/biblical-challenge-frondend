import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/shared/components/ui/button'
import { Input } from '@/app/shared/components/ui/input'
import { Label } from '@/app/shared/components/ui/label'
import { PasswordField } from '@/app/shared/components/fields/base/PasswordField'
import { supabase } from '@/app/shared/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'

type LoginDialogProps = { open: boolean; onOpenChange: (open: boolean) => void }

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const signIn = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) {
      setError('Configura Supabase para iniciar sesión.')
      return
    }
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (result.error) setError('Correo o contraseña incorrectos.')
    else navigate('/admin')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-labelledby="settings-login-title">
        <DialogHeader>
          <DialogTitle id="settings-login-title">Iniciar sesión</DialogTitle>
          <DialogDescription>Accede para administrar el contenido.</DialogDescription>
        </DialogHeader>
        <form onSubmit={signIn} className="space-y-4" aria-label="Formulario de inicio de sesión">
          <div className="space-y-2">
            <Label htmlFor="settings-email">Correo</Label>
            <Input
              id="settings-email"
              data-autofocus
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <PasswordField
            id="settings-password"
            label="Contraseña"
            value={password}
            onChange={setPassword}
            required
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Continuar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
