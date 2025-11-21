import { Navigate, createHashRouter } from 'react-router-dom'
import AppLayout from '@/App'
import ChatPage from '@/pages/ChatPage'
import CodeGeneratorPage from '@/pages/CodeGeneratorPage'
import ProjectAnalyzerPage from '@/pages/ProjectAnalyzerPage'
import GitHubPage from '@/pages/GitHubPage'
import RepositoryViewerPage from '@/pages/RepositoryViewerPage'
import SettingsPage from '@/pages/SettingsPage'
import WelcomePage from '@/pages/WelcomePage'
import IDEPage from '@/pages/IDEPage'

export const router = createHashRouter([
  {
    path: '/welcome',
    element: <WelcomePage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="chat" replace /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'code', element: <CodeGeneratorPage /> },
      { path: 'analysis', element: <ProjectAnalyzerPage /> },
      { path: 'github', element: <GitHubPage /> },
      { path: 'github/:owner/:repo', element: <RepositoryViewerPage /> },
      { path: 'ide', element: <IDEPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
