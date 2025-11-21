import { create } from 'zustand'
import type { StateCreator } from 'zustand'
import { useSettingsStore } from '@/store/settingsStore'
import { generateChatResponse } from '@/utils/aiClient'
import type { AiProvider } from '@/store/settingsStore'

export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: number
}

export type ChatSession = {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  provider?: string
  projectContext?: string
}

type ChatState = {
  sessions: ChatSession[]
  activeSessionId: string | null
  isStreaming: boolean
  error?: string
  abortController: AbortController | null
  sendMessage: (content: string) => Promise<void>
  setActiveSession: (id: string) => void
  newSession: () => void
  deleteSession: (id: string) => void
  editMessage: (sessionId: string, messageId: string, newContent: string) => void
  stopGeneration: () => void
  setSessionProvider: (sessionId: string, provider: string) => void
  setSessionProjectContext: (sessionId: string, projectPath: string) => Promise<void>
}

const createMessage = (role: ChatRole, content: string): ChatMessage => ({
  id: crypto.randomUUID(),
  role,
  content,
  createdAt: Date.now(),
})

const createSession = (title = 'Nova sessão'): ChatSession => {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title,
    messages: [
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Olá! Pronto para acelerar seu desenvolvimento hoje?',
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  }
}

const chatCreator: StateCreator<ChatState> = (set, get) => ({
  sessions: [createSession('Sessão inicial')],
  activeSessionId: null,
  isStreaming: false,
  abortController: null,
  sendMessage: async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) {
      return
    }

    const state = get()
    const sessionId = state.activeSessionId ?? state.sessions[0]?.id

    if (!sessionId) {
      const session = createSession()
      set({ sessions: [session], activeSessionId: session.id })
      return get().sendMessage(trimmed)
    }

    const providerState = useSettingsStore.getState()
    const sessionIndex = state.sessions.findIndex((item) => item.id === sessionId)

    if (sessionIndex === -1) {
      return
    }

    const targetSession = state.sessions[sessionIndex]
    const userMessage = createMessage('user', trimmed)

    const nextSessions = [...state.sessions]
    nextSessions[sessionIndex] = {
      ...targetSession,
      messages: [...targetSession.messages, userMessage],
      updatedAt: Date.now(),
    }

    const abortController = new AbortController()
    set({ sessions: nextSessions, isStreaming: true, error: undefined, abortController })

    try {
      const provider = targetSession.provider || providerState.provider
      const apiKey = providerState.apiKeys[provider as AiProvider]
      if (!apiKey && provider !== 'ollama') {
        throw new Error('API key não configurada para este provedor')
      }

      // Adiciona contexto do projeto se disponível
      let finalPrompt = trimmed
      if (targetSession.projectContext) {
        finalPrompt = `Contexto do projeto:\n${targetSession.projectContext}\n\nPergunta: ${trimmed}`
      }

      const response = await generateChatResponse({
        provider: provider as AiProvider,
        api_key: apiKey || '',
        prompt: finalPrompt,
        history: targetSession.messages,
      })

      const assistantMessage = createMessage('assistant', response.content)

      set((current) => {
        const updatedSessions = current.sessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                messages: [...session.messages, assistantMessage],
                updatedAt: Date.now(),
              }
            : session,
        )
        return { sessions: updatedSessions, isStreaming: false, abortController: null }
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        set({ isStreaming: false, abortController: null })
        return
      }
      
      set({
        isStreaming: false,
        abortController: null,
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível gerar uma resposta. Verifique suas credenciais.',
      })
    }
  },
  setActiveSession: (id: string) => {
    set({ activeSessionId: id })
  },
  newSession: () => {
    const session = createSession()
    set((state) => ({
      sessions: [session, ...state.sessions],
      activeSessionId: session.id,
    }))
  },
  deleteSession: (id: string) => {
    set((state) => {
      const filtered = state.sessions.filter((session) => session.id !== id)
      const nextActive =
        state.activeSessionId === id ? filtered[0]?.id ?? null : state.activeSessionId
      return {
        sessions: filtered.length > 0 ? filtered : [createSession()],
        activeSessionId: nextActive,
      }
    })
  },
  editMessage: (sessionId: string, messageId: string, newContent: string) => {
    set((state) => {
      const sessions = state.sessions.map((session) => {
        if (session.id !== sessionId) return session

        const messageIndex = session.messages.findIndex((msg) => msg.id === messageId)
        if (messageIndex === -1) return session

        // Remove mensagens após a editada
        const updatedMessages = session.messages.slice(0, messageIndex + 1)
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: newContent,
        }

        return {
          ...session,
          messages: updatedMessages,
          updatedAt: Date.now(),
        }
      })

      return { sessions }
    })
  },
  stopGeneration: () => {
    const { abortController } = get()
    if (abortController) {
      abortController.abort()
      set({ isStreaming: false, abortController: null })
    }
  },
  setSessionProvider: (sessionId: string, provider: string) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId ? { ...session, provider } : session
      ),
    }))
  },
  setSessionProjectContext: async (sessionId: string, projectPath: string) => {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const analysis = await invoke<{ summary: string }>('analyze_project_structure', {
        path: projectPath,
      })

      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === sessionId
            ? { ...session, projectContext: analysis.summary }
            : session
        ),
      }))
    } catch (error) {
      console.error('Erro ao analisar projeto:', error)
      throw error
    }
  },
})

export const useChatStore = create<ChatState>()(chatCreator)
