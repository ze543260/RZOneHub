import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Code2, FolderTree, MessageSquare, Settings, Github, FileCode, Puzzle, Shield, BookOpen, Palette } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import ThemeToggle from '@/components/settings/ThemeToggle'
import { useTheme } from '@/hooks/useTheme'
import { useSettingsStore } from '@/store/settingsStore'
import { useOnboardingStore } from '@/store/onboardingStore'

const navigation = [
  { label: 'Chat', to: '/chat', icon: MessageSquare },
  { label: 'Geração de Código', to: '/code', icon: Code2 },
  { label: 'Análise de Projetos', to: '/analysis', icon: FolderTree },
  { label: 'Code Review', to: '/code-review', icon: Shield },
  { label: 'Documentação', to: '/documentation', icon: BookOpen },
  { label: 'Editor Visual', to: '/visual-editor', icon: Palette },
  { label: 'GitHub', to: '/github', icon: Github },
  { label: 'IDE', to: '/ide', icon: FileCode },
  { label: 'Plugins', to: '/plugins', icon: Puzzle },
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
    <div className="flex h-full flex-col transition-colors duration-200" style={{ backgroundColor: 'rgb(var(--theme-bg))', color: 'rgb(var(--theme-text))' }}>
      <Sidebar items={navigation} />
      <main className="flex-1 overflow-y-auto p-6 pt-20 [&:has(#ide-page)]:p-0 [&:has(#ide-page)]:pt-16" style={{ backgroundColor: 'rgb(var(--theme-bg) / 0.6)' }}>
        <Outlet />
      </main>
      
      {/* Theme Toggle - Dentro do header */}
      <div className="fixed top-3 right-6 z-50">
        <ThemeToggle />
      </div>
    </div>
  )
}
