import { create } from 'zustand'
import type { StateCreator } from 'zustand'
import { useSettingsStore } from '@/store/settingsStore'
import { generateChatResponse } from '@/utils/aiClient'

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
}

type ChatState = {
  sessions: ChatSession[]
  activeSessionId: string | null
  isStreaming: boolean
  error?: string
  sendMessage: (content: string) => Promise<void>
  setActiveSession: (id: string) => void
  newSession: () => void
  deleteSession: (id: string) => void
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

    set({ sessions: nextSessions, isStreaming: true, error: undefined })

    try {
      const apiKey = providerState.apiKeys[providerState.provider]
      if (!apiKey && providerState.provider !== 'ollama') {
        throw new Error('API key não configurada para este provedor')
      }

      const response = await generateChatResponse({
        provider: providerState.provider,
        api_key: apiKey || '',
        prompt: trimmed,
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
        return { sessions: updatedSessions, isStreaming: false }
      })
    } catch (error) {
      set({
        isStreaming: false,
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
})

export const useChatStore = create<ChatState>()(chatCreator)
