import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type OnboardingState = {
  completed: boolean
  currentStep: number
  githubConnected: boolean
  aiConfigured: boolean
  completeOnboarding: () => void
  setStep: (step: number) => void
  setGithubConnected: (connected: boolean) => void
  setAiConfigured: (configured: boolean) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      currentStep: 0,
      githubConnected: false,
      aiConfigured: false,
      completeOnboarding: () => set({ completed: true }),
      setStep: (step) => set({ currentStep: step }),
      setGithubConnected: (connected) => set({ githubConnected: connected }),
      setAiConfigured: (configured) => set({ aiConfigured: configured }),
      reset: () =>
        set({
          completed: false,
          currentStep: 0,
          githubConnected: false,
          aiConfigured: false,
        }),
    }),
    {
      name: 'onboarding-storage',
    },
  ),
)
