import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Settings2 } from 'lucide-react'
import ThemeToggle from '@/components/settings/ThemeToggle'

interface TopBarProps {
  title: string
}

const subtitles: Record<string, string> = {
  '/chat': 'Converse com seus modelos e acompanhe múltiplas sessões.',
  '/code': 'Gere scaffolds, refatore trechos e documente seu código.',
  '/analysis': 'Analise rapidamente a estrutura do projeto e pontos de atenção.',
  '/settings': 'Gerencie integrações, preferências e temas da aplicação.',
}

export default function TopBar({ title }: TopBarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const subtitle = useMemo(() => {
    const entry = Object.entries(subtitles).find(([path]) =>
      location.pathname.startsWith(path),
    )
    return entry?.[1] ?? 'Assistente inteligente para acelerar o desenvolvimento.'
  }, [location.pathname])

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/60 px-6 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/50">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-brand/20 px-3 py-2 text-sm font-medium text-brand transition hover:bg-brand/25 focus:outline-none focus:ring-2 focus:ring-brand/60 dark:bg-brand/15 dark:hover:bg-brand/25"
        >
          <Settings2 className="h-4 w-4" />
          Configurações
        </button>
      </div>
    </header>
  )
}
