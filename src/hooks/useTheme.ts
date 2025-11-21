import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

const prefersDark = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

export function useTheme() {
  const theme = useSettingsStore((state) => state.theme)

  useEffect(() => {
    const root = document.body
    const applyTheme = (target: typeof theme) => {
      const shouldUseDark =
        target === 'dark' || (target === 'system' && prefersDark())
      root.classList.toggle('dark', shouldUseDark)
    }

    applyTheme(theme)

    if (theme !== 'system') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (event: MediaQueryListEvent) => {
      applyTheme(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [theme])
}
