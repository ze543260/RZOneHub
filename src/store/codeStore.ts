import { create } from 'zustand'
import type { StateCreator } from 'zustand'
import { generateCodeSnippet } from '@/utils/aiClient'
import { useSettingsStore } from '@/store/settingsStore'

export type CodeSnippet = {
  id: string
  title: string
  language: string
  description: string
  content: string
  createdAt: number
}

type CodeState = {
  snippets: CodeSnippet[]
  isGenerating: boolean
  error?: string
  generateSnippet: (description: string, language: string) => Promise<void>
  removeSnippet: (id: string) => void
  clearHistory: () => void
}

const codeCreator: StateCreator<CodeState> = (set) => ({
  snippets: [],
  isGenerating: false,
  generateSnippet: async (description: string, language: string) => {
    const trimmed = description.trim()
    if (!trimmed) {
      return
    }

    const { provider, apiKeys } = useSettingsStore.getState()

    set({ isGenerating: true, error: undefined })
    try {
      const apiKey = apiKeys[provider]
      if (!apiKey && provider !== 'ollama') {
        throw new Error('API key não configurada para este provedor')
      }

      const snippet = await generateCodeSnippet({
        provider,
        api_key: apiKey || '',
        description: trimmed,
        language,
      })

      const record: CodeSnippet = {
        id: crypto.randomUUID(),
        title: `${language} snippet`,
        language,
        description: trimmed,
        content: snippet.code,
        createdAt: Date.now(),
      }

      set((state) => ({ snippets: [record, ...state.snippets], isGenerating: false }))
    } catch (error) {
      set({
        isGenerating: false,
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível gerar o snippet. Tente novamente.',
      })
    }
  },
  removeSnippet: (id: string) => {
    set((state) => ({ snippets: state.snippets.filter((item) => item.id !== id) }))
  },
  clearHistory: () => set({ snippets: [] }),
})

export const useCodeStore = create<CodeState>()(codeCreator)
