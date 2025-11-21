import { useEffect, useState } from 'react'
import { FolderTree, FileCode, Lightbulb, TrendingUp, Loader2, RefreshCw, FolderOpen, Github } from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'
import { useGitHubStore } from '@/store/githubStore'
import { isTauri } from '@/utils/platform'

export default function ProjectAnalyzerPage() {
  const analysis = useProjectStore((state) => state.analysis)
  const loading = useProjectStore((state) => state.loading)
  const error = useProjectStore((state) => state.error)
  const analyze = useProjectStore((state) => state.analyze)
  const selectAndAnalyze = useProjectStore((state) => state.selectAndAnalyze)
  const analyzeGitHubRepo = useProjectStore((state) => state.analyzeGitHubRepo)
  
  const githubConnected = useGitHubStore((state) => state.connected)
  const repos = useGitHubStore((state) => state.repos)
  const fetchRepos = useGitHubStore((state) => state.fetchRepos)
  const githubLoading = useGitHubStore((state) => state.loading)
  
  const [showGitHubInput, setShowGitHubInput] = useState(false)
  const [showMyRepos, setShowMyRepos] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!analysis && isTauri()) {
      // Analisa o diretório atual automaticamente
      analyze()
    }
  }, [analysis, analyze])

  const handleSelectFolder = () => {
    selectAndAnalyze()
  }

  const handleAnalyzeCurrent = () => {
    analyze()
  }

  const handleAnalyzeGitHub = async () => {
    if (!githubConnected) {
      alert('Por favor, conecte-se ao GitHub primeiro na página GitHub.')
      return
    }
    
    // Buscar repos se ainda não tem
    if (repos.length === 0 && !githubLoading) {
      await fetchRepos()
    }
    
    setShowMyRepos(true)
  }

  const handleAnalyzeRepoFromList = (fullName: string) => {
    const [owner, repo] = fullName.split('/')
    analyzeGitHubRepo(owner, repo)
    setShowMyRepos(false)
    setSearchTerm('')
  }

  const handleShowManualInput = () => {
    setShowMyRepos(false)
    setShowGitHubInput(true)
  }

  const handleSubmitGitHubRepo = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Parse GitHub URL or owner/repo format
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/) || repoUrl.match(/^([^/]+)\/([^/]+)$/)
    
    if (!match) {
      alert('Formato inválido. Use: owner/repo ou URL completa do GitHub')
      return
    }

    const [, owner, repo] = match
    const cleanRepo = repo.replace(/\.git$/, '')
    
    analyzeGitHubRepo(owner, cleanRepo)
    setShowGitHubInput(false)
    setRepoUrl('')
  }

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col gap-6">
      {/* My Repos Modal */}
      {showMyRepos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex h-[600px] w-full max-w-2xl flex-col rounded-2xl border border-slate-300/50 bg-white shadow-2xl dark:border-slate-700/50 dark:bg-slate-800">
            <div className="border-b border-slate-300/50 p-6 dark:border-slate-700/50">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Meus Repositórios
                </h3>
                <button
                  onClick={() => {
                    setShowMyRepos(false)
                    setSearchTerm('')
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar repositório..."
                className="w-full rounded-xl border border-slate-300/50 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-slate-700/50 dark:bg-slate-900/50 dark:text-white dark:placeholder-slate-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {githubLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
              ) : filteredRepos.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                  {searchTerm ? 'Nenhum repositório encontrado' : 'Nenhum repositório disponível'}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => handleAnalyzeRepoFromList(repo.fullName)}
                      className="w-full rounded-xl border border-slate-300/50 bg-white/80 p-4 text-left transition hover:border-brand/50 hover:bg-white dark:border-slate-700/50 dark:bg-slate-700/50 dark:hover:border-brand/50 dark:hover:bg-slate-700"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {repo.name}
                          </h4>
                          {repo.description && (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                              {repo.description}
                            </p>
                          )}
                        </div>
                        {repo.private && (
                          <span className="ml-2 rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-600 dark:text-slate-300">
                            Privado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-brand"></span>
                            {repo.language}
                          </span>
                        )}
                        <span>⭐ {repo.stars}</span>
                        <span>🍴 {repo.forks}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-slate-300/50 p-4 dark:border-slate-700/50">
              <button
                onClick={handleShowManualInput}
                className="w-full rounded-xl border border-slate-300/50 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Ou digite URL manualmente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Repo Input Modal */}
      {showGitHubInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-300/50 bg-white p-6 shadow-2xl dark:border-slate-700/50 dark:bg-slate-800">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Analisar Repositório GitHub
            </h3>
            <form onSubmit={handleSubmitGitHubRepo}>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="owner/repo ou https://github.com/owner/repo"
                className="mb-4 w-full rounded-xl border border-slate-300/50 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-slate-700/50 dark:bg-slate-900/50 dark:text-white dark:placeholder-slate-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowGitHubInput(false)
                    setRepoUrl('')
                  }}
                  className="flex-1 rounded-xl border border-slate-300/50 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark dark:bg-brand-light dark:hover:bg-brand"
                >
                  Analisar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="rounded-xl border border-slate-300/50 bg-white/60 p-6 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20">
            <FolderTree className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Análise de Projetos
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Insights sobre estrutura, arquivos e melhorias
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAnalyzeGitHub}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-slate-300/50 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Github className="h-4 w-4" />
              GitHub Repo
            </button>
            <button
              onClick={handleSelectFolder}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-slate-300/50 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <FolderOpen className="h-4 w-4" />
              Pasta Local
            </button>
            <button
              onClick={handleAnalyzeCurrent}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark hover:shadow-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/60 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-light dark:hover:bg-brand"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Analisar Atual
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-300/50 bg-red-50/80 p-4 text-sm text-red-700 backdrop-blur-sm dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-300/50 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-5 shadow-md backdrop-blur-md dark:border-slate-700/50 dark:from-blue-500/20 dark:to-blue-600/10">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2.5 text-blue-600 dark:bg-blue-500/30 dark:text-blue-400">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {analysis?.totalFiles ?? 0}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Arquivos</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-300/50 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-5 shadow-md backdrop-blur-md dark:border-slate-700/50 dark:from-purple-500/20 dark:to-purple-600/10">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-2.5 text-purple-600 dark:bg-purple-500/30 dark:text-purple-400">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {analysis?.totalDirectories ?? 0}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Diretórios</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-300/50 bg-gradient-to-br from-green-500/10 to-green-600/5 p-5 shadow-md backdrop-blur-md dark:border-slate-700/50 dark:from-green-500/20 dark:to-green-600/10">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2.5 text-green-600 dark:bg-green-500/30 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">85%</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Qualidade</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-300/50 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-5 shadow-md backdrop-blur-md dark:border-slate-700/50 dark:from-amber-500/20 dark:to-amber-600/10">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2.5 text-amber-600 dark:bg-amber-500/30 dark:text-amber-400">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {analysis?.suggestions.length ?? 0}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Sugestões</p>
            </div>
          </div>
        </div>
      </div>

      {/* File Types */}
      <div className="rounded-xl border border-slate-300/50 bg-white/60 p-6 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40">
        <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Tipos de Arquivo
        </h3>
        <div className="space-y-3">
          {analysis?.fileTypes.slice(0, 5).map((item, index) => {
            const maxCount = analysis.fileTypes[0]?.count ?? 1
            const percentage = Math.round((item.count / maxCount) * 100)
            const colors = [
              'bg-blue-500',
              'bg-cyan-500',
              'bg-orange-500',
              'bg-yellow-500',
              'bg-pink-500',
            ]
            return (
              <div key={item.extension}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.extension.toUpperCase()}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{item.count} arquivos</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full ${colors[index % colors.length]} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          }) ?? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nenhum tipo de arquivo detectado
            </p>
          )}
        </div>
      </div>

      {/* Suggestions */}
      <div className="rounded-xl border border-slate-300/50 bg-white/60 p-6 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Sugestões de Melhoria
          </h3>
        </div>
        <ul className="space-y-3">
          {analysis?.suggestions.map((suggestion, index) => {
            const colors = [
              { border: 'border-amber-200/60', bg: 'bg-amber-50/60', text: 'text-amber-600', textDark: 'text-amber-400', borderDark: 'border-amber-800/50', bgDark: 'bg-amber-900/20' },
              { border: 'border-blue-200/60', bg: 'bg-blue-50/60', text: 'text-blue-600', textDark: 'text-blue-400', borderDark: 'border-blue-800/50', bgDark: 'bg-blue-900/20' },
              { border: 'border-purple-200/60', bg: 'bg-purple-50/60', text: 'text-purple-600', textDark: 'text-purple-400', borderDark: 'border-purple-800/50', bgDark: 'bg-purple-900/20' },
            ]
            const color = colors[index % colors.length]
            return (
              <li
                key={index}
                className={`flex gap-3 rounded-lg border ${color.border} ${color.bg} p-4 backdrop-blur-sm dark:${color.borderDark} dark:${color.bgDark}`}
              >
                <span className={`${color.text} dark:${color.textDark}`}>•</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{suggestion}</p>
              </li>
            )
          }) ?? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nenhuma sugestão no momento
            </p>
          )}
        </ul>
      </div>
    </div>
  )
}
