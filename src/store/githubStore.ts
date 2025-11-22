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
  defaultBranch: string
}

export type GitHubUser = {
  login: string
  name: string
  avatarUrl: string
  bio: string | null
}

export type GitHubIssue = {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  user: {
    login: string
    avatarUrl: string
  }
  createdAt: string
  updatedAt: string
  labels: Array<{ name: string; color: string }>
  comments: number
}

export type GitHubPullRequest = {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed' | 'merged'
  user: {
    login: string
    avatarUrl: string
  }
  createdAt: string
  updatedAt: string
  head: { ref: string }
  base: { ref: string }
  draft: boolean
  mergeable: boolean | null
}

export type GitHubCommit = {
  sha: string
  message: string
  author: {
    name: string
    email: string
    date: string
  }
  url: string
}

export type GitHubBranch = {
  name: string
  commit: { sha: string; url: string }
  protected: boolean
}

export type GitHubRelease = {
  id: number
  tagName: string
  name: string
  body: string | null
  draft: boolean
  prerelease: boolean
  createdAt: string
  publishedAt: string | null
}

export type GitHubWorkflow = {
  id: number
  name: string
  path: string
  state: 'active' | 'deleted' | 'disabled_fork' | 'disabled_inactivity' | 'disabled_manually'
  createdAt: string
  updatedAt: string
}

type GitHubState = {
  user?: GitHubUser
  repos: GitHubRepo[]
  currentRepo?: GitHubRepo
  issues: GitHubIssue[]
  pullRequests: GitHubPullRequest[]
  commits: GitHubCommit[]
  branches: GitHubBranch[]
  releases: GitHubRelease[]
  workflows: GitHubWorkflow[]
  loading: boolean
  error?: string
  connected: boolean
  token?: string
  connectGitHub: (token: string) => Promise<void>
  fetchRepos: () => Promise<void>
  disconnect: () => void
  openRepo: (url: string) => Promise<void>
  setCurrentRepo: (repo: GitHubRepo) => void
  fetchIssues: (owner: string, repo: string) => Promise<void>
  createIssue: (owner: string, repo: string, title: string, body: string, labels?: string[]) => Promise<void>
  fetchPullRequests: (owner: string, repo: string) => Promise<void>
  createPullRequest: (owner: string, repo: string, title: string, body: string, head: string, base: string) => Promise<void>
  fetchCommits: (owner: string, repo: string, branch?: string) => Promise<void>
  fetchBranches: (owner: string, repo: string) => Promise<void>
  createBranch: (owner: string, repo: string, branchName: string, fromBranch?: string) => Promise<void>
  fetchReleases: (owner: string, repo: string) => Promise<void>
  createRelease: (owner: string, repo: string, tagName: string, name: string, body: string, draft?: boolean, prerelease?: boolean) => Promise<void>
  fetchWorkflows: (owner: string, repo: string) => Promise<void>
  triggerWorkflow: (owner: string, repo: string, workflowId: number, ref: string) => Promise<void>
}

const githubCreator: StateCreator<GitHubState> = (set, get) => ({
  repos: [],
  issues: [],
  pullRequests: [],
  commits: [],
  branches: [],
  releases: [],
  workflows: [],
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
  
  setCurrentRepo: (repo: GitHubRepo) => {
    set({ currentRepo: repo })
  },
  
  // Issues
  fetchIssues: async (owner: string, repo: string) => {
    set({ loading: true, error: undefined })
    try {
      const token = get().token
      if (!token) throw new Error('No GitHub token found')

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) throw new Error('Failed to fetch issues')

      const data = await response.json()
      const issues: GitHubIssue[] = data.map((issue: any) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        user: {
          login: issue.user.login,
          avatarUrl: issue.user.avatar_url,
        },
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        labels: issue.labels.map((l: any) => ({ name: l.name, color: l.color })),
        comments: issue.comments,
      }))

      set({ issues, loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to fetch issues' })
    }
  },
  
  createIssue: async (owner: string, repo: string, title: string, body: string, labels?: string[]) => {
    set({ loading: true, error: undefined })
    try {
      const token = get().token
      if (!token) throw new Error('No GitHub token found')

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body, labels }),
      })

      if (!response.ok) throw new Error('Failed to create issue')
      
      set({ loading: false })
      await get().fetchIssues(owner, repo)
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to create issue' })
    }
  },
  
  // Pull Requests
  fetchPullRequests: async (owner: string, repo: string) => {
    set({ loading: true, error: undefined })
    try {
      const token = get().token
      if (!token) throw new Error('No GitHub token found')

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) throw new Error('Failed to fetch pull requests')

      const data = await response.json()
      const pullRequests: GitHubPullRequest[] = data.map((pr: any) => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.merged_at ? 'merged' : pr.state,
        user: {
          login: pr.user.login,
          avatarUrl: pr.user.avatar_url,
        },
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        head: { ref: pr.head.ref },
        base: { ref: pr.base.ref },
        draft: pr.draft,
        mergeable: pr.mergeable,
      }))

      set({ pullRequests, loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to fetch pull requests' })
    }
  },
  
  createPullRequest: async (owner: string, repo: string, title: string, body: string, head: string, base: string) => {
    set({ loading: true, error: undefined })
    try {
      const token = get().token
      if (!token) throw new Error('No GitHub token found')

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body, head, base }),
      })

      if (!response.ok) throw new Error('Failed to create pull request')
      
      set({ loading: false })
      await get().fetchPullRequests(owner, repo)
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to create pull request' })
    }
  },
  
  // Commits
  fetchCommits: async (owner: string, repo: string, branch?: string) => {
    set({ loading: true, error: undefined })
    try {
      const token = get().token
      if (!token) throw new Error('No GitHub token found')

      const url = branch 
        ? `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=30`
        : `https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) throw new Error('Failed to fetch commits')

      const data = await response.json()
      const commits: GitHubCommit[] = data.map((commit: any) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date,
        },
        url: commit.html_url,
      }))

      set({ commits, loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to fetch commits' })
    }
  },
  
  // Branches
  fetchBranches: async (owner: string, repo: string) => {
    set({ loading: true, error: undefined })
    try {
      const token = get().token
      if (!token) throw new Error('No GitHub token found')

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) throw new Error('Failed to fetch branches')

      const data = await response.json()
      const branches: GitHubBranch[] = data.map((branch: any) => ({
        name: branch.name,
        commit: {
          sha: branch.commit.sha,
          url: branch.commit.url,
        },
        protected: branch.protected,
      }))

      set({ branches, loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to fetch branches' })
    }
  },
  
  createBranch: async (owner: string, repo: string, branchName: string, fromBranch?: string) => {
    set({ loading: true, error: undefined })
    try {
      const token = get().token
      if (!token) throw new Error('No GitHub token found')

      // Get SHA of the base branch
      const baseBranch = fromBranch || get().currentRepo?.defaultBranch || 'main'
      const refResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${baseBranch}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!refResponse.ok) throw new Error('Failed to get base branch')
      const refData = await refResponse.json()

      // Create new branch
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: refData.object.sha,
        }),
      })

      if (!response.ok) throw new Error('Failed to create branch')
      
      set({ loading: false })
      await get().fetchBranches(owner, repo)
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to create branch' })
    }
  },
  
  // Releases
  fetchReleases: async (owner: string, repo: string) => {
    set({ loading: true, error: undefined })
    try {
      const token = get().token
      if (!token) throw new Error('No GitHub token found')

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) throw new Error('Failed to fetch releases')

      const data = await response.json()
      const releases: GitHubRelease[] = data.map((release: any) => ({
        id: release.id,
        tagName: release.tag_name,
        name: release.name,
        body: release.body,
        draft: release.draft,
        prerelease: release.prerelease,
        createdAt: release.created_at,
        publishedAt: release.published_at,
      }))

      set({ releases, loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to fetch releases' })
    }
  },
  
  createRelease: async (owner: string, repo: string, tagName: string, name: string, body: string, draft = false, prerelease = false) => {
    set({ loading: true, error: undefined })
    try {
      const token = get().token
      if (!token) throw new Error('No GitHub token found')

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag_name: tagName, name, body, draft, prerelease }),
      })

      if (!response.ok) throw new Error('Failed to create release')
      
      set({ loading: false })
      await get().fetchReleases(owner, repo)
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to create release' })
    }
  },
  
  // Workflows
  fetchWorkflows: async (owner: string, repo: string) => {
    set({ loading: true, error: undefined })
    try {
      const token = get().token
      if (!token) throw new Error('No GitHub token found')

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) throw new Error('Failed to fetch workflows')

      const data = await response.json()
      const workflows: GitHubWorkflow[] = data.workflows.map((workflow: any) => ({
        id: workflow.id,
        name: workflow.name,
        path: workflow.path,
        state: workflow.state,
        createdAt: workflow.created_at,
        updatedAt: workflow.updated_at,
      }))

      set({ workflows, loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to fetch workflows' })
    }
  },
  
  triggerWorkflow: async (owner: string, repo: string, workflowId: number, ref: string) => {
    set({ loading: true, error: undefined })
    try {
      const token = get().token
      if (!token) throw new Error('No GitHub token found')

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref }),
      })

      if (!response.ok) throw new Error('Failed to trigger workflow')
      
      set({ loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to trigger workflow' })
    }
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
