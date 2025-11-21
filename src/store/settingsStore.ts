import { create } from 'zustand'
import type { StateCreator } from 'zustand'
import type { Store as TauriStore } from '@tauri-apps/plugin-store'
import { isTauri } from '@/utils/platform'

export type ThemePreference = 'light' | 'dark' | 'system'
export type AiProvider = 'openai' | 'anthropic' | 'ollama' | 'gemini' | 'cohere' | 'mistral' | 'groq' | 'deepseek'

type PersistedSettings = {
  theme: ThemePreference
  provider: AiProvider
  apiKeys: Partial<Record<AiProvider, string>>
}

type SettingsState = PersistedSettings & {
  hydrated: boolean
  initialize: () => Promise<void>
  setTheme: (value: ThemePreference) => Promise<void>
  setProvider: (value: AiProvider) => Promise<void>
  setApiKey: (provider: AiProvider, key: string) => Promise<void>
  clearApiKeys: () => Promise<void>
}

const DEFAULT_SETTINGS: PersistedSettings = {
  theme: 'system',
  provider: 'openai',
  apiKeys: {},
}

let tauriStore: TauriStore | null = null

async function getTauriStore(): Promise<TauriStore | null> {
  if (!isTauri()) {
    console.log('[Settings] Not running in Tauri')
    return null
  }
  if (tauriStore) {
    return tauriStore
  }
  try {
    const { load } = await import('@tauri-apps/plugin-store')
    console.log('[Settings] Loading Tauri Store...')
    tauriStore = await load('settings.store')
    console.log('[Settings] Tauri Store loaded successfully')
    return tauriStore
  } catch (error) {
    console.error('[Settings] Failed to load Tauri Store:', error)
    return null
  }
}

const storeCreator: StateCreator<SettingsState> = (set, get) => {
  const sync = async () => {
    const store = await getTauriStore()
    if (!store) {
      console.log('[Settings] Tauri Store not available')
      return
    }
    const { theme, provider, apiKeys } = get()
    console.log('[Settings] Saving to Tauri Store:', { theme, provider, apiKeys })
    await store.set('settings', { theme, provider, apiKeys })
    await store.save()
    console.log('[Settings] Saved successfully')
  }

  return {
    ...DEFAULT_SETTINGS,
    hydrated: false,
    initialize: async () => {
      if (get().hydrated) {
        console.log('[Settings] Already hydrated')
        return
      }
      const store = await getTauriStore()
      if (!store) {
        console.log('[Settings] Tauri Store not available, using defaults')
        set({ hydrated: true })
        return
      }
      const stored = (await store.get('settings')) as PersistedSettings | null
      console.log('[Settings] Loaded from Tauri Store:', stored)
      if (stored) {
        set({ ...stored, hydrated: true })
      } else {
        set({ hydrated: true })
      }
    },
    setTheme: async (value: ThemePreference) => {
      set({ theme: value })
      await sync()
    },
    setProvider: async (value: AiProvider) => {
      set({ provider: value })
      await sync()
    },
    setApiKey: async (provider: AiProvider, key: string) => {
      console.log('[Settings] Setting API key for:', provider, 'length:', key.length)
      const next = { ...get().apiKeys, [provider]: key }
      set({ apiKeys: next })
      await sync()
    },
    clearApiKeys: async () => {
      set({ apiKeys: {} })
      await sync()
    },
  }
}

export const useSettingsStore = create<SettingsState>()(storeCreator)
