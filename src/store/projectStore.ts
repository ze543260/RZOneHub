import { create } from 'zustand'
import type { StateCreator } from 'zustand'
import { isTauri } from '@/utils/platform'

export type FileTypeStat = {
  extension: string
  count: number
}

export type ProjectAnalysis = {
  totalFiles: number
  totalDirectories: number
  fileTypes: FileTypeStat[]
  largestFiles: { path: string; size: number }[]
  suggestions: string[]
  scannedAt: number
}

type ProjectState = {
  analysis?: ProjectAnalysis
  loading: boolean
  error?: string
  analyze: (relativePath?: string) => Promise<void>
}

const fallbackAnalysis: ProjectAnalysis = {
  totalFiles: 42,
  totalDirectories: 9,
  fileTypes: [
    { extension: 'ts', count: 18 },
    { extension: 'tsx', count: 10 },
    { extension: 'rs', count: 6 },
    { extension: 'json', count: 5 },
  ],
  largestFiles: [
    { path: 'src-tauri/src/main.rs', size: 4820 },
    { path: 'src/App.tsx', size: 3150 },
  ],
  suggestions: [
    'Adicionar testes automatizados para os comandos Tauri mais críticos.',
    'Configurar CI para lint e build a cada PR.',
    'Documentar as integrações de IA no README para novos contribuidores.',
  ],
  scannedAt: Date.now(),
}

type AnalyzeProjectResponse = {
  total_files: number
  total_directories: number
  file_types: Array<{ extension: string; count: number }>
  largest_files: Array<{ path: string; size: number }>
  suggestions: string[]
}

const projectCreator: StateCreator<ProjectState> = (set) => ({
  loading: false,
  analyze: async (relativePath?: string) => {
    set({ loading: true, error: undefined })
    try {
      if (!isTauri()) {
        set({ analysis: fallbackAnalysis, loading: false })
        return
      }
      const { invoke } = await import('@tauri-apps/api/core')
      const result = (await invoke('analyze_project_structure', {
        path: relativePath ?? null,
      })) as AnalyzeProjectResponse

      set({
        analysis: {
          totalFiles: result.total_files,
          totalDirectories: result.total_directories,
          fileTypes: result.file_types,
          largestFiles: result.largest_files,
          suggestions: result.suggestions,
          scannedAt: Date.now(),
        },
        loading: false,
      })
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível analisar o projeto agora.',
      })
    }
  },
})

export const useProjectStore = create<ProjectState>()(projectCreator)
