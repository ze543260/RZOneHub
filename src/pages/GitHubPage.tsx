import { useEffect } from 'react'
import {
  Github,
  GitFork,
  Star,
  Lock,
  ExternalLink,
  RefreshCw,
  LogOut,
  Loader2,
  Code2,
} from 'lucide-react'
import { useGitHubStore } from '@/store/githubStore'
import { clsx } from 'clsx'

export default function GitHubPage() {
  const user = useGitHubStore((state) => state.user)
  const repos = useGitHubStore((state) => state.repos)
  const loading = useGitHubStore((state) => state.loading)
  const error = useGitHubStore((state) => state.error)
  const connected = useGitHubStore((state) => state.connected)
  const fetchRepos = useGitHubStore((state) => state.fetchRepos)
  const disconnect = useGitHubStore((state) => state.disconnect)

  useEffect(() => {
    if (connected && repos.length === 0) {
      fetchRepos()
    }
  }, [connected, repos.length, fetchRepos])

  const getLanguageColor = (language: string | null) => {
    const colors: Record<string, string> = {
      TypeScript: 'bg-blue-500',
      JavaScript: 'bg-yellow-500',
      Python: 'bg-green-600',
      Rust: 'bg-orange-600',
      Go: 'bg-cyan-600',
      Java: 'bg-red-600',
      'C++': 'bg-pink-600',
      Ruby: 'bg-red-500',
    }
    return colors[language || ''] || 'bg-gray-500'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`
    return `${Math.floor(diffDays / 365)} anos atrás`
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-300/50 bg-white/60 p-6 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20">
              <Github className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Repositórios GitHub
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {connected
                  ? `${repos.length} repositório(s) encontrado(s)`
                  : 'Conecte-se ao GitHub para começar'}
              </p>
            </div>
          </div>

          {connected && (
            <div className="flex gap-2">
              <button
                onClick={fetchRepos}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-slate-300/50 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <RefreshCw className={clsx('h-4 w-4', loading && 'animate-spin')} />
                Atualizar
              </button>
              <button
                onClick={disconnect}
                className="flex items-center gap-2 rounded-xl border border-red-300/50 bg-red-50/60 px-4 py-2 text-sm font-semibold text-red-600 backdrop-blur-sm transition hover:bg-red-100/80 dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <LogOut className="h-4 w-4" />
                Desconectar
              </button>
            </div>
          )}
        </div>

        {/* User Info */}
        {connected && user && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-300/50 bg-slate-50/50 p-3 dark:border-slate-700/50 dark:bg-slate-700/30">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-10 w-10 rounded-full border-2 border-brand/30"
            />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">@{user.login}</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-300/50 bg-red-50/80 p-4 text-sm text-red-700 backdrop-blur-sm dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && repos.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Carregando repositórios...
            </p>
          </div>
        </div>
      )}

      {/* Repositories Grid */}
      {!loading && repos.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <div
                key={repo.id}
                className="group rounded-xl border border-slate-300/50 bg-white/60 p-5 shadow-md backdrop-blur-md transition hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-800/40"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {repo.name}
                      </h3>
                      {repo.private && (
                        <Lock className="h-3.5 w-3.5 text-slate-400" title="Privado" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {repo.fullName}
                    </p>
                  </div>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    title="Abrir no GitHub"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                {repo.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                    {repo.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  {repo.language && (
                    <div className="flex items-center gap-1.5">
                      <span className={clsx('h-2.5 w-2.5 rounded-full', getLanguageColor(repo.language))} />
                      {repo.language}
                    </div>
                  )}
                  <div className="flex items-center gap-1" title="Stars">
                    <Star className="h-3.5 w-3.5" />
                    {repo.stars}
                  </div>
                  <div className="flex items-center gap-1" title="Forks">
                    <GitFork className="h-3.5 w-3.5" />
                    {repo.forks}
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                  Atualizado {formatDate(repo.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && connected && repos.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Code2 className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              Nenhum repositório encontrado
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Não foi possível encontrar repositórios na sua conta.
            </p>
          </div>
        </div>
      )}

      {/* Not Connected State */}
      {!connected && !loading && (
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md text-center">
            <Github className="mx-auto h-20 w-20 text-slate-300 dark:text-slate-700" />
            <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
              Conecte-se ao GitHub
            </h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Para visualizar seus repositórios, conecte sua conta GitHub nas configurações.
            </p>
            <a
              href="#/settings"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark hover:shadow-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/60 dark:bg-brand-light dark:hover:bg-brand"
            >
              <Github className="h-4 w-4" />
              Ir para Configurações
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
