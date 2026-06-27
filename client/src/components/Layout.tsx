import { NavLink, Outlet } from 'react-router-dom'
import { Coffee, LayoutDashboard, ShoppingCart, Boxes, History, Settings2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useThemeCtx } from '../context/ThemeContext'

const navItems: { to: string; label: string; labelMovil?: string; Icon: LucideIcon }[] = [
  { to: '/',               label: 'Inicio',      Icon: LayoutDashboard },
  { to: '/nueva-compra',  label: 'Nueva Compra', labelMovil: 'Compra', Icon: ShoppingCart },
  { to: '/lotes',         label: 'Lotes',        Icon: Boxes },
  { to: '/historial',     label: 'Historial',    Icon: History },
  { to: '/configuracion', label: 'Config',       Icon: Settings2 },
]

const themeLabels = { light: 'Claro', dark: 'Oscuro', gtavi: 'GTA VI' }

export default function Layout() {
  const { theme } = useThemeCtx()

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col transition-colors">

      {/* ── Sidebar desktop ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 flex-col z-40 bg-white dark:bg-zinc-900 border-r border-zinc-300 dark:border-zinc-800">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm">
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="app-logo-text font-bold text-zinc-900 dark:text-zinc-100 text-base leading-none">CaféLog</p>
              <p className="app-logo-sub text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Gestión de compras</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? '' : 'opacity-70'}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            Tema: {themeLabels[theme]} · CaféLog v1.0
          </p>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <main className="md:ml-60 flex-1 flex flex-col pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>

      {/* ── Bottom nav móvil ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-zinc-300 dark:border-zinc-800">
        <div className="flex">
          {navItems.map(({ to, label, labelMovil, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? '' : 'opacity-60'}`} />
                  <span className="leading-none mt-0.5">{labelMovil ?? label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
