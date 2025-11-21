import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StateCreator } from 'zustand'
import { isTauri } from '@/utils/platform'

export type GitHubRepo = {
  id: number
  name: string
  fullName: string
  description: string | null
  private: boolean
  language: string | null
  stars: number
  forks: number
  updatedAt: string
  url: string
}

export type GitHubUser = {
  login: string
  name: string
  avatarUrl: string
  bio: string | null
}

type GitHubState = {
  user?: GitHubUser
  repos: GitHubRepo[]
  loading: boolean
  error?: string
  connected: boolean
  token?: string
  connectGitHub: (token: string) => Promise<void>
  fetchRepos: () => Promise<void>
  disconnect: () => void
  openRepo: (url: string) => Promise<void>
}

const githubCreator: StateCreator<GitHubState> = (set, get) => ({
  repos: [],
  loading: false,
  connected: false,
  
  connectGitHub: async (token: string) => {
    set({ loading: true, error: undefined })
    try {
      if (!isTauri()) {
        throw new Error('GitHub integration only works in Tauri environment')
      }

      const { invoke } = await import('@tauri-apps/api/core')
      const isValid = await invoke<boolean>('connect_github', { token })
      
      if (isValid) {
        // Fetch user info and repos
        const response = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch GitHub user')
        }
        
        const userData = await response.json()
        
        set({
          user: {
            login: userData.login,
            name: userData.name || userData.login,
            avatarUrl: userData.avatar_url,
            bio: userData.bio,
          },
          connected: true,
          token,
          loading: false,
        })
        
        // Fetch repos
        await get().fetchRepos()
      } else {
        throw new Error('Invalid GitHub token')
      }
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to connect to GitHub',
      })
    }
  },
  
  fetchRepos: async () => {
    set({ loading: true, error: undefined })
    try {
      const token = get().token
      
      if (!isTauri()) {
        // Fallback data for development
        set({
          repos: [
            {
              id: 1,
              name: 'awesome-project',
              fullName: 'user/awesome-project',
              description: 'An awesome project with React and TypeScript',
              private: false,
              language: 'TypeScript',
              stars: 42,
              forks: 7,
              updatedAt: new Date().toISOString(),
              url: 'https://github.com/user/awesome-project',
            },
            {
              id: 2,
              name: 'rust-backend',
              fullName: 'user/rust-backend',
              description: 'High-performance backend written in Rust',
              private: true,
              language: 'Rust',
              stars: 15,
              forks: 3,
              updatedAt: new Date().toISOString(),
              url: 'https://github.com/user/rust-backend',
            },
          ],
          loading: false,
        })
        return
      }

      if (!token) {
        throw new Error('No GitHub token found')
      }

      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }

      const data = await response.json()
      
      const repos: GitHubRepo[] = data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        private: repo.private,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updatedAt: repo.updated_at,
        url: repo.html_url,
      }))

      set({ repos, loading: false })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch repositories',
      })
    }
  },
  
  disconnect: () => {
    set({ user: undefined, repos: [], connected: false, token: undefined })
  },
  
  openRepo: async (_url: string) => {
    // URL não é mais necessária - apenas redireciona para a página do visualizador
    // A URL será usada apenas para extrair owner/repo no componente
  },
})

export const useGitHubStore = create<GitHubState>()(
  persist(githubCreator, {
    name: 'github-storage',
    partialize: (state) => ({
      user: state.user,
      connected: state.connected,
      token: state.token,
    }),
  })
)
