import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { isTauri } from '@/utils/platform'
import { useIDEStore } from '@/store/ideStore'

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
    // Padrões de regex para syntax highlighting básico
    const patterns: Record<string, Array<{ pattern: RegExp; className: string }>> = {
      javascript: [
        { pattern: /(\/\/.*$)/gm, className: 'text-slate-500 italic' },
        { pattern: /(\/\*[\s\S]*?\*\/)/g, className: 'text-slate-500 italic' },
        { pattern: /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|class|extends|import|export|from|default|async|await|try|catch|throw|new)\b/g, className: 'text-purple-400 font-semibold' },
        { pattern: /\b(true|false|null|undefined|NaN|Infinity)\b/g, className: 'text-orange-400' },
        { pattern: /\b(\d+)\b/g, className: 'text-green-400' },
        { pattern: /(["'`])(.*?)\1/g, className: 'text-yellow-300' },
      ],
      typescript: [
        { pattern: /(\/\/.*$)/gm, className: 'text-slate-500 italic' },
        { pattern: /(\/\*[\s\S]*?\*\/)/g, className: 'text-slate-500 italic' },
        { pattern: /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|class|extends|import|export|from|default|async|await|try|catch|throw|new|interface|type|enum|public|private|protected|readonly)\b/g, className: 'text-purple-400 font-semibold' },
        { pattern: /\b(string|number|boolean|any|void|never|unknown)\b/g, className: 'text-cyan-400' },
        { pattern: /\b(true|false|null|undefined|NaN|Infinity)\b/g, className: 'text-orange-400' },
        { pattern: /\b(\d+)\b/g, className: 'text-green-400' },
        { pattern: /(["'`])(.*?)\1/g, className: 'text-yellow-300' },
      ],
      python: [
        { pattern: /(#.*$)/gm, className: 'text-slate-500 italic' },
        { pattern: /("""[\s\S]*?"""|'''[\s\S]*?''')/g, className: 'text-slate-500 italic' },
        { pattern: /\b(def|class|return|if|elif|else|for|while|break|continue|pass|import|from|as|try|except|finally|raise|with|yield|lambda|global|nonlocal)\b/g, className: 'text-purple-400 font-semibold' },
        { pattern: /\b(True|False|None)\b/g, className: 'text-orange-400' },
        { pattern: /\b(\d+)\b/g, className: 'text-green-400' },
        { pattern: /(["'])(.*?)\1/g, className: 'text-yellow-300' },
      ],
      rust: [
        { pattern: /(\/\/.*$)/gm, className: 'text-slate-500 italic' },
        { pattern: /(\/\*[\s\S]*?\*\/)/g, className: 'text-slate-500 italic' },
        { pattern: /\b(fn|let|mut|const|struct|enum|impl|trait|pub|use|mod|crate|self|super|type|where|unsafe|async|await|move|ref|static|match|if|else|loop|for|while|break|continue|return)\b/g, className: 'text-purple-400 font-semibold' },
        { pattern: /\b(i8|i16|i32|i64|i128|u8|u16|u32|u64|u128|f32|f64|bool|char|str|String|Vec|Option|Result)\b/g, className: 'text-cyan-400' },
        { pattern: /\b(true|false|Some|None|Ok|Err)\b/g, className: 'text-orange-400' },
        { pattern: /\b(\d+)\b/g, className: 'text-green-400' },
        { pattern: /(["'])(.*?)\1/g, className: 'text-yellow-300' },
      ],
      json: [
        { pattern: /("(?:[^"\\]|\\.)*")\s*:/g, className: 'text-blue-400' },
        { pattern: /:\s*("(?:[^"\\]|\\.)*")/g, className: 'text-yellow-300' },
        { pattern: /\b(true|false|null)\b/g, className: 'text-orange-400' },
        { pattern: /:\s*(-?\d+\.?\d*)/g, className: 'text-green-400' },
      ],
    }

    const langPatterns = patterns[language] || patterns.javascript
    
    return (
      <span className="text-slate-100">
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
    <div className="flex h-full flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-300/50 bg-white/60 px-4 py-3 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <Code2 className="h-5 w-5 text-brand" />
          <h2 className="font-semibold text-slate-900 dark:text-white">IDE</h2>
          {projectPath && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {projectPath}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={selectFolder}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark dark:bg-brand-light dark:hover:bg-brand"
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
        <div className="w-64 border-r border-slate-300/50 bg-white/40 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/20">
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
                <pre className="h-full overflow-auto p-4 font-mono text-sm leading-relaxed">
                  <code className={`language-${activeFileData.language}`}>
                    {highlightCode(activeFileData.content, activeFileData.language)}
                  </code>
                </pre>
                <textarea
                  value={activeFileData.content}
                  onChange={(e) =>
                    updateFileContent(activeFileData.path, e.target.value)
                  }
                  className="absolute inset-0 h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-transparent caret-white focus:outline-none"
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

          {/* Terminal */}
          {showTerminal && (
            <div className="flex h-64 flex-col border-t border-slate-300/50 bg-slate-900 dark:border-slate-700/50">
              <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <TerminalIcon className="h-4 w-4" />
                  <span>Terminal</span>
                </div>
                <button
                  onClick={() => setShowTerminal(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                {terminalOutput.map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.startsWith('$')
                        ? 'text-green-400'
                        : line.startsWith('✗')
                        ? 'text-red-400'
                        : line.startsWith('✓')
                        ? 'text-green-400'
                        : 'text-slate-300'
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
              <form onSubmit={runTerminalCommand} className="border-t border-slate-700 p-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    className="flex-1 bg-transparent font-mono text-sm text-slate-100 focus:outline-none"
                    placeholder="Digite um comando..."
                  />
                </div>
              </form>
            </div>
          )}

          {/* Toggle Terminal Button */}
          {!showTerminal && (
            <button
              onClick={() => setShowTerminal(true)}
              className="flex items-center gap-2 border-t border-slate-300/50 bg-white/60 px-4 py-2 text-sm text-slate-700 hover:bg-white/80 dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/60"
            >
              <TerminalIcon className="h-4 w-4" />
              Mostrar Terminal
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
