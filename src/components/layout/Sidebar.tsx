import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import type { LucideIcon } from 'lucide-react'

export type SidebarItem = {
  label: string
  to: string
  icon: LucideIcon
}

type SidebarProps = {
  items: SidebarItem[]
}

export default function Sidebar({ items }: SidebarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 border-b border-slate-300/50 bg-white/80 px-6 py-3 shadow-lg backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/80">
      {items.map((item) => {
        const isSettings = item.to === '/settings'
        return (
          <div key={item.to} className="relative group">
            {/* Tooltip */}
            <div className="absolute top-full left-1/2 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block dark:bg-slate-700">
              {item.label}
              <div className="absolute left-1/2 bottom-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-700" />
            </div>
            
            {isSettings && items.length > 1 && (
              <div className="absolute -left-2 top-1/2 h-8 w-px -translate-y-1/2 bg-slate-300 dark:bg-slate-600" />
            )}
            
            <NavLink
              to={item.to}
              className={({ isActive }: { isActive: boolean }) =>
                clsx(
                  'flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 hover:scale-110',
                  isActive
                    ? 'bg-brand text-white shadow-lg shadow-brand/40 dark:bg-brand-light'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                )
              }
            >
              <item.icon className="h-5 w-5" />
            </NavLink>
          </div>
        )
      })}
    </nav>
  )
}
