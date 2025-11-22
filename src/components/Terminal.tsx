import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Plus, 
  X, 
  SplitSquareHorizontal, 
  SplitSquareVertical,
  Minimize2,
  Edit2,
  ChevronDown
} from 'lucide-react';
import { useTerminalStore } from '../store/terminalStore';
import type { TerminalPane } from '../store/terminalStore';

interface TerminalPaneComponentProps {
  pane: TerminalPane;
  isActive: boolean;
  onActivate: () => void;
}

const TerminalPaneComponent: React.FC<TerminalPaneComponentProps> = ({ pane, isActive, onActivate }) => {
  const {
    addSession,
    removeSession,
    setActiveSession,
    renameSession,
    addOutput,
    clearSession,
  } = useTerminalStore();

  const [input, setInput] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);

  const activeSession = pane.sessions.find(s => s.id === pane.activeSessionId);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [activeSession?.history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeSession) return;

    const command = input.trim();
    addOutput(pane.id, activeSession.id, `$ ${command}`);

    // Simulate command execution
    setTimeout(() => {
      let output = '';
      
      if (command === 'clear') {
        clearSession(pane.id, activeSession.id);
        setInput('');
        return;
      } else if (command === 'help') {
        output = `Comandos disponíveis:
  clear      - Limpa o terminal
  help       - Mostra esta mensagem
  ls         - Lista arquivos
  pwd        - Mostra diretório atual
  date       - Mostra data/hora
  echo <msg> - Exibe mensagem
  node -v    - Versão do Node.js
  npm -v     - Versão do npm
  git status - Status do git`;
      } else if (command === 'ls') {
        output = 'src/\npackage.json\nREADME.md\ntsconfig.json\nvite.config.ts';
      } else if (command === 'pwd') {
        output = activeSession.currentDirectory;
      } else if (command === 'date') {
        output = new Date().toString();
      } else if (command.startsWith('echo ')) {
        output = command.slice(5);
      } else if (command === 'node -v') {
        output = 'v20.10.0';
      } else if (command === 'npm -v') {
        output = '10.2.3';
      } else if (command === 'git status') {
        output = `On branch master
Your branch is up to date with 'origin/master'.

nothing to commit, working tree clean`;
      } else {
        output = `✗ Comando não encontrado: ${command}
Digite 'help' para ver comandos disponíveis`;
      }

      if (output) {
        addOutput(pane.id, activeSession.id, output);
      }
      addOutput(pane.id, activeSession.id, '$ ');
    }, 100);

    setInput('');
  };

  const handleRename = (sessionId: string, currentName: string) => {
    setEditingSessionId(sessionId);
    setEditingName(currentName);
  };

  const saveRename = (sessionId: string) => {
    if (editingName.trim()) {
      renameSession(pane.id, sessionId, editingName.trim());
    }
    setEditingSessionId(null);
    setEditingName('');
  };

  return (
    <div 
      className={`flex flex-col h-full border ${isActive ? 'border-theme-accent' : 'border-theme-border'} rounded-lg overflow-hidden`}
      onClick={onActivate}
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-theme-bg-secondary border-b border-theme-border px-2 py-1 overflow-x-auto">
        {pane.sessions.map(session => (
          <div
            key={session.id}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-t text-xs transition-all cursor-pointer ${
              session.id === pane.activeSessionId
                ? 'bg-theme-bg text-theme-text'
                : 'bg-transparent text-theme-text-secondary hover:bg-theme-border'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveSession(pane.id, session.id);
            }}
          >
            <TerminalIcon className="w-3 h-3" />
            
            {editingSessionId === session.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => saveRename(session.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveRename(session.id);
                  if (e.key === 'Escape') setEditingSessionId(null);
                }}
                className="w-20 px-1 py-0 bg-theme-bg border border-theme-accent rounded text-xs focus:outline-none"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{session.name}</span>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRename(session.id, session.name);
                }}
                className="p-0.5 hover:bg-theme-border rounded"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              
              {pane.sessions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSession(pane.id, session.id);
                  }}
                  className="p-0.5 hover:bg-red-500/20 hover:text-red-500 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={(e) => {
            e.stopPropagation();
            addSession(pane.id);
          }}
          className="p-1.5 hover:bg-theme-border rounded text-theme-text-secondary hover:text-theme-text transition-colors"
          title="Nova aba"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-auto p-3 bg-slate-900 font-mono text-sm text-slate-300"
      >
        {activeSession?.history.map((line, i) => (
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

      {/* Input */}
      <form onSubmit={handleCommand} className="border-t border-slate-700 bg-slate-900 p-2">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono text-sm">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent font-mono text-sm text-slate-300 focus:outline-none"
            placeholder="Digite um comando... (help para ajuda)"
          />
        </div>
      </form>
    </div>
  );
};

export default function Terminal() {
  const {
    splitMode,
    panes,
    activePaneId,
    isVisible,
    height,
    setSplitMode,
    setActivePane,
    toggleVisibility,
    setHeight,
  } = useTerminalStore();

  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight >= 100 && newHeight <= 600) {
        setHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setHeight]);

  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="flex items-center gap-2 border-t border-theme-border bg-theme-bg-secondary px-4 py-2 text-sm text-theme-text hover:bg-theme-border transition-colors"
      >
        <TerminalIcon className="w-4 h-4" />
        Mostrar Terminal
      </button>
    );
  }

  return (
    <>
      {/* Resize Handle */}
      <div
        className="group h-1 cursor-ns-resize bg-theme-border hover:bg-theme-accent transition-colors"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="h-full w-full group-hover:bg-theme-accent/20 transition-colors" />
      </div>

      {/* Terminal Container */}
      <div
        className="flex flex-col bg-theme-bg-secondary"
        style={{ height: `${height}px` }}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-theme-border px-3 py-2">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-theme-text" />
            <span className="text-sm font-medium text-theme-text">Terminal</span>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setSplitMode('none')}
                className={`p-1.5 rounded transition-colors ${
                  splitMode === 'none'
                    ? 'bg-theme-accent text-white'
                    : 'text-theme-text-secondary hover:bg-theme-border hover:text-theme-text'
                }`}
                title="Painel único"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSplitMode('horizontal')}
                className={`p-1.5 rounded transition-colors ${
                  splitMode === 'horizontal'
                    ? 'bg-theme-accent text-white'
                    : 'text-theme-text-secondary hover:bg-theme-border hover:text-theme-text'
                }`}
                title="Split horizontal"
              >
                <SplitSquareHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSplitMode('vertical')}
                className={`p-1.5 rounded transition-colors ${
                  splitMode === 'vertical'
                    ? 'bg-theme-accent text-white'
                    : 'text-theme-text-secondary hover:bg-theme-border hover:text-theme-text'
                }`}
                title="Split vertical"
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            onClick={toggleVisibility}
            className="text-theme-text-secondary hover:text-theme-text transition-colors"
            title="Ocultar terminal"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Panes */}
        <div 
          className={`flex-1 p-2 gap-2 ${
            splitMode === 'horizontal' ? 'flex flex-row' :
            splitMode === 'vertical' ? 'flex flex-col' :
            'flex'
          }`}
        >
          {panes.map(pane => (
            <div key={pane.id} className={splitMode === 'none' ? 'flex-1' : 'flex-1'}>
              <TerminalPaneComponent
                pane={pane}
                isActive={pane.id === activePaneId}
                onActivate={() => setActivePane(pane.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
