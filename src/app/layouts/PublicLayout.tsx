import { useEffect, useRef, useState } from 'react'
import { IconBook2, IconInfoCircle, IconMenu2, IconSettings, IconSun, IconX } from '@tabler/icons-react'
import { NavLink, Outlet } from 'react-router-dom'
import logo from '@/assets/desafio-biblico-logo.webp'
import { tv } from '@/app/shared/lib/tv'

const styles = tv({
  slots: {
    shell: 'grid h-[100dvh] min-h-0 grid-cols-[16.5rem_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-[#fffaf0] text-foreground max-[48rem]:block',
    appbar: 'col-start-2 row-start-1 flex min-h-16 items-center justify-center border-b border-[#e5d7bd] bg-[#fffaf0] px-4 py-2 max-[48rem]:col-auto max-[48rem]:row-auto',
    logo: 'block h-auto max-h-14 w-auto max-w-56 object-contain',
    body: 'col-start-2 row-start-2 min-h-0 overflow-hidden max-[48rem]:block max-[48rem]:h-[calc(100dvh-4rem)]',
    sidebar: 'row-span-2 row-start-1 flex flex-col gap-8 border-r border-[#e5d7bd] bg-[#35251e] p-6 text-[#f8e7bd] max-[48rem]:hidden',
    sidebarLogo: 'mx-auto block h-auto max-h-16 w-full max-w-48 object-contain',
    nav: 'grid gap-2',
    link: 'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[#e8d5aa] no-underline hover:bg-[#49352a] hover:text-[#fff8e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a84f] aria-[current=page]:bg-[#49352a] aria-[current=page]:text-[#fff8e9]',
    content: 'flex h-full min-h-0 min-w-0 flex-col pb-4',
    main: 'min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pt-[clamp(1rem,2vw,1.5rem)] pb-[clamp(1.25rem,4vw,2.5rem)] sm:px-[clamp(1.25rem,4vw,2.5rem)] max-[48rem]:pb-24',
    footer: 'flex min-h-11 items-center gap-2 border-t border-[#e5d7bd] px-[clamp(1rem,3vw,2.5rem)] py-2 text-xs text-[#806b51]',
    bottomNav: 'hidden max-[48rem]:grid min-h-14 grid-cols-3 overflow-x-hidden rounded-2xl border border-[#e5d7bd] bg-[#fffaf0] p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-lg',
    bottomLink: 'flex min-h-11 min-w-0 items-center justify-center rounded-xl px-2 py-2 text-[#806b51] no-underline focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d4a84f] aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground',
  },
})

const links = [
  { to: '/guia', label: 'Guía de lectura', Icon: IconBook2 },
  { to: '/lectura-hoy', label: 'Lectura de hoy', Icon: IconSun },
  { to: '/configuracion', label: 'Configuración', Icon: IconSettings },
]

export function PublicLayout() {
  const s = styles()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  useEffect(() => { if (!menuOpen) menuButtonRef.current?.focus() }, [menuOpen])

  return <div className={s.shell()}>
    <aside className={s.sidebar()} aria-label="Navegación principal">
      <img className={s.sidebarLogo()} src={logo} alt="" aria-hidden="true" />
      <nav className={s.nav()}>{links.map(({ to, label, Icon }) => <NavLink key={to} to={to} className={s.link()}><Icon size={20} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
    </aside>
    <header className={`${s.appbar()} max-[48rem]:justify-between max-[48rem]:bg-primary max-[48rem]:text-primary-foreground`}>
      <button ref={menuButtonRef} type="button" onClick={() => setMenuOpen(true)} className="hidden min-h-11 min-w-11 items-center justify-center rounded-md text-primary-foreground hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground max-[48rem]:inline-flex" aria-label="Abrir menú" aria-expanded={menuOpen} aria-controls="public-mobile-menu"><IconMenu2 size={24} aria-hidden="true" /></button>
      <NavLink to="/" aria-label="Desafío Bíblico, ir al inicio" className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a84f]"><img className={s.logo()} src={logo} alt="Desafío Bíblico" /></NavLink>
      <span className="hidden min-w-11 max-[48rem]:block" aria-hidden="true" />
    </header>
    <div className={s.body()}>
      <div className={s.content()}>
        <main className={s.main()}><Outlet /></main>
        <footer className={s.footer()}><IconInfoCircle size={16} aria-hidden="true" /><span>· Un espacio para leer y reflexionar</span></footer>
      </div>
    </div>
    <nav className={`${s.bottomNav()} fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-[max(0.75rem,env(safe-area-inset-left))] right-[max(0.75rem,env(safe-area-inset-right))] z-10`} aria-label="Navegación principal">{links.map(({ to, label, Icon }) => <NavLink key={to} to={to} aria-label={label} className={s.bottomLink()}><Icon size={22} aria-hidden="true" /></NavLink>)}</nav>
    {menuOpen && <div className="fixed inset-0 z-40 bg-black/45" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setMenuOpen(false)}>
      <div id="public-mobile-menu" className="h-full w-[min(20rem,85vw)] bg-secondary p-6 text-secondary-foreground shadow-2xl" role="dialog" aria-modal="true" aria-label="Menú principal">
        <div className="mb-8 flex items-center justify-between"><span className="font-[Merriweather,Georgia,serif] text-lg font-bold">Menú</span><button type="button" onClick={() => setMenuOpen(false)} className="flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-secondary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label="Cerrar menú"><IconX size={23} aria-hidden="true" /></button></div>
        <nav className="grid gap-2" aria-label="Navegación móvil">{links.map(({ to, label, Icon }) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-secondary-foreground hover:bg-secondary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"><Icon size={20} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
      </div>
    </div>}
  </div>
}
