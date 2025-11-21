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
  analyze: (projectPath?: string) => Promise<void>
  selectAndAnalyze: () => Promise<void>
  analyzeGitHubRepo: (owner: string, repo: string) => Promise<void>
}

type AnalyzeProjectResponse = {
  total_files: number
  total_directories: number
  file_types: Array<{ extension: string; count: number }>
  largest_files: Array<{ path: string; size: number }>
  suggestions: string[]
}

const projectCreator: StateCreator<ProjectState> = (set, get) => ({
  loading: false,
  analyze: async (projectPath?: string) => {
    set({ loading: true, error: undefined })
    try {
      if (!isTauri()) {
        set({ 
          analysis: undefined,
          loading: false,
          error: 'Análise de projetos só funciona no app Tauri. Por favor, selecione uma pasta.'
        })
        return
      }
      const { invoke } = await import('@tauri-apps/api/core')
      const result = (await invoke('analyze_project_structure', {
        path: projectPath ?? null,
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
  selectAndAnalyze: async () => {
    if (!isTauri()) {
      set({ 
        error: 'Seleção de pasta só funciona no app Tauri.'
      })
      return
    }

    try {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Selecione o projeto para analisar',
      })

      if (selected && typeof selected === 'string') {
        await get().analyze(selected)
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao selecionar pasta',
      })
    }
  },
  analyzeGitHubRepo: async (owner: string, repo: string) => {
    set({ loading: true, error: undefined })
    try {
      const { useGitHubStore } = await import('./githubStore')
      const token = useGitHubStore.getState().token
      
      if (!token) {
        throw new Error('GitHub não está conectado. Por favor, conecte-se primeiro.')
      }

      // Fetch repository tree from GitHub API
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      )

      if (!response.ok) {
        // Try with 'master' branch if 'main' fails
        const masterResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        )
        
        if (!masterResponse.ok) {
          throw new Error('Não foi possível acessar o repositório')
        }
        
        const data = await masterResponse.json()
        const analysis = analyzeGitHubTree(data.tree, owner, repo)
        set({ analysis, loading: false })
        return
      }

      const data = await response.json()
      const analysis = analyzeGitHubTree(data.tree, owner, repo)
      set({ analysis, loading: false })
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível analisar o repositório.',
      })
    }
  },
})

function analyzeGitHubTree(
  tree: Array<{ path: string; type: string; size?: number }>,
  _owner: string,
  _repo: string
): ProjectAnalysis {
  const files = tree.filter((item) => item.type === 'blob')
  const dirs = tree.filter((item) => item.type === 'tree')

  // Count file types
  const fileTypesMap = new Map<string, number>()
  files.forEach((file) => {
    const ext = file.path.split('.').pop()?.toLowerCase()
    if (ext) {
      fileTypesMap.set(ext, (fileTypesMap.get(ext) || 0) + 1)
    }
  })

  const fileTypes = Array.from(fileTypesMap.entries())
    .map(([extension, count]) => ({ extension, count }))
    .sort((a, b) => b.count - a.count)

  // Get largest files
  const largestFiles = files
    .filter((f) => f.size)
    .sort((a, b) => (b.size || 0) - (a.size || 0))
    .slice(0, 10)
    .map((f) => ({ path: f.path, size: f.size || 0 }))

  // Generate suggestions based on repo structure
  const suggestions: string[] = []
  
  const hasTests = files.some((f) => 
    f.path.includes('test') || f.path.includes('spec') || f.path.includes('__tests__')
  )
  if (!hasTests) {
    suggestions.push('Considere adicionar testes automatizados ao projeto.')
  }

  const hasReadme = files.some((f) => f.path.toLowerCase() === 'readme.md')
  if (!hasReadme) {
    suggestions.push('Adicione um arquivo README.md para documentar o projeto.')
  }

  const hasCI = files.some((f) => 
    f.path.includes('.github/workflows') || f.path.includes('.gitlab-ci') || f.path.includes('Jenkinsfile')
  )
  if (!hasCI) {
    suggestions.push('Configure CI/CD para automatizar builds e deploys.')
  }

  if (fileTypes.length > 0 && fileTypes[0].count > files.length * 0.7) {
    suggestions.push(
      `O projeto é predominantemente ${fileTypes[0].extension.toUpperCase()}. Considere modularizar melhor o código.`
    )
  }

  return {
    totalFiles: files.length,
    totalDirectories: dirs.length,
    fileTypes,
    largestFiles,
    suggestions: suggestions.length > 0 ? suggestions : ['Repositório bem estruturado!'],
    scannedAt: Date.now(),
  }
}

export const useProjectStore = create<ProjectState>()(projectCreator)
