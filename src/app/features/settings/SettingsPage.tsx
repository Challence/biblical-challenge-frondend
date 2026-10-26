import { useState, type FormEvent } from 'react'
import { IconBell, IconEye, IconEyeOff, IconLock, IconSettings } from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'
import { Card } from '@/app/shared/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/shared/components/ui/dialog'
import { Input } from '@/app/shared/components/ui/input'
import { Label } from '@/app/shared/components/ui/label'

export function SettingsPage() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const emailError = submitted && (!email ? 'Ingresa tu correo electrónico.' : !/^\S+@\S+\.\S+$/.test(email) ? 'Ingresa un correo electrónico válido.' : '')
  const passwordError = submitted && !password ? 'Ingresa tu contraseña.' : ''

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (email && /^\S+@\S+\.\S+$/.test(email) && password) setLoginOpen(false)
  }

  return <div className="mx-auto w-full max-w-3xl space-y-6">
    <header>
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Preferencias</p>
      <h1 className="mt-1 font-[Merriweather,Georgia,serif] text-3xl font-bold tracking-[-0.03em]">Configuración</h1>
      <p className="mt-2 text-muted-foreground">Personaliza tu experiencia de lectura.</p>
    </header>

    <section aria-labelledby="notifications-title">
      <h2 id="notifications-title" className="mb-3 font-[Merriweather,Georgia,serif] text-xl font-bold">Notificaciones</h2>
       <Card className="flex items-center justify-between gap-4 p-4 sm:p-5">
         <div className="flex items-start gap-3"><IconBell className="mt-0.5 shrink-0 text-primary" size={22} aria-hidden="true" /><div><h3 className="font-semibold">Recordatorios de lectura</h3><p className="mt-1 text-sm text-muted-foreground">Recibe un recordatorio para mantener tu ritmo diario.</p></div></div>
         <span className="relative h-7 w-12 shrink-0 rounded-full bg-primary" role="img" aria-label="Recordatorios de lectura activados"><span className="absolute top-1 translate-x-6 h-5 w-5 rounded-full bg-white shadow" /></span>
      </Card>
    </section>

    <section aria-labelledby="admin-title">
      <h2 id="admin-title" className="mb-3 font-[Merriweather,Georgia,serif] text-xl font-bold">Administración</h2>
      <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="flex items-start gap-3"><IconSettings className="mt-0.5 shrink-0 text-primary" size={22} aria-hidden="true" /><div><h3 className="font-semibold">Accede a tu cuenta</h3><p className="mt-1 text-sm text-muted-foreground">Inicia sesión para administrar tus preferencias.</p></div></div><Button type="button" onClick={() => { setLoginOpen(true); setSubmitted(false) }} className="w-full sm:w-auto">Iniciar sesión</Button></Card>
    </section>

    <Dialog open={loginOpen} onOpenChange={setLoginOpen}><DialogContent className="rounded-t-[var(--shape-20)] sm:rounded-[var(--shape-20)]" aria-labelledby="settings-login-title" aria-describedby="settings-login-description"><DialogHeader><DialogTitle id="settings-login-title">Iniciar sesión</DialogTitle><DialogDescription id="settings-login-description">Ingresa tus datos para continuar.</DialogDescription></DialogHeader><form onSubmit={submit} noValidate className="space-y-4"><div className="space-y-1.5"><Label htmlFor="settings-email">Correo electrónico</Label><Input data-autofocus id="settings-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(emailError)} aria-describedby={emailError ? 'settings-email-error' : undefined} />{emailError && <p id="settings-email-error" className="text-sm text-destructive">{emailError}</p>}</div><div className="space-y-1.5"><Label htmlFor="settings-password">Contraseña</Label><div className="relative"><Input id="settings-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="pr-12" aria-invalid={Boolean(passwordError)} aria-describedby={passwordError ? 'settings-password-error' : undefined} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-0 h-10 w-10 rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <IconEyeOff size={18} aria-hidden="true" /> : <IconEye size={18} aria-hidden="true" />}</button></div>{passwordError && <p id="settings-password-error" className="text-sm text-destructive">{passwordError}</p>}</div><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => setLoginOpen(false)}>Cancelar</Button><Button type="submit"><IconLock size={16} aria-hidden="true" />Continuar</Button></div></form></DialogContent></Dialog>
  </div>
}
