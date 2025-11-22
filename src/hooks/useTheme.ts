import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

const prefersDark = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

export function useTheme() {
  const themeMode = useSettingsStore((state) => state.themeMode)
  const themeName = useSettingsStore((state) => state.themeName)

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = (mode: typeof themeMode, name: typeof themeName) => {
      console.log('[Theme] Applying theme:', { mode, name })
      
      const shouldUseDark =
        mode === 'dark' || (mode === 'system' && prefersDark())
      
      // Remove all theme classes
      root.classList.remove('dark', 'light')
      root.className = root.className.replace(/theme-[\w-]+/g, '').trim()
      
      // Apply mode (dark/light)
      root.classList.add(shouldUseDark ? 'dark' : 'light')
      
      // Apply theme name
      root.classList.add(`theme-${name}`)
      
      console.log('[Theme] Classes applied:', root.className)
      
      // Set CSS variables based on theme
      const themes = {
        'default-light': {
          '--theme-bg': '248 250 252',
          '--theme-bg-secondary': '241 245 249',
          '--theme-text': '15 23 42',
          '--theme-text-secondary': '71 85 105',
          '--theme-border': '226 232 240',
          '--theme-accent': '139 92 246',
        },
        'default-dark': {
          '--theme-bg': '15 23 42',
          '--theme-bg-secondary': '30 41 59',
          '--theme-text': '248 250 252',
          '--theme-text-secondary': '148 163 184',
          '--theme-border': '51 65 85',
          '--theme-accent': '139 92 246',
        },
        'github-light': {
          '--theme-bg': '255 255 255',
          '--theme-bg-secondary': '246 248 250',
          '--theme-text': '36 41 47',
          '--theme-text-secondary': '87 96 106',
          '--theme-border': '208 215 222',
          '--theme-accent': '9 105 218',
        },
        'github-dark': {
          '--theme-bg': '13 17 23',
          '--theme-bg-secondary': '22 27 34',
          '--theme-text': '230 237 243',
          '--theme-text-secondary': '139 148 158',
          '--theme-border': '48 54 61',
          '--theme-accent': '88 166 255',
        },
        'monokai': {
          '--theme-bg': '39 40 34',
          '--theme-bg-secondary': '49 51 45',
          '--theme-text': '248 248 240',
          '--theme-text-secondary': '117 113 94',
          '--theme-border': '73 72 62',
          '--theme-accent': '249 38 114',
        },
        'dracula': {
          '--theme-bg': '40 42 54',
          '--theme-bg-secondary': '68 71 90',
          '--theme-text': '248 248 242',
          '--theme-text-secondary': '98 114 164',
          '--theme-border': '68 71 90',
          '--theme-accent': '189 147 249',
        },
        'nord': {
          '--theme-bg': '46 52 64',
          '--theme-bg-secondary': '59 66 82',
          '--theme-text': '236 239 244',
          '--theme-text-secondary': '143 188 187',
          '--theme-border': '67 76 94',
          '--theme-accent': '136 192 208',
        },
        'solarized-light': {
          '--theme-bg': '253 246 227',
          '--theme-bg-secondary': '238 232 213',
          '--theme-text': '101 123 131',
          '--theme-text-secondary': '147 161 161',
          '--theme-border': '238 232 213',
          '--theme-accent': '38 139 210',
        },
        'solarized-dark': {
          '--theme-bg': '0 43 54',
          '--theme-bg-secondary': '7 54 66',
          '--theme-text': '131 148 150',
          '--theme-text-secondary': '88 110 117',
          '--theme-border': '7 54 66',
          '--theme-accent': '42 161 152',
        },
        'one-dark': {
          '--theme-bg': '40 44 52',
          '--theme-bg-secondary': '33 37 43',
          '--theme-text': '171 178 191',
          '--theme-text-secondary': '92 99 112',
          '--theme-border': '60 64 73',
          '--theme-accent': '97 175 239',
        },
        'tokyo-night': {
          '--theme-bg': '26 27 38',
          '--theme-bg-secondary': '36 40 59',
          '--theme-text': '169 177 214',
          '--theme-text-secondary': '86 95 137',
          '--theme-border': '36 40 59',
          '--theme-accent': '125 207 255',
        },
        'catppuccin': {
          '--theme-bg': '30 30 46',
          '--theme-bg-secondary': '49 50 68',
          '--theme-text': '205 214 244',
          '--theme-text-secondary': '147 153 178',
          '--theme-border': '49 50 68',
          '--theme-accent': '203 166 247',
        },
        'rzone-harmony': {
          '--theme-bg': '249 250 251',
          '--theme-bg-secondary': '243 244 246',
          '--theme-text': '17 24 39',
          '--theme-text-secondary': '107 114 128',
          '--theme-border': '229 231 235',
          '--theme-accent': '59 130 246',
        },
      }
      
      const themeVars = themes[name] || themes['default-dark']
      console.log('[Theme] Setting CSS variables:', themeVars)
      Object.entries(themeVars).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })
      
      // Special handling for RZOne Harmony in dark mode
      if (name === 'rzone-harmony' && shouldUseDark) {
        root.style.setProperty('--theme-bg', '17 24 39')
        root.style.setProperty('--theme-bg-secondary', '31 41 55')
        root.style.setProperty('--theme-text', '249 250 251')
        root.style.setProperty('--theme-text-secondary', '156 163 175')
        root.style.setProperty('--theme-border', '55 65 81')
        root.style.setProperty('--theme-accent', '96 165 250')
      }
      
      console.log('[Theme] Theme applied successfully')
    }

    console.log('[Theme] useTheme effect running with:', { themeMode, themeName })
    applyTheme(themeMode, themeName)

    if (themeMode !== 'system') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      applyTheme(themeMode, themeName)
    }

    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [themeMode, themeName])
}
