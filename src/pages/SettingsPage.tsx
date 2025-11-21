import { useState, useEffect } from 'react'
import { Settings2, Key, Cpu, Shield, Save, Eye, EyeOff, Github, CheckCircle2 } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import type { AiProvider } from '@/store/settingsStore'
import { useGitHubStore } from '@/store/githubStore'
import { clsx } from 'clsx'

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', description: 'GPT-4o, GPT-3.5' },
  { value: 'anthropic', label: 'Anthropic', description: 'Claude 3.5' },
  { value: 'gemini', label: 'Google Gemini', description: 'Gemini 1.5 Pro' },
  { value: 'cohere', label: 'Cohere', description: 'Command R+' },
  { value: 'mistral', label: 'Mistral AI', description: 'Mistral Large' },
  { value: 'groq', label: 'Groq', description: 'Ultra-rápido' },
  { value: 'deepseek', label: 'DeepSeek', description: 'DeepSeek Coder' },
  { value: 'ollama', label: 'Ollama', description: 'Modelos Locais' },
] as const

export default function SettingsPage() {
  const theme = useSettingsStore((state) => state.theme)
  const provider = useSettingsStore((state) => state.provider)
  const apiKeys = useSettingsStore((state) => state.apiKeys)
  const setProvider = useSettingsStore((state) => state.setProvider)
  const setApiKey = useSettingsStore((state) => state.setApiKey)
  const clearApiKeys = useSettingsStore((state) => state.clearApiKeys)

  const connected = useGitHubStore((state) => state.connected)
  const githubUser = useGitHubStore((state) => state.user)
  const connectGitHub = useGitHubStore((state) => state.connectGitHub)
  const githubLoading = useGitHubStore((state) => state.loading)
  const githubError = useGitHubStore((state) => state.error)

  const [tempKeys, setTempKeys] = useState<Partial<Record<AiProvider, string>>>(apiKeys)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)
  const [githubToken, setGithubToken] = useState('')
  const [githubSaved, setGithubSaved] = useState(false)

  // Sync tempKeys with apiKeys when they change
  useEffect(() => {
    setTempKeys(apiKeys)
  }, [apiKeys])

  const handleSaveKeys = async () => {
    for (const [prov, key] of Object.entries(tempKeys)) {
      if (key) {
        await setApiKey(prov as AiProvider, key)
      }
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleConnectGitHub = async () => {
    if (!githubToken.trim()) return
    
    // Save token to localStorage for later use
    localStorage.setItem('github_token', githubToken)
    
    await connectGitHub(githubToken)
    if (!githubError) {
      setGithubSaved(true)
      setTimeout(() => setGithubSaved(false), 2000)
    }
  }

  const toggleShowKey = (prov: string) => {
    setShowKeys((prev) => ({ ...prev, [prov]: !prev[prov] }))
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-300/50 bg-white/60 p-6 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20">
            <Settings2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Configurações
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gerencie preferências, integrações e segurança
            </p>
          </div>
        </div>
      </div>

      {/* Theme Section */}
      <div className="rounded-xl border border-slate-300/50 bg-white/60 p-6 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Aparência</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 dark:text-slate-400">Tema atual:</span>
          <span className="rounded-lg bg-brand/10 px-3 py-1 text-sm font-medium text-brand dark:bg-brand/20 dark:text-brand-light">
            {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Sistema'}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Altere o tema usando o botão no canto superior direito da tela.
        </p>
      </div>

      {/* AI Provider */}
      <div className="rounded-xl border border-slate-300/50 bg-white/60 p-6 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40">
        <div className="mb-4 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Provedor de IA Padrão
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROVIDERS.map((prov) => (
            <button
              key={prov.value}
              onClick={() => setProvider(prov.value)}
              className={clsx(
                'rounded-xl border p-3 text-left transition',
                provider === prov.value
                  ? 'border-brand/50 bg-brand/10 shadow-md dark:bg-brand/20'
                  : 'border-slate-300/50 bg-white/80 hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-700/50 dark:hover:bg-slate-700',
              )}
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{prov.label}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {prov.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* GitHub Integration */}
      <div className="rounded-xl border border-slate-300/50 bg-white/60 p-6 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40">
        <div className="mb-4 flex items-center gap-2">
          <Github className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Integração GitHub
          </h3>
        </div>

        {connected && githubUser ? (
          <div className="flex items-center justify-between rounded-lg border border-green-300/50 bg-green-50/60 p-4 backdrop-blur-sm dark:border-green-700/50 dark:bg-green-900/20">
            <div className="flex items-center gap-3">
              <img
                src={githubUser.avatarUrl}
                alt={githubUser.name}
                className="h-10 w-10 rounded-full border-2 border-green-500/30"
              />
              <div>
                <p className="flex items-center gap-2 font-semibold text-green-900 dark:text-green-100">
                  <CheckCircle2 className="h-4 w-4" />
                  Conectado como {githubUser.name}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">@{githubUser.login}</p>
              </div>
            </div>
            <a
              href="#/github"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            >
              Ver Repositórios
            </a>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Conecte sua conta do GitHub para acessar seus repositórios e integrações.
            </p>
            
            {githubError && (
              <div className="mb-4 rounded-lg border border-red-300 bg-red-50/80 px-4 py-3 text-sm text-red-700 backdrop-blur-sm dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-400">
                {githubError}
              </div>
            )}

            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="Cole seu Personal Access Token do GitHub..."
                  className="w-full rounded-lg border border-slate-300/50 bg-white/80 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-sm transition focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>
              <button
                onClick={handleConnectGitHub}
                disabled={!githubToken.trim() || githubLoading}
                className="flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/30 transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-light dark:hover:bg-brand"
              >
                {githubSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Conectado!
                  </>
                ) : (
                  <>
                    <Github className="h-4 w-4" />
                    {githubLoading ? 'Conectando...' : 'Conectar'}
                  </>
                )}
              </button>
            </div>
            
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Crie um token em{' '}
              <a
                href="https://github.com/settings/tokens/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                github.com/settings/tokens
              </a>{' '}
              com permissões de repo.
            </p>
          </>
        )}
      </div>

      {/* API Keys */}
      <div className="rounded-xl border border-slate-300/50 bg-white/60 p-6 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">API Keys</h3>
          </div>
          <button
            onClick={clearApiKeys}
            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Limpar Todas
          </button>
        </div>

        <div className="space-y-4">
          {PROVIDERS.filter((p) => p.value !== 'ollama').map((prov) => (
            <div key={prov.value}>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {prov.label}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKeys[prov.value] ? 'text' : 'password'}
                    value={tempKeys[prov.value] || ''}
                    onChange={(e) =>
                      setTempKeys((prev) => ({ ...prev, [prov.value]: e.target.value }))
                    }
                    placeholder={`Cole sua API key do ${prov.label}...`}
                    className="w-full rounded-lg border border-slate-300/50 bg-white/80 px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-sm transition focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey(prov.value)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showKeys[prov.value] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSaveKeys}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark hover:shadow-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/60 dark:bg-brand-light dark:hover:bg-brand"
            >
              <Save className="h-4 w-4" />
              {saved ? 'Salvo!' : 'Salvar Chaves'}
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border border-blue-300/50 bg-blue-50/60 p-4 backdrop-blur-sm dark:border-blue-700/50 dark:bg-blue-900/20">
        <p className="text-xs leading-relaxed text-blue-800 dark:text-blue-300">
          <strong>Dica:</strong> As API keys são armazenadas localmente no seu dispositivo
          de forma segura usando o Tauri Store. Para usar o Ollama, basta instalar e rodar
          localmente — não é necessário API key.
        </p>
      </div>
    </div>
  )
}
