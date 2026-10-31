import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '@/app/shared/lib/supabase'

export function AuthGate({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [ready, setReady] = useState(!supabase)
  const [signedIn, setSignedIn] = useState(false)
  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session))
      setReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      setSignedIn(Boolean(session)),
    )
    return () => data.subscription.unsubscribe()
  }, [])
  if (location.pathname === '/configuracion') return children
  if (!ready) return <main className="p-8">Comprobando sesión…</main>
  if (!signedIn) return <Navigate to="/configuracion" state={{ from: location.pathname }} replace />
  return children
}
