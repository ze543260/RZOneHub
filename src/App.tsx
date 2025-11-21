import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Code2, FolderTree, MessageSquare, Settings, Github, FileCode } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import ThemeToggle from '@/components/settings/ThemeToggle'
import { useTheme } from '@/hooks/useTheme'
import { useSettingsStore } from '@/store/settingsStore'
import { useOnboardingStore } from '@/store/onboardingStore'

const navigation = [
  { label: 'Chat', to: '/chat', icon: MessageSquare },
  { label: 'Geração de Código', to: '/code', icon: Code2 },
  { label: 'Análise de Projetos', to: '/analysis', icon: FolderTree },
  { label: 'GitHub', to: '/github', icon: Github },
  { label: 'IDE', to: '/ide', icon: FileCode },
  { label: 'Configurações', to: '/settings', icon: Settings },
]

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const initializeSettings = useSettingsStore((state) => state.initialize)
  const onboardingCompleted = useOnboardingStore((state) => state.completed)
  const current = navigation.find((item) => location.pathname.startsWith(item.to))

  useTheme()

  useEffect(() => {
    initializeSettings()
  }, [initializeSettings])

  useEffect(() => {
    if (!onboardingCompleted) {
      navigate('/welcome', { replace: true })
    }
  }, [onboardingCompleted, navigate])

  return (
    <div className="flex h-full flex-col bg-slate-100 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <main className="flex-1 overflow-y-auto bg-slate-100/60 p-6 pb-24 dark:bg-slate-900/50">
        <Outlet />
      </main>
      <Sidebar items={navigation} />
      
      {/* Theme Toggle - Canto inferior direito */}
      <div className="fixed bottom-6 right-6 z-40">
        <ThemeToggle />
      </div>
    </div>
  )
}
