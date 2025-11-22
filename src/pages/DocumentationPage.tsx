import { useState } from 'react';
import { useDocumentationStore } from '../store/documentationStore';
import {
  FileText,
  BookOpen,
  Code2,
  GitBranch,
  Download,
  CheckCircle,
  Loader2,
  Settings,
  Eye
} from 'lucide-react';

export default function DocumentationPage() {
  const {
    config,
    result,
    isGenerating,
    setConfig,
    generateDocumentation,
    exportDocumentation
  } = useDocumentationStore();

  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const selectedFileContent = result?.generatedFiles.find(f => f.path === selectedFile);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-theme-border">
        <h1 className="text-3xl font-bold text-theme-text mb-2">📚 Documentação Automática</h1>
        <p className="text-theme-text-secondary">
          Gere JSDoc, README, diagramas e documentação de API automaticamente
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-6 pt-4 border-b border-theme-border">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'config'
              ? 'border-theme-accent text-theme-accent'
              : 'border-transparent text-theme-text-secondary hover:text-theme-text'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuração
          </div>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          disabled={!result}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'preview'
              ? 'border-theme-accent text-theme-accent'
              : 'border-transparent text-theme-text-secondary hover:text-theme-text'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview {result && `(${result.generatedFiles.length})`}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {activeTab === 'config' ? (
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Project Info */}
              <div className="bg-theme-bg-secondary border border-theme-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-theme-text mb-4">Informações do Projeto</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-text mb-2">
                      Nome do Projeto
                    </label>
                    <input
                      type="text"
                      value={config.projectName}
                      onChange={(e) => setConfig({ projectName: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-bg border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent text-theme-text"
                      placeholder="Meu Projeto Incrível"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-text mb-2">
                      Caminho do Projeto
                    </label>
                    <input
                      type="text"
                      value={config.projectPath}
                      onChange={(e) => setConfig({ projectPath: e.target.value })}
                      className="w-full px-4 py-2 bg-theme-bg border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent text-theme-text"
                      placeholder="/caminho/para/projeto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-text mb-2">
                      Idioma
                    </label>
                    <select
                      value={config.language}
                      onChange={(e) => setConfig({ language: e.target.value as 'pt' | 'en' })}
                      className="w-full px-4 py-2 bg-theme-bg border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent text-theme-text"
                    >
                      <option value="pt">Português</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="bg-theme-bg-secondary border border-theme-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-theme-text mb-4">O que gerar?</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={config.includeJSDoc}
                      onChange={(e) => setConfig({ includeJSDoc: e.target.checked })}
                      className="w-5 h-5 rounded border-theme-border text-theme-accent focus:ring-2 focus:ring-theme-accent"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-theme-accent" />
                        <span className="font-medium text-theme-text">JSDoc / TSDoc</span>
                      </div>
                      <p className="text-sm text-theme-text-secondary">
                        Gera comentários de documentação para funções, classes e interfaces
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={config.includeReadme}
                      onChange={(e) => setConfig({ includeReadme: e.target.checked })}
                      className="w-5 h-5 rounded border-theme-border text-theme-accent focus:ring-2 focus:ring-theme-accent"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-theme-accent" />
                        <span className="font-medium text-theme-text">README.md</span>
                      </div>
                      <p className="text-sm text-theme-text-secondary">
                        Cria um README completo com instalação, uso e contribuição
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={config.includeDiagrams}
                      onChange={(e) => setConfig({ includeDiagrams: e.target.checked })}
                      className="w-5 h-5 rounded border-theme-border text-theme-accent focus:ring-2 focus:ring-theme-accent"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-theme-accent" />
                        <span className="font-medium text-theme-text">Diagramas (Mermaid)</span>
                      </div>
                      <p className="text-sm text-theme-text-secondary">
                        Gera diagramas de arquitetura, classes e sequência
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={config.includeAPI}
                      onChange={(e) => setConfig({ includeAPI: e.target.checked })}
                      className="w-5 h-5 rounded border-theme-border text-theme-accent focus:ring-2 focus:ring-theme-accent"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-theme-accent" />
                        <span className="font-medium text-theme-text">Documentação de API</span>
                      </div>
                      <p className="text-sm text-theme-text-secondary">
                        Documenta endpoints, parâmetros e respostas da API
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={config.includeChangelog}
                      onChange={(e) => setConfig({ includeChangelog: e.target.checked })}
                      className="w-5 h-5 rounded border-theme-border text-theme-accent focus:ring-2 focus:ring-theme-accent"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-theme-accent" />
                        <span className="font-medium text-theme-text">CHANGELOG.md</span>
                      </div>
                      <p className="text-sm text-theme-text-secondary">
                        Gera histórico de versões e mudanças
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateDocumentation}
                disabled={isGenerating}
                className="w-full px-6 py-3 bg-theme-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando Documentação...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5" />
                    Gerar Documentação com IA
                  </div>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* File List */}
            <div className="w-64 border-r border-theme-border bg-theme-bg-secondary p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-theme-text">Arquivos Gerados</h3>
                <button
                  onClick={exportDocumentation}
                  className="p-2 hover:bg-theme-border rounded-lg transition-colors"
                  title="Exportar tudo"
                >
                  <Download className="w-4 h-4 text-theme-accent" />
                </button>
              </div>

              <div className="space-y-1">
                {result?.generatedFiles.map(file => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file.path)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedFile === file.path
                        ? 'bg-theme-accent text-white'
                        : 'text-theme-text-secondary hover:bg-theme-border hover:text-theme-text'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{file.path}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex-1 overflow-auto p-6">
              {selectedFileContent ? (
                <div className="max-w-4xl mx-auto">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-theme-text">{selectedFileContent.path}</h2>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedFileContent.content);
                        alert('Copiado para área de transferência!');
                      }}
                      className="px-4 py-2 bg-theme-border text-theme-text rounded-lg hover:bg-theme-accent hover:text-white transition-colors"
                    >
                      Copiar
                    </button>
                  </div>

                  {/* Render markdown preview */}
                  <div className="bg-theme-bg-secondary border border-theme-border rounded-lg p-6 prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-theme-text font-mono">
                      {selectedFileContent.content}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-theme-text-secondary opacity-50" />
                    <p className="text-theme-text-secondary">
                      Selecione um arquivo para visualizar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Success Toast */}
      {result && !isGenerating && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">
            {result.generatedFiles.length} arquivos gerados com sucesso!
          </span>
        </div>
      )}
    </div>
  );
}
