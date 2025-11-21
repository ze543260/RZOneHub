import { useEffect, useRef, useState } from 'react'
import { Send, Plus, Trash2, Loader2 } from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import { clsx } from 'clsx'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sessions = useChatStore((state) => state.sessions)
  const activeSessionId = useChatStore((state) => state.activeSessionId)
  const isStreaming = useChatStore((state) => state.isStreaming)
  const error = useChatStore((state) => state.error)
  const sendMessage = useChatStore((state) => state.sendMessage)
  const setActiveSession = useChatStore((state) => state.setActiveSession)
  const newSession = useChatStore((state) => state.newSession)
  const deleteSession = useChatStore((state) => state.deleteSession)

  const currentSession = sessions.find((s) => s.id === activeSessionId) ?? sessions[0]

  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSession(sessions[0].id)
    }
  }, [activeSessionId, sessions, setActiveSession])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentSession?.messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    await sendMessage(input)
    setInput('')
  }

  return (
    <div className="flex h-full gap-4">
      {/* Sessions Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col gap-3 md:flex">
        <button
          onClick={newSession}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300/50 bg-white/60 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white/80 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800/60"
        >
          <Plus className="h-4 w-4" />
          Nova Sessão
        </button>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-xl border border-slate-300/50 bg-white/40 p-3 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/30">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={clsx(
                'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
                session.id === currentSession?.id
                  ? 'bg-brand/20 text-brand shadow-sm dark:bg-brand/30 dark:text-brand-light'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/50',
              )}
            >
              <button
                onClick={() => setActiveSession(session.id)}
                className="flex-1 truncate text-left font-medium"
              >
                {session.title}
              </button>
              {sessions.length > 1 && (
                <button
                  onClick={() => deleteSession(session.id)}
                  className="opacity-0 transition hover:text-red-500 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-300/50 bg-white/40 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/30">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentSession?.messages.map((message) => (
            <div
              key={message.id}
              className={clsx(
                'mb-4 flex',
                message.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={clsx(
                  'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
                  message.role === 'user'
                    ? 'bg-brand text-white dark:bg-brand-light'
                    : 'border border-slate-300/50 bg-white/80 text-slate-800 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-100',
                )}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          {isStreaming && (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando resposta...
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50/80 px-4 py-3 text-sm text-red-700 backdrop-blur-sm dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-300/50 bg-white/60 p-4 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isStreaming}
              className="flex-1 rounded-xl border border-slate-300/50 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-sm transition focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50 dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark hover:shadow-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/60 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-light dark:hover:bg-brand"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
