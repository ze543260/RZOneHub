import { useState } from 'react'
import {
  Sparkles,
  Github,
  Brain,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Key,
  Cpu,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useSettingsStore } from '@/store/settingsStore'
import type { AiProvider } from '@/store/settingsStore'
import { clsx } from 'clsx'

const AI_PROVIDERS = [
  {
    value: 'openai',
    label: 'OpenAI',
    description: 'GPT-4o, GPT-4 Turbo, GPT-3.5',
    icon: '🤖',
    requiresKey: true,
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus',
    icon: '🧠',
    requiresKey: true,
  },
  {
    value: 'gemini',
    label: 'Google Gemini',
    description: 'Gemini 1.5 Pro, Gemini Flash',
    icon: '✨',
    requiresKey: true,
  },
  {
    value: 'cohere',
    label: 'Cohere',
    description: 'Command R+, Command R',
    icon: '🔮',
    requiresKey: true,
  },
  {
    value: 'mistral',
    label: 'Mistral AI',
    description: 'Mistral Large, Mistral Medium',
    icon: '🌬️',
    requiresKey: true,
  },
  {
    value: 'groq',
    label: 'Groq',
    description: 'Llama 3, Mixtral (Ultra-rápido)',
    icon: '⚡',
    requiresKey: true,
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    description: 'DeepSeek Coder, DeepSeek Chat',
    icon: '🔍',
    requiresKey: true,
  },
  {
    value: 'ollama',
    label: 'Ollama',
    description: 'Llama 3, CodeLlama, Mistral (Local)',
    icon: '🦙',
    requiresKey: false,
  },
] as const

export default function WelcomePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>('openai')
  const [apiKey, setApiKey] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [showGithubToken, setShowGithubToken] = useState(false)

  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding)
  const setProviderStore = useSettingsStore((state) => state.setProvider)
  const setApiKeyStore = useSettingsStore((state) => state.setApiKey)

  const handleFinish = async () => {
    // Salvar configurações
    await setProviderStore(selectedProvider)
    if (apiKey && selectedProvider !== 'ollama') {
      await setApiKeyStore(selectedProvider, apiKey)
    }

    // Marcar onboarding como completo
    completeOnboarding()
    navigate('/chat')
  }

  const handleSkip = () => {
    completeOnboarding()
    navigate('/chat')
  }

  const currentProviderInfo = AI_PROVIDERS.find((p) => p.value === selectedProvider)

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-purple-50 to-blue-50 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-purple-600 shadow-2xl shadow-brand/50">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-slate-900 dark:text-white">
            Bem-vindo ao AI Dev Hub
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Configure seu assistente inteligente em poucos passos
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={clsx(
                'h-2 w-16 rounded-full transition-all duration-300',
                i <= step
                  ? 'bg-brand shadow-lg shadow-brand/50'
                  : 'bg-slate-300 dark:bg-slate-700',
              )}
            />
          ))}
        </div>

        {/* Content Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-300/50 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/80">
          <div className="p-8">
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                    Vamos começar!
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Configure o AI Dev Hub em 3 passos rápidos para aproveitar ao máximo
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-700/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        1. Escolha seu provedor de IA
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        OpenAI, Anthropic, Gemini, Cohere, Mistral, Groq, DeepSeek ou Ollama
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-700/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
                      <Github className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        2. Conecte com GitHub (opcional)
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Para versionamento e análise de repositórios
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-700/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/20 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        3. Pronto para usar!
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Comece a desenvolver com assistência de IA
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: AI Provider */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <Cpu className="h-8 w-8" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                    Escolha seu provedor de IA
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Selecione qual serviço de IA você deseja usar
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {AI_PROVIDERS.map((provider) => (
                    <button
                      key={provider.value}
                      onClick={() => setSelectedProvider(provider.value)}
                      className={clsx(
                        'rounded-xl border p-5 text-center transition',
                        selectedProvider === provider.value
                          ? 'border-brand/50 bg-brand/10 shadow-lg shadow-brand/20 dark:bg-brand/20'
                          : 'border-slate-300/50 bg-white/80 hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-700/50 dark:hover:bg-slate-700',
                      )}
                    >
                      <div className="mb-2 text-3xl">{provider.icon}</div>
                      <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">
                        {provider.label}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {provider.description}
                      </p>
                    </button>
                  ))}
                </div>

                {currentProviderInfo?.requiresKey && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      <div className="mb-2 flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        API Key do {currentProviderInfo.label}
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`Cole sua API key do ${currentProviderInfo.label}...`}
                        className="w-full rounded-lg border border-slate-300/50 bg-white/80 px-4 py-3 pr-12 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-sm transition focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showApiKey ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Você pode obter sua chave em{' '}
                      <a
                        href={
                          selectedProvider === 'openai'
                            ? 'https://platform.openai.com/api-keys'
                            : selectedProvider === 'anthropic'
                              ? 'https://console.anthropic.com/settings/keys'
                              : selectedProvider === 'gemini'
                                ? 'https://aistudio.google.com/app/apikey'
                                : selectedProvider === 'cohere'
                                  ? 'https://dashboard.cohere.com/api-keys'
                                  : selectedProvider === 'mistral'
                                    ? 'https://console.mistral.ai/api-keys'
                                    : selectedProvider === 'groq'
                                      ? 'https://console.groq.com/keys'
                                      : 'https://platform.deepseek.com/api_keys'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:underline"
                      >
                        {selectedProvider === 'openai'
                          ? 'platform.openai.com'
                          : selectedProvider === 'anthropic'
                            ? 'console.anthropic.com'
                            : selectedProvider === 'gemini'
                              ? 'aistudio.google.com'
                              : selectedProvider === 'cohere'
                                ? 'dashboard.cohere.com'
                                : selectedProvider === 'mistral'
                                  ? 'console.mistral.ai'
                                  : selectedProvider === 'groq'
                                    ? 'console.groq.com'
                                    : 'platform.deepseek.com'}
                      </a>
                    </p>
                  </div>
                )}

                {selectedProvider === 'ollama' && (
                  <div className="rounded-lg border border-blue-300/50 bg-blue-50/60 p-4 backdrop-blur-sm dark:border-blue-700/50 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Ollama</strong> roda modelos localmente no seu computador. Você
                      precisará instalá-lo e baixar modelos como{' '}
                      <code className="rounded bg-blue-200 px-1 dark:bg-blue-800">
                        llama3
                      </code>{' '}
                      ou{' '}
                      <code className="rounded bg-blue-200 px-1 dark:bg-blue-800">
                        codellama
                      </code>
                      . Não é necessário API key.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: GitHub */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                    <Github className="h-8 w-8" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                    Conectar com GitHub
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Opcional: conecte sua conta para versionamento e análise de repositórios
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Personal Access Token (opcional)
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showGithubToken ? 'text' : 'password'}
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        className="w-full rounded-lg border border-slate-300/50 bg-white/80 px-4 py-3 pr-12 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-sm transition focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGithubToken(!showGithubToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showGithubToken ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Crie um token em{' '}
                      <a
                        href="https://github.com/settings/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:underline"
                      >
                        github.com/settings/tokens
                      </a>{' '}
                      com permissões de <code>repo</code>
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-300/50 bg-amber-50/60 p-4 backdrop-blur-sm dark:border-amber-700/50 dark:bg-amber-900/20">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      <strong>Nota:</strong> Esta etapa é totalmente opcional. Você pode
                      pular e configurar depois nas configurações do aplicativo.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Recursos com GitHub conectado:
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                        Análise de repositórios públicos e privados
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                        Sugestões baseadas no histórico de commits
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                        Integração com pull requests e issues
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-300/50 bg-slate-50/50 p-6 dark:border-slate-700/50 dark:bg-slate-800/50">
            <button
              onClick={() => (step > 0 ? setStep(step - 1) : null)}
              disabled={step === 0}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200/60 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>

            <div className="flex gap-3">
              {step > 0 && (
                <button
                  onClick={handleSkip}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/50"
                >
                  Pular
                </button>
              )}
              <button
                onClick={() => {
                  if (step < 2) {
                    setStep(step + 1)
                  } else {
                    handleFinish()
                  }
                }}
                className="flex items-center gap-2 rounded-lg bg-brand px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark hover:shadow-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/60 dark:bg-brand-light dark:hover:bg-brand"
              >
                {step < 2 ? (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Finalizar
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Skip Link */}
        <div className="mt-6 text-center">
          <button
            onClick={handleSkip}
            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Configurar depois →
          </button>
        </div>
      </div>
    </div>
  )
}
