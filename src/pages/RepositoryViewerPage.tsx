import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Folder,
  File,
  Code2,
  Star,
  GitFork,
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
} from 'lucide-react'
import { useGitHubStore } from '@/store/githubStore'
import { clsx } from 'clsx'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'dir'
  size?: number
  sha?: string
}

interface FileContent {
  content: string
  encoding: string
  size: number
}

export default function RepositoryViewerPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>()
  const navigate = useNavigate()
  const token = useGitHubStore((state) => state.token)
  const repos = useGitHubStore((state) => state.repos)
  
  const [currentPath, setCurrentPath] = useState('')
  const [files, setFiles] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const currentRepo = repos.find(r => r.fullName === `${owner}/${repo}`)

  useEffect(() => {
    if (owner && repo) {
      loadDirectory(currentPath)
    }
  }, [owner, repo, currentPath])

  const loadDirectory = async (path: string) => {
    if (!token) return
    
    setLoading(true)
    setError(null)
    
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error('Falha ao carregar diretório')
      }

      const data = await response.json()
      
      // Ordena: diretórios primeiro, depois arquivos
      const sorted = data.sort((a: FileNode, b: FileNode) => {
        if (a.type === b.type) return a.name.localeCompare(b.name)
        return a.type === 'dir' ? -1 : 1
      })
      
      setFiles(sorted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar diretório')
    } finally {
      setLoading(false)
    }
  }

  const loadFile = async (path: string) => {
    if (!token) return
    
    setLoading(true)
    setError(null)
    
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error('Falha ao carregar arquivo')
      }

      const data: FileContent = await response.json()
      
      if (data.encoding === 'base64') {
        const decoded = atob(data.content)
        setFileContent(decoded)
      } else {
        setFileContent(data.content)
      }
      
      setSelectedFile(path)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar arquivo')
    } finally {
      setLoading(false)
    }
  }

  const handleItemClick = (item: FileNode) => {
    if (item.type === 'dir') {
      setCurrentPath(item.path)
      setSelectedFile(null)
      setFileContent('')
    } else {
      loadFile(item.path)
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    const pathParts = currentPath.split('/').filter(Boolean)
    const newPath = pathParts.slice(0, index + 1).join('/')
    setCurrentPath(newPath)
    setSelectedFile(null)
    setFileContent('')
  }

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico']
    const videoExts = ['mp4', 'webm', 'avi', 'mov']
    const archiveExts = ['zip', 'tar', 'gz', 'rar', '7z']
    
    if (imageExts.includes(ext || '')) return <ImageIcon className="h-4 w-4" />
    if (videoExts.includes(ext || '')) return <Film className="h-4 w-4" />
    if (archiveExts.includes(ext || '')) return <Archive className="h-4 w-4" />
    
    return <FileText className="h-4 w-4" />
  }

  const pathParts = currentPath ? currentPath.split('/').filter(Boolean) : []

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 p-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/github')}
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {repo}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {owner}/{repo}
              </p>
            </div>
          </div>

          {currentRepo && (
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {currentRepo.stars}
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                {currentRepo.forks}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File Browser */}
        <div className="w-80 border-r border-slate-200 bg-white/60 backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/40">
          {/* Breadcrumb */}
          <div className="border-b border-slate-200 p-3 dark:border-slate-700">
            <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() => {
                  setCurrentPath('')
                  setSelectedFile(null)
                  setFileContent('')
                }}
                className={clsx(
                  'rounded px-2 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-700',
                  !currentPath ? 'font-semibold text-brand' : 'text-slate-600 dark:text-slate-400'
                )}
              >
                {repo}
              </button>
              {pathParts.map((part, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span className="text-slate-400">/</span>
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className={clsx(
                      'rounded px-2 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-700',
                      index === pathParts.length - 1
                        ? 'font-semibold text-brand'
                        : 'text-slate-600 dark:text-slate-400'
                    )}
                  >
                    {part}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* File List */}
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
            {loading && !selectedFile && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  <p className="text-sm text-slate-500">Carregando...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4">
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              </div>
            )}

            {!loading && !error && files.map((item) => (
              <button
                key={item.path}
                onClick={() => handleItemClick(item)}
                className={clsx(
                  'flex w-full items-center gap-2 px-4 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-700/50',
                  selectedFile === item.path && 'bg-brand/10 dark:bg-brand/20'
                )}
              >
                {item.type === 'dir' ? (
                  <Folder className="h-4 w-4 text-blue-500" />
                ) : (
                  getFileIcon(item.name)
                )}
                <span className="truncate text-sm text-slate-900 dark:text-white">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* File Viewer */}
        <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-900">
          {!selectedFile && !loading && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Code2 className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  Selecione um arquivo
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Navegue pelos arquivos do repositório
                </p>
              </div>
            </div>
          )}

          {loading && selectedFile && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                <p className="text-sm text-slate-500">Carregando arquivo...</p>
              </div>
            </div>
          )}

          {selectedFile && !loading && (
            <div className="flex h-full flex-col">
              <div className="border-b border-slate-200 bg-white/80 p-3 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {selectedFile.split('/').pop()}
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <pre className="p-4 text-xs leading-relaxed">
                  <code className="text-slate-900 dark:text-slate-100">
                    {fileContent}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
