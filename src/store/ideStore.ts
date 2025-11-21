import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StateCreator } from 'zustand'

type IDEState = {
  lastOpenedPath: string | null
  setLastOpenedPath: (path: string) => void
}

const ideCreator: StateCreator<IDEState> = (set) => ({
  lastOpenedPath: null,
  setLastOpenedPath: (path: string) => {
    set({ lastOpenedPath: path })
  },
})

export const useIDEStore = create<IDEState>()(
  persist(ideCreator, {
    name: 'ide-storage',
    partialize: (state) => ({
      lastOpenedPath: state.lastOpenedPath,
    }),
  })
)
