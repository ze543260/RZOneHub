import { Palette, Check } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import type { ThemeName } from '@/store/settingsStore'

interface ThemeOption {
  value: ThemeName
  label: string
  description: string
  preview: {
    bg: string
    bgSecondary: string
    text: string
    accent: string
  }
}

const themes: ThemeOption[] = [
  {
    value: 'default-light',
    label: 'Default Light',
    description: 'Tema claro padrão',
    preview: {
      bg: 'rgb(248, 250, 252)',
      bgSecondary: 'rgb(241, 245, 249)',
      text: 'rgb(15, 23, 42)',
      accent: 'rgb(139, 92, 246)',
    },
  },
  {
    value: 'default-dark',
    label: 'Default Dark',
    description: 'Tema escuro padrão',
    preview: {
      bg: 'rgb(15, 23, 42)',
      bgSecondary: 'rgb(30, 41, 59)',
      text: 'rgb(248, 250, 252)',
      accent: 'rgb(139, 92, 246)',
    },
  },
  {
    value: 'github-light',
    label: 'GitHub Light',
    description: 'Inspirado no GitHub',
    preview: {
      bg: 'rgb(255, 255, 255)',
      bgSecondary: 'rgb(246, 248, 250)',
      text: 'rgb(36, 41, 47)',
      accent: 'rgb(9, 105, 218)',
    },
  },
  {
    value: 'github-dark',
    label: 'GitHub Dark',
    description: 'GitHub modo escuro',
    preview: {
      bg: 'rgb(13, 17, 23)',
      bgSecondary: 'rgb(22, 27, 34)',
      text: 'rgb(230, 237, 243)',
      accent: 'rgb(88, 166, 255)',
    },
  },
  {
    value: 'monokai',
    label: 'Monokai',
    description: 'Clássico para código',
    preview: {
      bg: 'rgb(39, 40, 34)',
      bgSecondary: 'rgb(49, 51, 45)',
      text: 'rgb(248, 248, 240)',
      accent: 'rgb(249, 38, 114)',
    },
  },
  {
    value: 'dracula',
    label: 'Dracula',
    description: 'Popular tema vampiro',
    preview: {
      bg: 'rgb(40, 42, 54)',
      bgSecondary: 'rgb(68, 71, 90)',
      text: 'rgb(248, 248, 242)',
      accent: 'rgb(189, 147, 249)',
    },
  },
  {
    value: 'nord',
    label: 'Nord',
    description: 'Paleta ártica',
    preview: {
      bg: 'rgb(46, 52, 64)',
      bgSecondary: 'rgb(59, 66, 82)',
      text: 'rgb(236, 239, 244)',
      accent: 'rgb(136, 192, 208)',
    },
  },
  {
    value: 'solarized-light',
    label: 'Solarized Light',
    description: 'Solarized claro',
    preview: {
      bg: 'rgb(253, 246, 227)',
      bgSecondary: 'rgb(238, 232, 213)',
      text: 'rgb(101, 123, 131)',
      accent: 'rgb(38, 139, 210)',
    },
  },
  {
    value: 'solarized-dark',
    label: 'Solarized Dark',
    description: 'Solarized escuro',
    preview: {
      bg: 'rgb(0, 43, 54)',
      bgSecondary: 'rgb(7, 54, 66)',
      text: 'rgb(131, 148, 150)',
      accent: 'rgb(42, 161, 152)',
    },
  },
  {
    value: 'one-dark',
    label: 'One Dark',
    description: 'Atom One Dark',
    preview: {
      bg: 'rgb(40, 44, 52)',
      bgSecondary: 'rgb(33, 37, 43)',
      text: 'rgb(171, 178, 191)',
      accent: 'rgb(97, 175, 239)',
    },
  },
  {
    value: 'tokyo-night',
    label: 'Tokyo Night',
    description: 'Noite em Tóquio',
    preview: {
      bg: 'rgb(26, 27, 38)',
      bgSecondary: 'rgb(36, 40, 59)',
      text: 'rgb(169, 177, 214)',
      accent: 'rgb(125, 207, 255)',
    },
  },
  {
    value: 'catppuccin',
    label: 'Catppuccin',
    description: 'Tema suave e pastel',
    preview: {
      bg: 'rgb(30, 30, 46)',
      bgSecondary: 'rgb(49, 50, 68)',
      text: 'rgb(205, 214, 244)',
      accent: 'rgb(203, 166, 247)',
    },
  },
  {
    value: 'rzone-harmony',
    label: 'RZOne Harmony',
    description: '🎨 Tema oficial RZOne',
    preview: {
      bg: 'rgb(249, 250, 251)',
      bgSecondary: 'rgb(243, 244, 246)',
      text: 'rgb(17, 24, 39)',
      accent: 'rgb(59, 130, 246)',
    },
  },
]

export default function ThemeSelector() {
  const themeName = useSettingsStore((state) => state.themeName)
  const setThemeName = useSettingsStore((state) => state.setThemeName)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">Tema de Cores</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => (
          <button
            key={theme.value}
            onClick={() => setThemeName(theme.value)}
            className={`group relative overflow-hidden rounded-xl border p-4 text-left transition ${
              themeName === theme.value
                ? 'border-brand/50 bg-brand/5 shadow-md dark:bg-brand/10'
                : 'border-slate-300/50 bg-white/80 hover:border-slate-400/50 hover:shadow-sm dark:border-slate-700/50 dark:bg-slate-700/50 dark:hover:border-slate-600/50'
            }`}
          >
            {themeName === theme.value && (
              <div className="absolute right-2 top-2 rounded-full bg-brand p-1 text-white shadow-md">
                <Check className="h-3 w-3" />
              </div>
            )}

            <div className="mb-3 flex h-12 gap-1 rounded-lg border border-slate-200/50 p-1 dark:border-slate-600/50">
              <div
                className="flex-1 rounded"
                style={{ backgroundColor: theme.preview.bg }}
              />
              <div
                className="flex-1 rounded"
                style={{ backgroundColor: theme.preview.bgSecondary }}
              />
              <div
                className="w-2 rounded"
                style={{ backgroundColor: theme.preview.accent }}
              />
            </div>

            <div className="space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                {theme.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {theme.description}
              </p>
            </div>

            <div className="mt-2 flex gap-1">
              <div
                className="h-3 w-3 rounded-full border border-white/20"
                style={{ backgroundColor: theme.preview.bg }}
                title="Background"
              />
              <div
                className="h-3 w-3 rounded-full border border-white/20"
                style={{ backgroundColor: theme.preview.text }}
                title="Text"
              />
              <div
                className="h-3 w-3 rounded-full border border-white/20"
                style={{ backgroundColor: theme.preview.accent }}
                title="Accent"
              />
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-blue-300/50 bg-blue-50/60 p-3 backdrop-blur-sm dark:border-blue-700/50 dark:bg-blue-900/20">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Dica:</strong> Os temas afetam as cores de fundo, texto e acentos em todo o
          aplicativo. O modo (claro/escuro) pode ser alterado separadamente.
        </p>
      </div>
    </div>
  )
}
