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
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-50/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/40 lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-2 px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <span className="text-2xl font-bold">RZ</span>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            RZOne Dev Hub
          </p>
          <p className="text-xs text-slate-400">Assistente Inteligente</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-2 px-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }: { isActive: boolean }) =>
              clsx(
                'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors duration-200 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100',
                isActive &&
                  'bg-brand/10 text-brand shadow-glow dark:text-brand-light'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 text-xs text-slate-400">
        <p>RZOneHub © {new Date().getFullYear()}</p>
        <p className="text-[0.7rem] text-slate-400/80">
          Feito com Rust + React
        </p>
      </div>
    </aside>
  )
}
