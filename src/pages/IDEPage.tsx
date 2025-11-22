import { useState, useEffect, useRef } from 'react'
import {
  FileText,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Save,
  Terminal as TerminalIcon,
  Code2,
  X,
  Loader2,
  FileJson,
  FileCode,
  Image,
  Database,
  Settings,
  Package,
  Lock,
  FileType,
  Braces,
  GitBranch,
  Sparkles,
  Lightbulb,
  Wand2,
  MessageSquare,
  Send,
} from 'lucide-react'
import { isTauri } from '@/utils/platform'
import { useIDEStore } from '@/store/ideStore'
import { useSettingsStore } from '@/store/settingsStore'
import Terminal from '@/components/Terminal'

type FileNode = {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
  expanded?: boolean
}

type OpenFile = {
  path: string
  name: string
  content: string
  language: string
  modified: boolean
}

export default function IDEPage() {
  const lastOpenedPath = useIDEStore((state) => state.lastOpenedPath)
  const setLastOpenedPath = useIDEStore((state) => state.setLastOpenedPath)
  const aiProvider = useSettingsStore((state) => state.aiProvider)
  const apiKey = useSettingsStore((state) => state.apiKeys[state.aiProvider])
  
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([])
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'Terminal integrado - Digite comandos abaixo',
  ])
  const [terminalInput, setTerminalInput] = useState('')
  const [projectPath, setProjectPath] = useState<string | null>(null)
  const [showTerminal, setShowTerminal] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [loadingDir, setLoadingDir] = useState<string | null>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // AI Assist states
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiChat, setAiChat] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])

  // Estados para redimensionamento
  const [sidebarWidth, setSidebarWidth] = useState(256) // 64 * 4 = 256px (w-64)
  const [terminalHeight, setTerminalHeight] = useState(300)
  const [isResizingSidebar, setIsResizingSidebar] = useState(false)
  const [isResizingTerminal, setIsResizingTerminal] = useState(false)

  // Handlers de redimensionamento
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        const newWidth = e.clientX
        if (newWidth >= 200 && newWidth <= 600) {
          setSidebarWidth(newWidth)
        }
      }
      if (isResizingTerminal) {
        const newHeight = window.innerHeight - e.clientY
        if (newHeight >= 100 && newHeight <= 600) {
          setTerminalHeight(newHeight)
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizingSidebar(false)
      setIsResizingTerminal(false)
    }

    if (isResizingSidebar || isResizingTerminal) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = isResizingSidebar ? 'ew-resize' : 'ns-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizingSidebar, isResizingTerminal])

  useEffect(() => {
    if (isTauri() && !initialized) {
      setInitialized(true)
      // Tenta carregar o último diretório aberto
      if (lastOpenedPath) {
        loadDirectory(lastOpenedPath)
      } else {
        loadCurrentDirectory()
      }
    }
  }, [initialized, lastOpenedPath])

  const loadCurrentDirectory = async () => {
    if (!isTauri()) return

    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const result = await invoke<any>('list_directory', { path: null })
      setFileTree(result.files || [])
      const path = result.path || '.'
      setProjectPath(path)
      setLastOpenedPath(path)
    } catch (error) {
      console.error('Erro ao carregar diretório:', error)
    }
  }

  const loadDirectory = async (path: string) => {
    if (!isTauri()) return

    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const result = await invoke<any>('list_directory', { path })
      setFileTree(result.files || [])
      setProjectPath(path)
      setLastOpenedPath(path)
    } catch (error) {
      console.error('Erro ao carregar diretório:', error)
      // Se falhar, tenta carregar o diretório atual
      loadCurrentDirectory()
    }
  }

  const selectFolder = async () => {
    if (!isTauri()) return

    try {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Selecione o projeto',
      })

      if (selected && typeof selected === 'string') {
        loadDirectory(selected)
      }
    } catch (error) {
      console.error('Erro ao selecionar pasta:', error)
    }
  }

  const toggleDirectory = async (node: FileNode, path: number[]) => {
    if (!node.isDirectory) return

    // Se está expandindo e não tem filhos carregados, busca do backend
    if (!node.expanded && (!node.children || node.children.length === 0)) {
      setLoadingDir(node.path)
      try {
        const { invoke } = await import('@tauri-apps/api/core')
        const children = await invoke<FileNode[]>('expand_directory', {
          path: node.path,
        })

        const updateTreeWithChildren = (
          tree: FileNode[],
          currentPath: number[]
        ): FileNode[] => {
          if (currentPath.length === 0) return tree

          const [index, ...rest] = currentPath
          return tree.map((item, i) => {
            if (i !== index) return item

            if (rest.length === 0) {
              return {
                ...item,
                expanded: true,
                children,
              }
            }

            return {
              ...item,
              children: item.children
                ? updateTreeWithChildren(item.children, rest)
                : item.children,
            }
          })
        }

        setFileTree((prev) => updateTreeWithChildren(prev, path))
      } catch (error) {
        console.error('Erro ao expandir diretório:', error)
      } finally {
        setLoadingDir(null)
      }
      return
    }

    // Apenas alterna expanded state
    const updateTree = (tree: FileNode[], currentPath: number[]): FileNode[] => {
      if (currentPath.length === 0) return tree

      const [index, ...rest] = currentPath
      return tree.map((item, i) => {
        if (i !== index) return item

        if (rest.length === 0) {
          return {
            ...item,
            expanded: !item.expanded,
          }
        }

        return {
          ...item,
          children: item.children
            ? updateTree(item.children, rest)
            : item.children,
        }
      })
    }

    setFileTree((prev) => updateTree(prev, path))
  }

  const openFile = async (filePath: string, fileName: string) => {
    // Verifica se já está aberto
    const existing = openFiles.find((f) => f.path === filePath)
    if (existing) {
      setActiveFile(filePath)
      return
    }

    if (!isTauri()) {
      // Mock para desenvolvimento
      const newFile: OpenFile = {
        path: filePath,
        name: fileName,
        content: `// Conteúdo de exemplo para ${fileName}\n// IDE funciona apenas no Tauri`,
        language: getLanguageFromExtension(fileName),
        modified: false,
      }
      setOpenFiles([...openFiles, newFile])
      setActiveFile(filePath)
      return
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const content = await invoke<string>('read_file_content', {
        path: filePath,
      })

      const newFile: OpenFile = {
        path: filePath,
        name: fileName,
        content,
        language: getLanguageFromExtension(fileName),
        modified: false,
      }

      setOpenFiles([...openFiles, newFile])
      setActiveFile(filePath)
    } catch (error) {
      console.error('Erro ao abrir arquivo:', error)
    }
  }

  const closeFile = (filePath: string) => {
    setOpenFiles(openFiles.filter((f) => f.path !== filePath))
    if (activeFile === filePath) {
      const remaining = openFiles.filter((f) => f.path !== filePath)
      setActiveFile(remaining.length > 0 ? remaining[0].path : null)
    }
  }

  const updateFileContent = (filePath: string, content: string) => {
    setOpenFiles(
      openFiles.map((f) =>
        f.path === filePath ? { ...f, content, modified: true } : f
      )
    )
  }

  const saveFile = async (filePath: string) => {
    const file = openFiles.find((f) => f.path === filePath)
    if (!file || !isTauri()) return

    try {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('write_file_content', {
        path: filePath,
        content: file.content,
      })

      setOpenFiles(
        openFiles.map((f) =>
          f.path === filePath ? { ...f, modified: false } : f
        )
      )

      setTerminalOutput((prev) => [...prev, `✓ Arquivo salvo: ${file.name}`])
    } catch (error) {
      setTerminalOutput((prev) => [
        ...prev,
        `✗ Erro ao salvar: ${error}`,
      ])
    }
  }

  // AI Assist Functions
  const analyzeCodeContext = async () => {
    if (!activeFile || !apiKey) return

    const file = openFiles.find(f => f.path === activeFile)
    if (!file) return

    setAiLoading(true)
    try {
      if (!isTauri()) {
        // Mock suggestions for development
        setAiSuggestions([
          'Adicionar tratamento de erro com try-catch',
          'Extrair esta lógica para uma função separada',
          'Adicionar validação de entrada',
          'Otimizar este loop usando map/filter',
          'Adicionar comentários JSDoc',
        ])
        setAiLoading(false)
        return
      }

      const { invoke } = await import('@tauri-apps/api/core')
      const response = await invoke<{ suggestions: string[] }>('ai_analyze_code', {
        provider: aiProvider,
        apiKey,
        code: file.content,
        language: file.language,
      })

      setAiSuggestions(response.suggestions)
    } catch (error) {
      console.error('AI analysis failed:', error)
      setAiSuggestions([])
    } finally {
      setAiLoading(false)
    }
  }

  const generateCodeWithAI = async (prompt: string) => {
    if (!apiKey) {
      alert('Configure sua chave de API nas configurações')
      return
    }

    setAiLoading(true)
    try {
      if (!isTauri()) {
        // Mock response for development
        const mockCode = `// Código gerado pela IA\nfunction exemplo() {\n  // ${prompt}\n  return "Exemplo de código gerado";\n}`
        setAiChat(prev => [
          ...prev,
          { role: 'user', content: prompt },
          { role: 'assistant', content: mockCode }
        ])
        setAiLoading(false)
        return
      }

      const { invoke } = await import('@tauri-apps/api/core')
      const file = activeFile ? openFiles.find(f => f.path === activeFile) : null
      
      const response = await invoke<{ code: string }>('ai_generate_code', {
        provider: aiProvider,
        apiKey,
        prompt,
        context: file?.content || '',
        language: file?.language || 'javascript',
      })

      setAiChat(prev => [
        ...prev,
        { role: 'user', content: prompt },
        { role: 'assistant', content: response.code }
      ])
    } catch (error) {
      console.error('AI generation failed:', error)
      setAiChat(prev => [
        ...prev,
        { role: 'user', content: prompt },
        { role: 'assistant', content: `Erro ao gerar código: ${error}` }
      ])
    } finally {
      setAiLoading(false)
      setAiPrompt('')
    }
  }

  const insertAICode = (code: string) => {
    if (!activeFile) return

    const file = openFiles.find(f => f.path === activeFile)
    if (!file) return

    // Extract code from markdown code blocks if present
    const codeMatch = code.match(/```[\w]*\n([\s\S]*?)```/)
    const cleanCode = codeMatch ? codeMatch[1] : code

    const updatedContent = file.content + '\n\n' + cleanCode
    
    setOpenFiles(openFiles.map(f => 
      f.path === activeFile 
        ? { ...f, content: updatedContent, modified: true }
        : f
    ))
  }

  const explainSelectedCode = async () => {
    if (!activeFile || !apiKey) return

    const textarea = textareaRef.current
    if (!textarea) return

    const selectedText = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    )

    if (!selectedText) {
      alert('Selecione um trecho de código para explicar')
      return
    }

    await generateCodeWithAI(`Explique o seguinte código:\n\n${selectedText}`)
  }

  const refactorCode = async () => {
    if (!activeFile || !apiKey) return

    const file = openFiles.find(f => f.path === activeFile)
    if (!file) return

    await generateCodeWithAI(`Refatore e melhore o seguinte código:\n\n${file.content}`)
  }

  const addComments = async () => {
    if (!activeFile || !apiKey) return

    const file = openFiles.find(f => f.path === activeFile)
    if (!file) return

    await generateCodeWithAI(`Adicione comentários explicativos ao seguinte código:\n\n${file.content}`)
  }

  const runTerminalCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!terminalInput.trim()) return

    setTerminalOutput((prev) => [...prev, `$ ${terminalInput}`])

    if (!isTauri()) {
      setTerminalOutput((prev) => [
        ...prev,
        'Terminal funciona apenas no Tauri',
      ])
      setTerminalInput('')
      return
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const result = await invoke<string>('run_terminal_command', {
        command: terminalInput,
        cwd: projectPath,
      })

      setTerminalOutput((prev) => [...prev, result])
    } catch (error) {
      setTerminalOutput((prev) => [...prev, `Erro: ${error}`])
    }

    setTerminalInput('')
  }

  const getLanguageFromExtension = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      jsx: 'javascript',
      py: 'python',
      rs: 'rust',
      go: 'go',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      css: 'css',
      html: 'html',
      json: 'json',
      md: 'markdown',
      yml: 'yaml',
      yaml: 'yaml',
    }
    return languageMap[ext || ''] || 'plaintext'
  }

  const highlightCode = (code: string, language: string) => {
    // Cores VIBRANTES - Paleta RZOne Harmony (Azul → Roxo → Rosa)
    const colors = {
      comment: 'text-[#6A9955] italic',              // Verde para comentários
      keyword: 'text-[#C586C0] font-semibold',        // ROXO/MAGENTA vibrante - keywords
      type: 'text-[#4EC9B0]',                         // Cyan - tipos
      literal: 'text-[#569CD6]',                      // AZUL vibrante - true/false/null
      number: 'text-[#B5CEA8]',                       // Verde claro - números
      string: 'text-[#CE9178]',                       // Laranja/Salmão - strings
      function: 'text-[#DCDCAA]',                     // Amarelo - funções
      operator: 'text-[#D4D4D4]',                     // Cinza claro - operadores
      variable: 'text-[#9CDCFE]',                     // Azul claro - variáveis
      property: 'text-[#9CDCFE]',                     // Azul claro - propriedades
      className: 'text-[#4EC9B0]',                    // Cyan - classes
      constant: 'text-[#4FC1FF]',                     // Azul brilhante - constantes
      module: 'text-[#4EC9B0]',                       // Cyan - módulos
      punctuation: 'text-[#D4D4D4]',                  // Cinza - pontuação
      decorator: 'text-[#DCDCAA]',                    // Amarelo - decorators
      tag: 'text-[#569CD6]',                          // AZUL - tags HTML
      attribute: 'text-[#9CDCFE]',                    // Azul claro - atributos
    }
    
    const defaultColors = colors
    
    // Padrões de regex para syntax highlighting avançado
    const patterns: Record<string, Array<{ pattern: RegExp; className: string }>> = {
      javascript: [
        // Comentários
        { pattern: /(\/\/.*$)/gm, className: colors.comment },
        { pattern: /(\/\*[\s\S]*?\*\/)/g, className: colors.comment },
        // Strings (antes de keywords para evitar conflito)
        { pattern: /(["'`])(?:(?=(\\?))\2.)*?\1/g, className: colors.string },
        // Keywords
        { pattern: /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|class|extends|import|export|from|default|async|await|try|catch|throw|new|in|of|typeof|instanceof)\b/g, className: colors.keyword },
        // Funções (nome seguido de parênteses)
        { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, className: colors.function },
        // Classes (após new ou class)
        { pattern: /\b(class|new)\s+([A-Z][a-zA-Z0-9_]*)/g, className: colors.className },
        // Constantes (UPPERCASE)
        { pattern: /\b([A-Z][A-Z0-9_]*)\b/g, className: colors.constant },
        // Literais
        { pattern: /\b(true|false|null|undefined|NaN|Infinity)\b/g, className: colors.literal },
        // Números
        { pattern: /\b(\d+\.?\d*)\b/g, className: colors.number },
        // Propriedades (após ponto)
        { pattern: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, className: colors.property },
      ],
      typescript: [
        // Comentários
        { pattern: /(\/\/.*$)/gm, className: colors.comment },
        { pattern: /(\/\*[\s\S]*?\*\/)/g, className: colors.comment },
        // Strings
        { pattern: /(["'`])(?:(?=(\\?))\2.)*?\1/g, className: colors.string },
        // Keywords
        { pattern: /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|class|extends|import|export|from|default|async|await|try|catch|throw|new|interface|type|enum|public|private|protected|readonly|static|implements|namespace|module|declare|abstract|as|in|of|typeof|instanceof)\b/g, className: colors.keyword },
        // Tipos (após : ou <)
        { pattern: /:\s*([A-Z][a-zA-Z0-9_<>[\]|&]*)/g, className: colors.type },
        { pattern: /\b(string|number|boolean|any|void|never|unknown|Promise|Array|Map|Set|Record|Partial|Required|Pick|Omit)\b/g, className: colors.type },
        // Funções
        { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, className: colors.function },
        // Classes
        { pattern: /\b(class|new|extends|implements)\s+([A-Z][a-zA-Z0-9_]*)/g, className: colors.className },
        // Interfaces/Types
        { pattern: /\b(interface|type)\s+([A-Z][a-zA-Z0-9_]*)/g, className: colors.type },
        // Constantes
        { pattern: /\b([A-Z][A-Z0-9_]*)\b/g, className: colors.constant },
        // Literais
        { pattern: /\b(true|false|null|undefined|NaN|Infinity)\b/g, className: colors.literal },
        // Números
        { pattern: /\b(\d+\.?\d*)\b/g, className: colors.number },
        // Propriedades
        { pattern: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, className: colors.property },
      ],
      python: [
        // Comentários
        { pattern: /(#.*$)/gm, className: colors.comment },
        { pattern: /("""[\s\S]*?"""|'''[\s\S]*?''')/g, className: colors.comment },
        // Strings
        { pattern: /(["'])(?:(?=(\\?))\2.)*?\1/g, className: colors.string },
        { pattern: /(f["'])(?:(?=(\\?))\2.)*?\1/g, className: colors.string },
        // Decorators
        { pattern: /(@[a-zA-Z_][a-zA-Z0-9_]*)/g, className: colors.decorator },
        // Keywords
        { pattern: /\b(def|class|return|if|elif|else|for|while|break|continue|pass|import|from|as|try|except|finally|raise|with|yield|lambda|global|nonlocal|and|or|not|in|is|None|assert|del|exec|print)\b/g, className: colors.keyword },
        // Funções
        { pattern: /\b(def)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, className: colors.function },
        // Classes
        { pattern: /\b(class)\s+([A-Z][a-zA-Z0-9_]*)/g, className: colors.className },
        // Constantes/Classes
        { pattern: /\b([A-Z][A-Z0-9_]*)\b/g, className: colors.constant },
        // Literais
        { pattern: /\b(True|False|None)\b/g, className: colors.literal },
        // Números
        { pattern: /\b(\d+\.?\d*)\b/g, className: colors.number },
        // Propriedades
        { pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)/g, className: colors.property },
      ],
      rust: [
        // Comentários
        { pattern: /(\/\/.*$)/gm, className: colors.comment },
        { pattern: /(\/\*[\s\S]*?\*\/)/g, className: colors.comment },
        // Strings
        { pattern: /(["'])(?:(?=(\\?))\2.)*?\1/g, className: colors.string },
        // Macros
        { pattern: /\b([a-z_][a-z0-9_]*!)/g, className: colors.function },
        // Keywords
        { pattern: /\b(fn|let|mut|const|struct|enum|impl|trait|pub|use|mod|crate|self|super|type|where|unsafe|async|await|move|ref|static|match|if|else|loop|for|while|break|continue|return|as|dyn)\b/g, className: colors.keyword },
        // Tipos primitivos
        { pattern: /\b(i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str)\b/g, className: colors.type },
        // Tipos compostos
        { pattern: /\b(String|Vec|Option|Result|Box|Rc|Arc|RefCell|HashMap|HashSet|BTreeMap|BTreeSet)\b/g, className: colors.type },
        // Funções
        { pattern: /\b(fn)\s+([a-z_][a-z0-9_]*)/g, className: colors.function },
        // Structs/Enums
        { pattern: /\b(struct|enum|trait)\s+([A-Z][a-zA-Z0-9_]*)/g, className: colors.className },
        // Literais
        { pattern: /\b(true|false|Some|None|Ok|Err)\b/g, className: colors.literal },
        // Números
        { pattern: /\b(\d+\.?\d*)\b/g, className: colors.number },
        // Propriedades
        { pattern: /\.([a-z_][a-z0-9_]*)/g, className: colors.property },
      ],
      json: [
        // Chaves (propriedades)
        { pattern: /("(?:[^"\\]|\\.)*")\s*:/g, className: colors.property },
        // Valores string
        { pattern: /:\s*("(?:[^"\\]|\\.)*")/g, className: colors.string },
        // Literais
        { pattern: /\b(true|false|null)\b/g, className: colors.literal },
        // Números
        { pattern: /:\s*(-?\d+\.?\d*)/g, className: colors.number },
      ],
      html: [
        // Comentários
        { pattern: /(<!--[\s\S]*?-->)/g, className: colors.comment },
        // Tags de abertura/fechamento
        { pattern: /(<\/?)([\w-]+)/g, className: colors.tag },
        // Atributos
        { pattern: /\s+([\w-]+)=/g, className: colors.attribute },
        // Valores de atributos
        { pattern: /=(["'])([^"']*)\1/g, className: colors.string },
        // Doctype
        { pattern: /(<!DOCTYPE\s+html>)/gi, className: colors.keyword },
      ],
      css: [
        // Comentários
        { pattern: /(\/\*[\s\S]*?\*\/)/g, className: colors.comment },
        // Seletores
        { pattern: /([.#]?[\w-]+)(?=\s*{)/g, className: colors.className },
        // Propriedades
        { pattern: /([\w-]+)(?=\s*:)/g, className: colors.property },
        // Valores
        { pattern: /:\s*([^;{]+)/g, className: colors.string },
        // Números com unidades
        { pattern: /\b(\d+)(px|em|rem|%|vh|vw)?\b/g, className: colors.number },
        // Cores hex
        { pattern: /(#[0-9a-fA-F]{3,6})/g, className: colors.number },
      ],
    }

    const langPatterns = patterns[language] || patterns.javascript
    
    // Cor de texto padrão - cinza claro, não branco
    const defaultTextColor = 'text-[#D4D4D4]'
    
    return (
      <span className={defaultTextColor}>
        {code.split('\n').map((line, i) => (
          <span key={i} className="block">
            {applyHighlight(line, langPatterns)}
            {'\n'}
          </span>
        ))}
      </span>
    )
  }

  const applyHighlight = (text: string, patterns: Array<{ pattern: RegExp; className: string }>) => {
    const segments: Array<{ text: string; className?: string }> = [{ text }]
    
    patterns.forEach(({ pattern, className }) => {
      const newSegments: Array<{ text: string; className?: string }> = []
      
      segments.forEach(segment => {
        if (segment.className) {
          newSegments.push(segment)
          return
        }
        
        const matches = [...segment.text.matchAll(pattern)]
        if (matches.length === 0) {
          newSegments.push(segment)
          return
        }
        
        let lastIndex = 0
        matches.forEach(match => {
          if (match.index! > lastIndex) {
            newSegments.push({ text: segment.text.slice(lastIndex, match.index) })
          }
          newSegments.push({ text: match[0], className })
          lastIndex = match.index! + match[0].length
        })
        
        if (lastIndex < segment.text.length) {
          newSegments.push({ text: segment.text.slice(lastIndex) })
        }
      })
      
      segments.length = 0
      segments.push(...newSegments)
    })
    
    return segments.map((seg, i) => (
      <span key={i} className={seg.className || ''}>
        {seg.text}
      </span>
    ))
  }

  const getFileIcon = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) {
      // Ícones especiais para pastas específicas
      const folderName = fileName.toLowerCase()
      if (folderName === 'src' || folderName === 'source') {
        return { icon: Folder, color: 'text-blue-500' }
      }
      if (folderName === 'public' || folderName === 'static' || folderName === 'assets') {
        return { icon: Folder, color: 'text-green-500' }
      }
      if (folderName === 'components') {
        return { icon: Folder, color: 'text-cyan-500' }
      }
      if (folderName === 'pages' || folderName === 'views') {
        return { icon: Folder, color: 'text-purple-500' }
      }
      if (folderName === 'utils' || folderName === 'helpers' || folderName === 'lib') {
        return { icon: Folder, color: 'text-amber-500' }
      }
      if (folderName === 'tests' || folderName === '__tests__' || folderName === 'test') {
        return { icon: Folder, color: 'text-red-500' }
      }
      if (folderName === 'docs' || folderName === 'documentation') {
        return { icon: Folder, color: 'text-indigo-500' }
      }
      if (folderName === '.github' || folderName === '.vscode') {
        return { icon: Settings, color: 'text-slate-500' }
      }
      return { icon: Folder, color: 'text-blue-500' }
    }

    const ext = fileName.split('.').pop()?.toLowerCase()
    const name = fileName.toLowerCase()

    // Arquivos especiais por nome
    if (name === 'package.json' || name === 'composer.json') {
      return { icon: Package, color: 'text-green-600' }
    }
    if (name === 'cargo.toml' || name === 'cargo.lock') {
      return { icon: Package, color: 'text-orange-600' }
    }
    if (name === 'dockerfile' || name === '.dockerignore') {
      return { icon: Database, color: 'text-blue-600' }
    }
    if (name === '.gitignore' || name === '.gitattributes') {
      return { icon: GitBranch, color: 'text-orange-500' }
    }
    if (name === 'readme.md' || name === 'readme') {
      return { icon: FileText, color: 'text-blue-500' }
    }
    if (name.startsWith('.env')) {
      return { icon: Lock, color: 'text-yellow-600' }
    }
    if (name === 'tsconfig.json' || name === 'jsconfig.json') {
      return { icon: Settings, color: 'text-blue-600' }
    }
    if (name.includes('config') || name.includes('.config')) {
      return { icon: Settings, color: 'text-slate-600' }
    }

    // Ícones por extensão
    switch (ext) {
      case 'js':
      case 'jsx':
        return { icon: FileCode, color: 'text-yellow-500' }
      case 'ts':
      case 'tsx':
        return { icon: FileCode, color: 'text-blue-500' }
      case 'py':
        return { icon: FileCode, color: 'text-blue-600' }
      case 'rs':
        return { icon: FileCode, color: 'text-orange-600' }
      case 'go':
        return { icon: FileCode, color: 'text-cyan-600' }
      case 'java':
      case 'kt':
      case 'scala':
        return { icon: FileCode, color: 'text-red-600' }
      case 'cpp':
      case 'c':
      case 'h':
      case 'hpp':
        return { icon: FileCode, color: 'text-purple-600' }
      case 'cs':
        return { icon: FileCode, color: 'text-green-600' }
      case 'php':
        return { icon: FileCode, color: 'text-indigo-600' }
      case 'rb':
        return { icon: FileCode, color: 'text-red-500' }
      case 'swift':
        return { icon: FileCode, color: 'text-orange-500' }
      case 'json':
        return { icon: FileJson, color: 'text-yellow-600' }
      case 'yaml':
      case 'yml':
        return { icon: Braces, color: 'text-purple-500' }
      case 'xml':
      case 'html':
      case 'htm':
        return { icon: FileType, color: 'text-orange-500' }
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
        return { icon: FileType, color: 'text-blue-500' }
      case 'md':
      case 'mdx':
        return { icon: FileText, color: 'text-slate-600' }
      case 'txt':
      case 'log':
        return { icon: FileText, color: 'text-slate-500' }
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
      case 'ico':
        return { icon: Image, color: 'text-pink-500' }
      case 'db':
      case 'sql':
      case 'sqlite':
        return { icon: Database, color: 'text-green-600' }
      case 'pdf':
        return { icon: FileText, color: 'text-red-600' }
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz':
        return { icon: Package, color: 'text-amber-600' }
      case 'lock':
        return { icon: Lock, color: 'text-slate-500' }
      case 'toml':
        return { icon: Settings, color: 'text-slate-600' }
      default:
        return { icon: FileText, color: 'text-slate-400' }
    }
  }

  const renderFileTree = (nodes: FileNode[], path: number[] = []) => {
    return nodes.map((node, index) => {
      const currentPath = [...path, index]
      const indent = path.length * 16
      const { icon: FileIcon, color } = getFileIcon(node.name, node.isDirectory)

      return (
        <div key={node.path}>
          <div
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            style={{ paddingLeft: `${indent + 12}px` }}
            onClick={() =>
              node.isDirectory
                ? toggleDirectory(node, currentPath)
                : openFile(node.path, node.name)
            }
          >
            {node.isDirectory ? (
              <>
                {loadingDir === node.path ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                ) : node.expanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                )}
                {node.expanded ? (
                  <FolderOpen className={`h-4 w-4 ${color}`} />
                ) : (
                  <FileIcon className={`h-4 w-4 ${color}`} />
                )}
              </>
            ) : (
              <>
                <span className="w-4" />
                <FileIcon className={`h-4 w-4 ${color}`} />
              </>
            )}
            <span className="text-slate-700 dark:text-slate-300">
              {node.name}
            </span>
          </div>
          {node.isDirectory && node.expanded && node.children && (
            <div>{renderFileTree(node.children, currentPath)}</div>
          )}
        </div>
      )
    })
  }

  const activeFileData = openFiles.find((f) => f.path === activeFile)

  return (
    <div id="ide-page" className="flex h-full flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-300/50 bg-white/60 px-4 py-3 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <Code2 className="h-5 w-5 text-brand" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-300">IDE</h2>
          {projectPath && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {projectPath}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowAIPanel(!showAIPanel)
              if (!showAIPanel && activeFile) {
                analyzeCodeContext()
              }
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              showAIPanel
                ? 'bg-brand text-white hover:bg-brand-dark'
                : 'border border-slate-300/50 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            AI Assist
          </button>
          <button
            onClick={selectFolder}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold transition hover:bg-brand-dark dark:bg-brand-light dark:hover:bg-brand"
          >
            Abrir Pasta
          </button>
          {activeFileData && (
            <button
              onClick={() => saveFile(activeFile!)}
              disabled={!activeFileData.modified}
              className="flex items-center gap-2 rounded-lg border border-slate-300/50 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700/50 dark:bg-slate-700/50 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Save className="h-4 w-4" />
              Salvar {activeFileData.modified && '•'}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - File Explorer */}
        <div 
          className="border-r border-slate-300/50 bg-white/40 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/20"
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className="border-b border-slate-300/50 px-4 py-3 dark:border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              EXPLORADOR
            </h3>
          </div>
          <div className="overflow-y-auto p-2" style={{ height: 'calc(100% - 49px)' }}>
            {fileTree.length > 0 ? (
              renderFileTree(fileTree)
            ) : (
              <p className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                Abra uma pasta para começar
              </p>
            )}
          </div>
        </div>

        {/* Resize Handle - Sidebar */}
        <div
          className="group w-1 cursor-ew-resize bg-slate-300/30 hover:bg-brand/50 dark:bg-slate-700/30 dark:hover:bg-brand/50 transition-colors"
          onMouseDown={() => setIsResizingSidebar(true)}
        >
          <div className="h-full w-full group-hover:bg-brand/20 transition-colors" />
        </div>

        {/* Main Editor Area */}
        <div className="flex flex-1 flex-col">
          {/* Tabs */}
          {openFiles.length > 0 && (
            <div className="flex items-center gap-1 border-b border-slate-300/50 bg-white/40 px-2 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/20">
              {openFiles.map((file) => {
                const { icon: Icon, color } = getFileIcon(file.name, false)
                return (
                  <div
                    key={file.path}
                    className={`group flex items-center gap-2 border-b-2 px-3 py-2 text-sm transition ${
                      activeFile === file.path
                        ? 'border-brand bg-white/80 dark:bg-slate-700/50'
                        : 'border-transparent hover:bg-white/60 dark:hover:bg-slate-700/30'
                    }`}
                    onClick={() => setActiveFile(file.path)}
                  >
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                    <span className="text-slate-700 dark:text-slate-300">
                      {file.name}
                      {file.modified && ' •'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        closeFile(file.path)
                      }}
                      className="opacity-0 transition hover:text-red-500 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 overflow-hidden bg-slate-900 dark:bg-slate-950">
            {activeFileData ? (
              <div className="relative h-full">
                <pre 
                  ref={preRef}
                  className="h-full overflow-auto p-4 font-mono text-sm leading-relaxed pointer-events-none"
                >
                  <code className={`language-${activeFileData.language}`}>
                    {highlightCode(activeFileData.content, activeFileData.language)}
                  </code>
                </pre>
                <textarea
                  ref={textareaRef}
                  value={activeFileData.content}
                  onChange={(e) =>
                    updateFileContent(activeFileData.path, e.target.value)
                  }
                  onScroll={(e) => {
                    if (preRef.current) {
                      preRef.current.scrollTop = e.currentTarget.scrollTop
                      preRef.current.scrollLeft = e.currentTarget.scrollLeft
                    }
                  }}
                  className="absolute inset-0 h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-transparent focus:outline-none"
                  style={{ caretColor: '#3b82f6' }}
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Code2 className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Abra um arquivo para começar a editar
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Terminal Melhorado */}
          <Terminal />
        </div>

        {/* AI Assist Panel */}
        {showAIPanel && (
          <div className="w-96 border-l border-slate-300/50 bg-white/60 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40 flex flex-col">
            <div className="border-b border-slate-300/50 px-4 py-3 dark:border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  AI Assistant
                </h3>
              </div>
              <button
                onClick={() => setShowAIPanel(false)}
                className="p-1 hover:bg-slate-200/50 rounded dark:hover:bg-slate-700/50"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-slate-300/50 dark:border-slate-700/50 space-y-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">AÇÕES RÁPIDAS</p>
              <button
                onClick={explainSelectedCode}
                disabled={aiLoading || !activeFile}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-slate-700 dark:text-slate-300">Explicar Código Selecionado</span>
              </button>
              <button
                onClick={refactorCode}
                disabled={aiLoading || !activeFile}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="h-4 w-4 text-purple-500" />
                <span className="text-slate-700 dark:text-slate-300">Refatorar Código</span>
              </button>
              <button
                onClick={addComments}
                disabled={aiLoading || !activeFile}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-4 w-4 text-green-500" />
                <span className="text-slate-700 dark:text-slate-300">Adicionar Comentários</span>
              </button>
              <button
                onClick={analyzeCodeContext}
                disabled={aiLoading || !activeFile}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-slate-700 dark:text-slate-300">Analisar & Sugerir</span>
              </button>
            </div>

            {/* Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="p-4 border-b border-slate-300/50 dark:border-slate-700/50">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">SUGESTÕES</p>
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200/50 dark:border-yellow-800/30">
                      <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-700 dark:text-slate-300">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat with AI */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiChat.length === 0 && !aiLoading && (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Faça uma pergunta ou peça para gerar código
                    </p>
                  </div>
                )}
                {aiChat.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-brand text-white'
                        : 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                    }`}>
                      <pre className="text-xs whitespace-pre-wrap font-mono">{msg.content}</pre>
                    </div>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => insertAICode(msg.content)}
                        className="text-xs px-2 py-1 bg-brand/10 hover:bg-brand/20 text-brand rounded transition"
                      >
                        Inserir no editor
                      </button>
                    )}
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Gerando resposta...</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-slate-300/50 dark:border-slate-700/50 p-3">
                <form onSubmit={(e) => {
                  e.preventDefault()
                  if (aiPrompt.trim()) {
                    generateCodeWithAI(aiPrompt)
                  }
                }} className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Pergunte algo ou peça código..."
                    disabled={aiLoading}
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50 text-slate-900 dark:text-white disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="p-2 bg-brand hover:bg-brand-dark text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
