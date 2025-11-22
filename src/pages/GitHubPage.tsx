import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Github,
  GitFork,
  Star,
  Lock,
  FolderGit2,
  RefreshCw,
  LogOut,
  Loader2,
  Code2,
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Tag,
  Play,
  Plus,
  MessageSquare,
} from 'lucide-react'
import { useGitHubStore } from '@/store/githubStore'
import { clsx } from 'clsx'

type Tab = 'repos' | 'issues' | 'prs' | 'commits' | 'branches' | 'releases' | 'workflows'

export default function GitHubPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('repos')
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
  const [showCreateIssue, setShowCreateIssue] = useState(false)
  const [showCreatePR, setShowCreatePR] = useState(false)
  const [showCreateBranch, setShowCreateBranch] = useState(false)
  const [showCreateRelease, setShowCreateRelease] = useState(false)
  
  const user = useGitHubStore((state) => state.user)
  const repos = useGitHubStore((state) => state.repos)
  const issues = useGitHubStore((state) => state.issues)
  const pullRequests = useGitHubStore((state) => state.pullRequests)
  const commits = useGitHubStore((state) => state.commits)
  const branches = useGitHubStore((state) => state.branches)
  const releases = useGitHubStore((state) => state.releases)
  const workflows = useGitHubStore((state) => state.workflows)
  const loading = useGitHubStore((state) => state.loading)
  const error = useGitHubStore((state) => state.error)
  const connected = useGitHubStore((state) => state.connected)
  const fetchRepos = useGitHubStore((state) => state.fetchRepos)
  const fetchIssues = useGitHubStore((state) => state.fetchIssues)
  const fetchPullRequests = useGitHubStore((state) => state.fetchPullRequests)
  const fetchCommits = useGitHubStore((state) => state.fetchCommits)
  const fetchBranches = useGitHubStore((state) => state.fetchBranches)
  const fetchReleases = useGitHubStore((state) => state.fetchReleases)
  const fetchWorkflows = useGitHubStore((state) => state.fetchWorkflows)
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

      {/* Tabs */}
      {connected && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('repos')}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === 'repos'
                ? 'bg-brand text-white shadow-lg shadow-brand/30'
                : 'bg-white/60 text-slate-700 hover:bg-white/80 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/60'
            )}
          >
            <FolderGit2 className="h-4 w-4" />
            Repositórios
          </button>
          <button
            onClick={() => { 
              setActiveTab('issues')
              if (selectedRepo) {
                const [owner, repo] = selectedRepo.split('/')
                fetchIssues(owner, repo)
              }
            }}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === 'issues'
                ? 'bg-brand text-white shadow-lg shadow-brand/30'
                : 'bg-white/60 text-slate-700 hover:bg-white/80 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/60'
            )}
          >
            <AlertCircle className="h-4 w-4" />
            Issues ({issues.length})
          </button>
          <button
            onClick={() => { 
              setActiveTab('prs')
              if (selectedRepo) {
                const [owner, repo] = selectedRepo.split('/')
                fetchPullRequests(owner, repo)
              }
            }}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === 'prs'
                ? 'bg-brand text-white shadow-lg shadow-brand/30'
                : 'bg-white/60 text-slate-700 hover:bg-white/80 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/60'
            )}
          >
            <GitPullRequest className="h-4 w-4" />
            Pull Requests ({pullRequests.length})
          </button>
          <button
            onClick={() => { 
              setActiveTab('commits')
              if (selectedRepo) {
                const [owner, repo] = selectedRepo.split('/')
                fetchCommits(owner, repo)
              }
            }}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === 'commits'
                ? 'bg-brand text-white shadow-lg shadow-brand/30'
                : 'bg-white/60 text-slate-700 hover:bg-white/80 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/60'
            )}
          >
            <GitCommit className="h-4 w-4" />
            Commits ({commits.length})
          </button>
          <button
            onClick={() => { 
              setActiveTab('branches')
              if (selectedRepo) {
                const [owner, repo] = selectedRepo.split('/')
                fetchBranches(owner, repo)
              }
            }}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === 'branches'
                ? 'bg-brand text-white shadow-lg shadow-brand/30'
                : 'bg-white/60 text-slate-700 hover:bg-white/80 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/60'
            )}
          >
            <GitBranch className="h-4 w-4" />
            Branches ({branches.length})
          </button>
          <button
            onClick={() => { 
              setActiveTab('releases')
              if (selectedRepo) {
                const [owner, repo] = selectedRepo.split('/')
                fetchReleases(owner, repo)
              }
            }}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === 'releases'
                ? 'bg-brand text-white shadow-lg shadow-brand/30'
                : 'bg-white/60 text-slate-700 hover:bg-white/80 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/60'
            )}
          >
            <Tag className="h-4 w-4" />
            Releases ({releases.length})
          </button>
          <button
            onClick={() => { 
              setActiveTab('workflows')
              if (selectedRepo) {
                const [owner, repo] = selectedRepo.split('/')
                fetchWorkflows(owner, repo)
              }
            }}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === 'workflows'
                ? 'bg-brand text-white shadow-lg shadow-brand/30'
                : 'bg-white/60 text-slate-700 hover:bg-white/80 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/60'
            )}
          >
            <Play className="h-4 w-4" />
            Workflows ({workflows.length})
          </button>
        </div>
      )}

      {/* Repo Selector for non-repo tabs */}
      {connected && activeTab !== 'repos' && (
        <div className="rounded-xl border border-slate-300/50 bg-white/60 p-4 dark:border-slate-700/50 dark:bg-slate-800/40">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
            Selecionar Repositório:
          </label>
          <select
            value={selectedRepo || ''}
            onChange={(e) => {
              setSelectedRepo(e.target.value)
              const [owner, repo] = e.target.value.split('/')
              if (activeTab === 'issues') fetchIssues(owner, repo)
              if (activeTab === 'prs') fetchPullRequests(owner, repo)
              if (activeTab === 'commits') fetchCommits(owner, repo)
              if (activeTab === 'branches') fetchBranches(owner, repo)
              if (activeTab === 'releases') fetchReleases(owner, repo)
              if (activeTab === 'workflows') fetchWorkflows(owner, repo)
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">-- Selecione um repositório --</option>
            {repos.map(repo => (
              <option key={repo.id} value={repo.fullName}>{repo.fullName}</option>
            ))}
          </select>
        </div>
      )}

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

      {/* Issues Tab */}
      {activeTab === 'issues' && selectedRepo && (
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Issues</h3>
            <button
              onClick={() => setShowCreateIssue(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nova Issue
            </button>
          </div>
          {issues.map(issue => (
            <div key={issue.id} className="rounded-xl border border-slate-300/50 bg-white/60 p-4 dark:border-slate-700/50 dark:bg-slate-800/40">
              <div className="flex items-start gap-3">
                <AlertCircle className={clsx('h-5 w-5 mt-0.5', issue.state === 'open' ? 'text-green-600' : 'text-slate-400')} />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white">#{issue.number} {issue.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{issue.body}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className={clsx('px-2 py-1 rounded', issue.state === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700')}>
                      {issue.state}
                    </span>
                    <span>@{issue.user.login}</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {issue.comments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pull Requests Tab */}
      {activeTab === 'prs' && selectedRepo && (
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pull Requests</h3>
            <button
              onClick={() => setShowCreatePR(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
            >
              <Plus className="h-4 w-4" />
              Novo PR
            </button>
          </div>
          {pullRequests.map(pr => (
            <div key={pr.id} className="rounded-xl border border-slate-300/50 bg-white/60 p-4 dark:border-slate-700/50 dark:bg-slate-800/40">
              <div className="flex items-start gap-3">
                <GitPullRequest className={clsx('h-5 w-5 mt-0.5', 
                  pr.state === 'open' ? 'text-green-600' : 
                  pr.state === 'merged' ? 'text-purple-600' : 'text-red-600'
                )} />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white">#{pr.number} {pr.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{pr.body}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className={clsx('px-2 py-1 rounded', 
                      pr.state === 'open' ? 'bg-green-100 text-green-700' : 
                      pr.state === 'merged' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                    )}>
                      {pr.state}
                    </span>
                    <span>{pr.head.ref} → {pr.base.ref}</span>
                    <span>@{pr.user.login}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Commits Tab */}
      {activeTab === 'commits' && selectedRepo && (
        <div className="flex-1 overflow-y-auto space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Commits</h3>
          {commits.map(commit => (
            <div key={commit.sha} className="rounded-xl border border-slate-300/50 bg-white/60 p-4 dark:border-slate-700/50 dark:bg-slate-800/40">
              <div className="flex items-start gap-3">
                <GitCommit className="h-5 w-5 mt-0.5 text-slate-600 dark:text-slate-400" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{commit.message.split('\n')[0]}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                    <span>{commit.author.name}</span>
                    <span>{formatDate(commit.author.date)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Branches Tab */}
      {activeTab === 'branches' && selectedRepo && (
        <div className="flex-1 overflow-y-auto space-y-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Branches</h3>
            <button
              onClick={() => setShowCreateBranch(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nova Branch
            </button>
          </div>
          {branches.map(branch => (
            <div key={branch.name} className="rounded-xl border border-slate-300/50 bg-white/60 p-4 dark:border-slate-700/50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{branch.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{branch.commit.sha.substring(0, 7)}</p>
                  </div>
                </div>
                {branch.protected && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">Protected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Releases Tab */}
      {activeTab === 'releases' && selectedRepo && (
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Releases</h3>
            <button
              onClick={() => setShowCreateRelease(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nova Release
            </button>
          </div>
          {releases.map(release => (
            <div key={release.id} className="rounded-xl border border-slate-300/50 bg-white/60 p-4 dark:border-slate-700/50 dark:bg-slate-800/40">
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 mt-0.5 text-slate-600 dark:text-slate-400" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{release.name}</h4>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded dark:bg-slate-700 dark:text-slate-300">{release.tagName}</span>
                    {release.prerelease && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Pre-release</span>
                    )}
                    {release.draft && (
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">Draft</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{release.body}</p>
                  <p className="text-xs text-slate-500 mt-2">Publicado {formatDate(release.publishedAt || release.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workflows Tab */}
      {activeTab === 'workflows' && selectedRepo && (
        <div className="flex-1 overflow-y-auto space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">GitHub Actions Workflows</h3>
          {workflows.map(workflow => (
            <div key={workflow.id} className="rounded-xl border border-slate-300/50 bg-white/60 p-4 dark:border-slate-700/50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Play className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{workflow.name}</p>
                    <p className="text-xs text-slate-500">{workflow.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx('px-2 py-1 text-xs rounded',
                    workflow.state === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  )}>
                    {workflow.state}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Repositories Grid */}
      {!loading && repos.length > 0 && activeTab === 'repos' && (
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
                        <Lock className="h-3.5 w-3.5 text-slate-400" aria-label="Privado" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {repo.fullName}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        const [owner, repoName] = repo.fullName.split('/')
                        navigate(`/github/${owner}/${repoName}`)
                      }}
                      className="rounded-lg p-1.5 text-brand opacity-0 transition hover:bg-brand/10 group-hover:opacity-100 dark:text-brand-light dark:hover:bg-brand/20"
                      aria-label="Abrir repositório"
                    >
                      <FolderGit2 className="h-4 w-4" />
                    </button>
                  </div>
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
