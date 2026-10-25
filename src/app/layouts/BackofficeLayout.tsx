import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { IconBell, IconChartBar, IconInfoCircle, IconLayoutDashboard, IconMenu2, IconSettings, IconTags, IconUsers, IconX } from '@tabler/icons-react'
import logo from '@/assets/desafio-biblico-logo.webp'
import { tv } from '@/app/shared/lib/tv'

const layoutStyles = tv({
  slots: {
    shell: 'h-[100dvh] min-h-0 grid grid-cols-[16.5rem_minmax(0,1fr)] overflow-hidden bg-[#fffaf0] max-[48rem]:grid-cols-[minmax(0,1fr)]',
    overlay: 'hidden max-[48rem]:block fixed z-[2] inset-0 border-0 bg-[rgb(0_0_0_/_42%)]',
    sidebar: 'min-h-0 flex flex-col w-[16.5rem] py-8 px-4 bg-[#35251e] text-[#f8e7bd] max-[48rem]:fixed max-[48rem]:z-[3] max-[48rem]:inset-[0_auto_0_0] max-[48rem]:w-[min(16.5rem,84vw)] max-[48rem]:-translate-x-full max-[48rem]:transition-transform max-[48rem]:duration-[180ms] max-[48rem]:ease-linear',
    sidebarOpen: 'max-[48rem]:translate-x-0',
    brand: 'flex w-full items-center justify-center min-h-12 mb-10 text-[#fff8e9] no-underline',
    brandLogo: 'block w-full max-w-56 max-h-[4.5rem] h-auto object-contain object-center',
    nav: 'grid gap-2 min-h-0 overflow-y-auto overscroll-contain',
    navLink: 'flex items-center gap-3 min-h-11 px-3 py-2.5 border-l-[3px] border-l-transparent rounded-lg text-[#e8d5aa] no-underline hover:text-[#fff8e9] hover:bg-[#49352a] aria-[current=page]:border-l-[#d4a84f] aria-[current=page]:text-[#fff8e9] aria-[current=page]:bg-[#49352a]',
    main: 'min-w-0 min-h-0 grid grid-rows-[auto_minmax(0,1fr)_auto]',
    topbar: 'flex items-center justify-between min-h-[4.5rem] px-[clamp(1rem,3vw,2.5rem)] py-3 border-b border-[#e5d7bd] bg-[#fffaf0] max-[32rem]:min-h-16',
    topActions: 'ml-auto flex items-center gap-3',
    iconButton: 'grid place-items-center w-11 h-11 border-0 rounded-full text-[var(--foreground)] bg-transparent cursor-pointer hover:bg-[var(--muted)]',
    mobileMenu: 'hidden max-[48rem]:grid',
    profile: 'grid gap-0.5 text-right [&>strong]:text-[.9rem] [&>span]:text-[.75rem] [&>span]:text-[var(--muted-foreground)] max-[32rem]:hidden',
    avatar: 'grid place-items-center w-9 h-9 rounded-full text-[#35251e] bg-[#d4a84f] font-extrabold',
    content: 'min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-[clamp(1.25rem,4vw,2rem)]',
    bottomBar: 'flex items-center justify-between min-h-11 px-[clamp(1rem,3vw,2.5rem)] py-2 border-t border-[#e5d7bd] text-[#806b51] bg-[#fffaf0] text-xs',
    bottomBarInfo: 'inline-flex items-center gap-2',
    bottomBarStatus: 'text-[#6b4a2e]',
  },
})

const links = [
  { to: '/', label: 'Dashboard', Icon: IconLayoutDashboard, end: true },
  { to: '/segmentos', label: 'Segmentos', Icon: IconTags },
  { to: '/usuarios', label: 'Usuarios', Icon: IconUsers },
  { to: '/reportes', label: 'Reportes', Icon: IconChartBar },
  { to: '/configuracion', label: 'Configuración', Icon: IconSettings },
]

export function BackofficeLayout() {
  const styles = layoutStyles()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const close = () => { setOpen(false); requestAnimationFrame(() => triggerRef.current?.focus()) }
  const toggle = () => setOpen((value) => !value)
  useEffect(() => {
    if (open) requestAnimationFrame(() => firstLinkRef.current?.focus())
  }, [open])
  const onKeyDown = (event: React.KeyboardEvent) => { if (event.key === 'Escape') close() }
    return <div className={styles.shell()} onKeyDown={onKeyDown}>
       {open && <button className={styles.overlay()} aria-label="Cerrar menú" onClick={close} />}
       <aside className={`${styles.sidebar()} ${open ? styles.sidebarOpen() : ''}`} aria-label="Navegación principal">
         <NavLink className={styles.brand()} to="/" onClick={close} aria-label="Desafío Bíblico, ir al inicio"><img className={styles.brandLogo()} src={logo} alt="Desafío Bíblico" /></NavLink>
         <nav className={styles.nav()}>{links.map(({ to, label, Icon, end }, index) => <NavLink ref={index === 0 ? firstLinkRef : undefined} key={to} to={to} end={end} className={styles.navLink()} onClick={close}><Icon size={20} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
    </aside>
       <div className={styles.main()}>
          <header className={styles.topbar()}><button ref={triggerRef} className={`${styles.iconButton()} ${styles.mobileMenu()}`} aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} onClick={toggle}>{open ? <IconX aria-hidden="true" /> : <IconMenu2 aria-hidden="true" />}</button><div className={styles.topActions()}><button className={styles.iconButton()} aria-label="Notificaciones"><IconBell aria-hidden="true" /></button><div className={styles.profile()}><strong>María López</strong><span>Administradora</span></div><span className={styles.avatar()} aria-label="Perfil de María López">ML</span></div></header>
          <main className={styles.content()}><Outlet /></main>
          <footer className={styles.bottomBar()}><span className={styles.bottomBarInfo()}><IconInfoCircle size={16} aria-hidden="true" /><span>Palabra Viva · Back Office</span></span><span className={styles.bottomBarStatus()}>Sesión activa</span></footer>
     </div>
  </div>
}
