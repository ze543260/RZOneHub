import { useState } from 'react'
import { Code2, Copy, Download, Trash2, Loader2, Sparkles } from 'lucide-react'
import { useCodeStore } from '@/store/codeStore'
import { clsx } from 'clsx'

const LANGUAGES = [
  { value: 'typescript', label: 'TypeScript', color: 'bg-blue-500' },
  { value: 'python', label: 'Python', color: 'bg-yellow-500' },
  { value: 'rust', label: 'Rust', color: 'bg-orange-500' },
  { value: 'javascript', label: 'JavaScript', color: 'bg-amber-500' },
  { value: 'go', label: 'Go', color: 'bg-cyan-500' },
  { value: 'java', label: 'Java', color: 'bg-red-500' },
]

export default function CodeGeneratorPage() {
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('typescript')

  const snippets = useCodeStore((state) => state.snippets)
  const isGenerating = useCodeStore((state) => state.isGenerating)
  const error = useCodeStore((state) => state.error)
  const generateSnippet = useCodeStore((state) => state.generateSnippet)
  const removeSnippet = useCodeStore((state) => state.removeSnippet)
  const clearHistory = useCodeStore((state) => state.clearHistory)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || isGenerating) return
    await generateSnippet(description, language)
    setDescription('')
  }

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content)
  }

  const handleDownload = (snippet: (typeof snippets)[0]) => {
    const extensions: Record<string, string> = {
      typescript: 'ts',
      python: 'py',
      rust: 'rs',
      javascript: 'js',
      go: 'go',
      java: 'java',
    }
    const ext = extensions[snippet.language] || 'txt'
    const blob = new Blob([snippet.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `snippet-${snippet.id.slice(0, 8)}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Generator Form */}
      <div className="rounded-xl border border-slate-300/50 bg-white/60 p-6 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Gerador de Código
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Descreva o que você precisa e deixe a IA criar para você
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Linguagem
            </label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => setLanguage(lang.value)}
                  className={clsx(
                    'flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition',
                    language === lang.value
                      ? 'border-brand/50 bg-brand/10 text-brand shadow-sm dark:bg-brand/20 dark:text-brand-light'
                      : 'border-slate-300/50 bg-white/80 text-slate-600 hover:bg-slate-100 dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-400 dark:hover:bg-slate-700',
                  )}
                >
                  <span className={clsx('h-2 w-2 rounded-full', lang.color)} />
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Crie uma função que valida email usando regex..."
              rows={4}
              disabled={isGenerating}
              className="w-full rounded-lg border border-slate-300/50 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-sm transition focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50 dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50/80 px-4 py-3 text-sm text-red-700 backdrop-blur-sm dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!description.trim() || isGenerating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark hover:shadow-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/60 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-light dark:hover:bg-brand"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Code2 className="h-4 w-4" />
                  Gerar Código
                </>
              )}
            </button>
            {snippets.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="rounded-xl border border-red-300/50 bg-red-50/60 px-4 py-3 text-sm font-semibold text-red-600 backdrop-blur-sm transition hover:bg-red-100/80 dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                Limpar Histórico
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Snippets History */}
      {snippets.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Snippets Gerados ({snippets.length})
            </h3>
          </div>
          <div className="space-y-4">
            {snippets.map((snippet) => (
              <div
                key={snippet.id}
                className="rounded-xl border border-slate-300/50 bg-white/60 shadow-md backdrop-blur-md transition hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-800/40"
              >
                <div className="flex items-start justify-between border-b border-slate-300/50 p-4 dark:border-slate-700/50">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {snippet.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {snippet.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(snippet.content)}
                      className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                      title="Copiar"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(snippet)}
                      className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeSnippet(snippet.id)}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <pre className="overflow-x-auto bg-slate-950 p-4 text-xs text-slate-100">
                  <code>{snippet.content}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
