import { create } from 'zustand'
import type { StateCreator } from 'zustand'
import type { Store as TauriStore } from '@tauri-apps/plugin-store'
import { isTauri } from '@/utils/platform'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemeName = 
  | 'default-light' 
  | 'default-dark'
  | 'github-light'
  | 'github-dark'
  | 'monokai'
  | 'dracula'
  | 'nord'
  | 'solarized-light'
  | 'solarized-dark'
  | 'one-dark'
  | 'tokyo-night'
  | 'catppuccin'
  | 'rzone-harmony'

export type AiProvider = 'openai' | 'anthropic' | 'ollama' | 'gemini' | 'cohere' | 'mistral' | 'groq' | 'deepseek'

type PersistedSettings = {
  themeMode: ThemeMode
  themeName: ThemeName
  provider: AiProvider
  apiKeys: Partial<Record<AiProvider, string>>
}

type SettingsState = PersistedSettings & {
  hydrated: boolean
  initialize: () => Promise<void>
  setThemeMode: (value: ThemeMode) => Promise<void>
  setThemeName: (value: ThemeName) => Promise<void>
  setProvider: (value: AiProvider) => Promise<void>
  setApiKey: (provider: AiProvider, key: string) => Promise<void>
  clearApiKeys: () => Promise<void>
}

const DEFAULT_SETTINGS: PersistedSettings = {
  themeMode: 'system',
  themeName: 'default-dark',
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
    const { themeMode, themeName, provider, apiKeys } = get()
    console.log('[Settings] Saving to Tauri Store:', { themeMode, themeName, provider, apiKeys })
    await store.set('settings', { themeMode, themeName, provider, apiKeys })
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
    setThemeMode: async (value: ThemeMode) => {
      set({ themeMode: value })
      await sync()
    },
    setThemeName: async (value: ThemeName) => {
      set({ themeName: value })
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
