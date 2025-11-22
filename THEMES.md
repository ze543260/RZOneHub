# Sistema de Temas

O RZOneHub possui um sistema completo de temas inspirado no VS Code, permitindo aos usuários personalizar completamente a aparência do aplicativo.

## Temas Disponíveis

### Temas Claros
- **Default Light** - Tema claro padrão com cores suaves
- **GitHub Light** - Inspirado na interface clara do GitHub
- **Solarized Light** - Paleta Solarized otimizada para leitura

### Temas Escuros
- **Default Dark** (Padrão) - Tema escuro moderno e equilibrado
- **GitHub Dark** - Interface escura do GitHub
- **Monokai** - Clássico tema para código, popular em editores
- **Dracula** - Tema vampiro com cores vibrantes
- **Nord** - Paleta ártica suave e confortável
- **Solarized Dark** - Solarized otimizado para ambientes escuros
- **One Dark** - Inspirado no Atom One Dark
- **Tokyo Night** - Tema inspirado na noite de Tóquio
- **Catppuccin** - Paleta pastel suave e agradável
- **RZOne Harmony** 🎨 - Tema oficial do RZOne com gradientes modernos e cores vibrantes

## Como Usar

### Alterar o Tema
1. Navegue até **Configurações** no menu lateral
2. Na seção **Tema de Cores**, escolha o tema desejado
3. O tema será aplicado instantaneamente e salvo automaticamente

### Alterar Modo Claro/Escuro
Use o botão **ThemeToggle** no canto inferior direito da tela:
- **☀️ Claro** - Força modo claro
- **🌙 Escuro** - Força modo escuro
- **💻 Sistema** - Segue o tema do sistema operacional

## Personalização de Cores

Cada tema define as seguintes variáveis CSS customizadas:

```css
--theme-bg            /* Cor de fundo principal */
--theme-bg-secondary  /* Cor de fundo secundária */
--theme-text          /* Cor do texto principal */
--theme-text-secondary /* Cor do texto secundário */
--theme-border        /* Cor das bordas */
--theme-accent        /* Cor de destaque/acento */
```

## Usando Cores do Tema em Componentes

Você pode usar as cores do tema atual em seus componentes com as classes Tailwind:

```tsx
<div className="bg-theme-bg text-theme-text border-theme-border">
  <h1 className="text-theme-accent">Título</h1>
  <p className="text-theme-text-secondary">Texto secundário</p>
</div>
```

## Estrutura Técnica

### Aplicação Automática de Temas

O sistema de temas usa **sobrescrições CSS globais** para aplicar as cores automaticamente a todos os componentes existentes, sem necessidade de modificar cada componente individualmente.

**Como funciona:**
1. O hook `useTheme` define variáveis CSS customizadas (`--theme-bg`, `--theme-text`, etc.) no elemento `:root`
2. O arquivo `theme-overrides.css` sobrescreve as classes Tailwind padrão (`bg-white`, `text-slate-900`, etc.) para usar essas variáveis
3. Todos os componentes existentes automaticamente se adaptam ao tema selecionado

**Exemplo:**
```tsx
// Componente usando classes padrão do Tailwind
<div className="bg-white text-slate-900 border-slate-300">
  Conteúdo
</div>

// Automaticamente renderizado como:
<div style="background-color: rgb(var(--theme-bg)); color: rgb(var(--theme-text)); border-color: rgb(var(--theme-border))">
  Conteúdo
</div>
```

### Store (settingsStore.ts)
- `themeMode`: 'light' | 'dark' | 'system'
- `themeName`: Nome do tema ativo
- `setThemeMode(mode)`: Altera o modo claro/escuro
- `setThemeName(name)`: Altera o tema de cores

### Hook (useTheme.ts)
Aplica automaticamente as classes CSS e variáveis do tema selecionado no `<html>`.

### Componentes
- **ThemeToggle** - Botão para alternar modo claro/escuro
- **ThemeSelector** - Galeria visual de todos os temas disponíveis

## Adicionando Novos Temas

Para adicionar um novo tema:

1. **Adicione o tipo em `settingsStore.ts`**:
```typescript
export type ThemeName = 
  | 'default-light'
  // ... outros temas
  | 'meu-tema-novo'
```

2. **Defina as cores em `useTheme.ts`**:
```typescript
const themes = {
  'meu-tema-novo': {
    '--theme-bg': '10 20 30',
    '--theme-bg-secondary': '20 30 40',
    '--theme-text': '240 250 255',
    '--theme-text-secondary': '150 160 170',
    '--theme-border': '50 60 70',
    '--theme-accent': '100 150 200',
  },
  // ... outros temas
}
```

3. **Adicione no seletor em `ThemeSelector.tsx`**:
```typescript
const themes: ThemeOption[] = [
  // ... outros temas
  {
    value: 'meu-tema-novo',
    label: 'Meu Tema Novo',
    description: 'Descrição do tema',
    preview: {
      bg: 'rgb(10, 20, 30)',
      bgSecondary: 'rgb(20, 30, 40)',
      text: 'rgb(240, 250, 255)',
      accent: 'rgb(100, 150, 200)',
    },
  },
]
```

## Persistência

O tema selecionado é automaticamente salvo localmente usando o Tauri Store e permanece ativo entre sessões.
