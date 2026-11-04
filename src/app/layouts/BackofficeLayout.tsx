import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useMatches, useNavigate } from 'react-router-dom'
import {
  IconBell,
  IconChevronDown,
  IconInfoCircle,
  IconLayoutDashboard,
  IconLogout,
  IconMenu2,
  IconSettings,
  IconTags,
  IconX,
  IconSpeakerphone,
  IconPhoto,
} from '@tabler/icons-react'
import logo from '@/assets/desafio-biblico-logo.webp'
import { tv } from '@/app/shared/lib/tv'
import {
  AdminBreadcrumb,
  type AdminBreadcrumbItem,
} from '@/app/shared/components/navigation/AdminBreadcrumb'
import { AnalyticsTracker } from '@/app/shared/analytics/AnalyticsTracker'
import { supabase } from '@/app/shared/lib/supabase'

declare const __APP_VERSION__: string

const layoutStyles = tv({
  slots: {
    shell:
      'h-[100dvh] min-h-0 grid grid-cols-[16.5rem_minmax(0,1fr)] overflow-hidden bg-[#fffaf0] max-[48rem]:grid-cols-[minmax(0,1fr)]',
    overlay: 'hidden max-[48rem]:block fixed z-[2] inset-0 border-0 bg-[rgb(0_0_0_/_42%)]',
    sidebar:
      'min-h-0 flex flex-col w-[16.5rem] py-8 px-4 bg-[#35251e] text-[#f8e7bd] max-[48rem]:fixed max-[48rem]:z-[3] max-[48rem]:inset-[0_auto_0_0] max-[48rem]:w-[min(16.5rem,84vw)] max-[48rem]:-translate-x-full max-[48rem]:transition-transform max-[48rem]:duration-[180ms] max-[48rem]:ease-linear',
    sidebarOpen: 'max-[48rem]:translate-x-0',
    brand: 'flex w-full items-center justify-center min-h-12 mb-10 text-[#fff8e9] no-underline',
    brandLogo: 'block w-full max-w-56 max-h-[4.5rem] h-auto object-contain object-center',
    nav: 'grid gap-2 min-h-0 overflow-y-auto overscroll-contain',
    sidebarVersion: 'mt-auto min-w-0 pt-8 text-center text-xs text-white break-words',
    navLink:
      'flex items-center gap-3 min-h-11 px-3 py-2.5 border-l-[3px] border-l-transparent rounded-lg text-[#e8d5aa] no-underline hover:text-[#fff8e9] hover:bg-[#49352a] aria-[current=page]:border-l-[#d4a84f] aria-[current=page]:text-[#fff8e9] aria-[current=page]:bg-[#49352a]',
    main: 'min-w-0 min-h-0 grid grid-rows-[auto_minmax(0,1fr)_auto]',
    topbar:
      'flex items-center justify-between min-h-[4.5rem] px-[clamp(1rem,3vw,2.5rem)] py-3 border-b border-[#e5d7bd] bg-[#fffaf0] max-[32rem]:min-h-16',
    topActions: 'ml-auto flex items-center gap-3',
    iconButton:
      'grid place-items-center w-11 h-11 border-0 rounded-full text-[var(--foreground)] bg-transparent cursor-pointer hover:bg-[var(--muted)]',
    mobileMenu: 'hidden max-[48rem]:grid',
    profile: 'relative',
    profileButton:
      'flex min-h-11 items-center gap-2 border-0 bg-transparent px-1 text-right cursor-pointer',
    profileText:
      'grid gap-0.5 [&>strong]:text-[.9rem] [&>span]:text-[.75rem] [&>span]:text-[var(--muted-foreground)] max-[32rem]:hidden',
    avatar:
      'grid place-items-center w-9 h-9 rounded-full text-[#35251e] bg-[#d4a84f] font-extrabold',
    profileMenu:
      'absolute right-0 top-full z-10 mt-2 min-w-44 rounded-md border border-border bg-card p-1 shadow-lg',
    logout:
      'flex min-h-11 w-full items-center gap-2 rounded-sm px-3 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    content:
      'min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-[clamp(1.25rem,4vw,2rem)]',
    bottomBar:
      'flex items-center justify-between min-h-11 px-[clamp(1rem,3vw,2.5rem)] py-2 border-t border-[#e5d7bd] text-[#806b51] bg-[#fffaf0] text-xs',
    bottomBarInfo: 'inline-flex items-center gap-2',
    bottomBarStatus: 'text-[#6b4a2e]',
  },
})

const adminLinks = [
  { to: '/admin', label: 'Dashboard', Icon: IconLayoutDashboard, end: true },
  { to: '/admin/segmentos', label: 'Segmentos', Icon: IconTags },
  { to: '/admin/anuncios', label: 'Anuncios', Icon: IconSpeakerphone },
  { to: '/admin/recursos', label: 'Recursos', Icon: IconPhoto },
  { to: '/admin/configuracion', label: 'Configuración', Icon: IconSettings },
]

export type AdminRouteHandle = {
  breadcrumb?: {
    items: AdminBreadcrumbItem[]
    currentLabel: string
    backTo: string
  }
  segmentTitle?: string
}

export function BackofficeLayout() {
  const styles = layoutStyles()
  const navigate = useNavigate()
  const matches = useMatches()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const close = () => {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }
  const toggle = () => setOpen((value) => !value)
  useEffect(() => {
    if (open) requestAnimationFrame(() => firstLinkRef.current?.focus())
  }, [open])
  useEffect(() => {
    if (!supabase) return

    let active = true
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUserEmail(session?.user.email ?? null)
    })

    void supabase.auth
      .getSession()
      .then(({ data: sessionData }) => {
        if (active) setUserEmail(sessionData.session?.user.email ?? null)
      })
      .catch(() => {
        if (active) setUserEmail(null)
      })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') close()
  }
  const breadcrumbMatch = [...matches]
    .reverse()
    .find((match) => (match.handle as AdminRouteHandle | undefined)?.breadcrumb)
  const breadcrumb = (breadcrumbMatch?.handle as AdminRouteHandle | undefined)?.breadcrumb
  return (
    <>
      <AnalyticsTracker />
      <div className={styles.shell()} onKeyDown={onKeyDown}>
        {open && <button className={styles.overlay()} aria-label="Cerrar menú" onClick={close} />}
        <aside
          className={`${styles.sidebar()} ${open ? styles.sidebarOpen() : ''}`}
          aria-label="Navegación principal"
        >
          <NavLink
            className={styles.brand()}
            to="/admin"
            onClick={close}
            aria-label="Desafío Bíblico, ir al inicio"
          >
            <img className={styles.brandLogo()} src={logo} alt="Desafío Bíblico" />
          </NavLink>
          <nav className={styles.nav()}>
            {adminLinks.map(({ to, label, Icon, end }, index) => (
              <NavLink
                ref={index === 0 ? firstLinkRef : undefined}
                key={to}
                to={to}
                end={end}
                className={styles.navLink()}
                onClick={close}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className={styles.sidebarVersion()}>Versión {__APP_VERSION__}</div>
        </aside>
        <div className={styles.main()}>
          <header className={styles.topbar()}>
            <button
              ref={triggerRef}
              className={`${styles.iconButton()} ${styles.mobileMenu()}`}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              onClick={toggle}
            >
              {open ? <IconX aria-hidden="true" /> : <IconMenu2 aria-hidden="true" />}
            </button>
            <div className={styles.topActions()}>
              <button className={styles.iconButton()} aria-label="Notificaciones">
                <IconBell aria-hidden="true" />
              </button>
              <div className={styles.profile()}>
                <button
                  className={styles.profileButton()}
                  aria-label="Abrir menú de perfil"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  onClick={() => setProfileOpen((value) => !value)}
                >
                  <span className={styles.profileText()}>
                    <strong>María López</strong>
                    <span>Administradora</span>
                    {userEmail && <span>{userEmail}</span>}
                  </span>
                  <span className={styles.avatar()} aria-hidden="true">
                    ML
                  </span>
                  <IconChevronDown size={16} aria-hidden="true" />
                </button>
                {profileOpen && (
                  <div className={styles.profileMenu()} role="menu">
                    <button
                      className={styles.logout()}
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false)
                        navigate('/')
                      }}
                    >
                      <IconLogout size={18} aria-hidden="true" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className={styles.content()}>
            {breadcrumb && (
              <AdminBreadcrumb
                items={breadcrumb.items}
                currentLabel={breadcrumb.currentLabel}
                backTo={breadcrumb.backTo}
              />
            )}
            <Outlet />
          </main>
          <footer className={styles.bottomBar()}>
            <span className={styles.bottomBarInfo()}>
              <IconInfoCircle size={16} aria-hidden="true" />
              <span> · Back Office</span>
            </span>
            <span className={styles.bottomBarStatus()}>Sesión activa</span>
          </footer>
        </div>
      </div>
    </>
  )
}
