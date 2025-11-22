import { useState } from 'react';
import { useCodeReviewStore } from '../store/codeReviewStore';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Shield,
  Zap,
  Code2,
  CheckCircle,
  FileCode,
  BarChart3,
  Wrench
} from 'lucide-react';
import type { CodeIssue, CodeIssueSeverity } from '../types/codeReview';

const severityConfig = {
  error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  suggestion: { icon: Lightbulb, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
};

export default function CodeReviewPage() {
  const {
    currentReview,
    isAnalyzing,
    selectedFile,
    filterSeverity,
    filterCategory,
    showOnlyWithFixes,
    analyzeProject,
    setSelectedFile,
    setFilterSeverity,
    setFilterCategory,
    toggleShowOnlyWithFixes,
    applyFix,
    applyAllFixes
  } = useCodeReviewStore();

  const [activeTab, setActiveTab] = useState<'issues' | 'security' | 'performance' | 'metrics'>('issues');

  const handleAnalyze = () => {
    analyzeProject('/projeto-exemplo');
  };

  const filteredIssues = currentReview?.issues.filter(issue => {
    if (selectedFile && issue.file !== selectedFile) return false;
    if (filterSeverity.length > 0 && !filterSeverity.includes(issue.severity)) return false;
    if (filterCategory.length > 0 && !filterCategory.includes(issue.category)) return false;
    if (showOnlyWithFixes && !issue.fix) return false;
    return true;
  }) || [];

  const getFileIssueCount = (file: string) => {
    return currentReview?.issues.filter(i => i.file === file).length || 0;
  };

  const uniqueFiles = currentReview ? Array.from(new Set(currentReview.files)) : [];

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-theme-border">
        <h1 className="text-3xl font-bold text-theme-text mb-2">🧪 Code Review com IA</h1>
        <p className="text-theme-text-secondary">
          Análise estática de código, sugestões de refatoração e detecção de problemas
        </p>
      </div>

      {/* Actions Bar */}
      <div className="p-4 border-b border-theme-border flex items-center justify-between">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-6 py-2 bg-theme-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analisando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Analisar Projeto
            </div>
          )}
        </button>

        {currentReview && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-theme-text-secondary">
                {currentReview.summary.bySeverity.error} Erros
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-theme-text-secondary">
                {currentReview.summary.bySeverity.warning} Avisos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-theme-text-secondary">
                {currentReview.summary.bySeverity.info} Infos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-theme-text-secondary">
                {currentReview.summary.bySeverity.suggestion} Sugestões
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Files */}
        {currentReview && (
          <div className="w-64 border-r border-theme-border bg-theme-bg-secondary p-4 overflow-auto">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-theme-text mb-2">Arquivos</h3>
              <button
                onClick={() => setSelectedFile(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedFile === null
                    ? 'bg-theme-accent text-white'
                    : 'text-theme-text-secondary hover:bg-theme-border hover:text-theme-text'
                }`}
              >
                Todos ({currentReview.issues.length})
              </button>
            </div>

            <div className="space-y-1">
              {uniqueFiles.map(file => {
                const issueCount = getFileIssueCount(file);
                const fileName = file.split('/').pop() || file;
                
                return (
                  <button
                    key={file}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedFile === file
                        ? 'bg-theme-accent text-white'
                        : 'text-theme-text-secondary hover:bg-theme-border hover:text-theme-text'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCode className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{fileName}</span>
                      </div>
                      {issueCount > 0 && (
                        <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded ${
                          selectedFile === file ? 'bg-white/20' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {issueCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!currentReview ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Code2 className="w-16 h-16 mx-auto mb-4 text-theme-text-secondary opacity-50" />
                <p className="text-theme-text-secondary mb-4">
                  Nenhuma análise realizada ainda
                </p>
                <button
                  onClick={handleAnalyze}
                  className="px-6 py-2 bg-theme-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Analisar Projeto
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-4 px-6 pt-4 border-b border-theme-border">
                <button
                  onClick={() => setActiveTab('issues')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'issues'
                      ? 'border-theme-accent text-theme-accent'
                      : 'border-transparent text-theme-text-secondary hover:text-theme-text'
                  }`}
                >
                  Problemas ({filteredIssues.length})
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'security'
                      ? 'border-theme-accent text-theme-accent'
                      : 'border-transparent text-theme-text-secondary hover:text-theme-text'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Segurança ({currentReview.security.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('performance')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'performance'
                      ? 'border-theme-accent text-theme-accent'
                      : 'border-transparent text-theme-text-secondary hover:text-theme-text'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Performance ({currentReview.performance.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'metrics'
                      ? 'border-theme-accent text-theme-accent'
                      : 'border-transparent text-theme-text-secondary hover:text-theme-text'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Métricas
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto p-6">
                {activeTab === 'issues' && (
                  <div className="space-y-4">
                    {/* AI Insights */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-theme-text mb-2">Insights da IA</h3>
                          <p className="text-sm text-theme-text-secondary whitespace-pre-line">
                            {currentReview.aiInsights}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Issues List */}
                    {filteredIssues.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p className="text-theme-text-secondary">
                          Nenhum problema encontrado com os filtros atuais!
                        </p>
                      </div>
                    ) : (
                      filteredIssues.map(issue => {
                        const config = severityConfig[issue.severity];
                        const Icon = config.icon;
                        
                        return (
                          <div
                            key={issue.id}
                            className={`border ${config.border} ${config.bg} rounded-lg p-4`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3 flex-1">
                                <Icon className={`w-5 h-5 ${config.color} mt-0.5`} />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-theme-text mb-1">{issue.message}</h4>
                                  <p className="text-sm text-theme-text-secondary mb-2">
                                    {issue.description}
                                  </p>
                                  <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-1 bg-theme-border text-theme-text-secondary rounded">
                                      {issue.file.split('/').pop()}
                                    </span>
                                    <span className="px-2 py-1 bg-theme-border text-theme-text-secondary rounded">
                                      Linha {issue.line}
                                    </span>
                                    <span className={`px-2 py-1 rounded ${config.bg} ${config.color}`}>
                                      {issue.category}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Code Snippet */}
                            <div className="bg-slate-900 rounded p-3 mb-3">
                              <pre className="text-sm text-slate-300 font-mono overflow-x-auto">
                                <code>{issue.codeSnippet}</code>
                              </pre>
                            </div>

                            {/* Suggestion & Fix */}
                            {issue.suggestion && (
                              <div className="bg-green-500/10 border border-green-500/30 rounded p-3 mb-2">
                                <p className="text-sm text-green-700 dark:text-green-400">
                                  💡 {issue.suggestion}
                                </p>
                              </div>
                            )}

                            {issue.fix && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => applyFix(issue.id)}
                                  className="px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg font-medium hover:bg-green-500/30 transition-colors text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <Wrench className="w-4 h-4" />
                                    Aplicar Correção
                                  </div>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-4">
                    {currentReview.security.map(issue => (
                      <div
                        key={issue.id}
                        className={`border rounded-lg p-4 ${
                          issue.severity === 'critical' ? 'border-red-500 bg-red-500/10' :
                          issue.severity === 'high' ? 'border-orange-500 bg-orange-500/10' :
                          issue.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                          'border-blue-500 bg-blue-500/10'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <Shield className={`w-5 h-5 mt-0.5 ${
                            issue.severity === 'critical' ? 'text-red-500' :
                            issue.severity === 'high' ? 'text-orange-500' :
                            issue.severity === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-theme-text">{issue.type}</h4>
                              <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                                issue.severity === 'critical' ? 'bg-red-500 text-white' :
                                issue.severity === 'high' ? 'bg-orange-500 text-white' :
                                issue.severity === 'medium' ? 'bg-yellow-500 text-black' :
                                'bg-blue-500 text-white'
                              }`}>
                                {issue.severity}
                              </span>
                            </div>
                            <p className="text-sm text-theme-text-secondary mb-2">
                              {issue.description}
                            </p>
                            <div className="text-xs text-theme-text-secondary mb-2">
                              {issue.file.split('/').pop()} • Linha {issue.line}
                              {issue.cwe && ` • ${issue.cwe}`}
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                              <p className="text-sm text-blue-700 dark:text-blue-400">
                                🛡️ {issue.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'performance' && (
                  <div className="space-y-4">
                    {currentReview.performance.map(issue => (
                      <div
                        key={issue.id}
                        className={`border rounded-lg p-4 ${
                          issue.impact === 'high' ? 'border-red-500 bg-red-500/10' :
                          issue.impact === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                          'border-blue-500 bg-blue-500/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Zap className={`w-5 h-5 mt-0.5 ${
                            issue.impact === 'high' ? 'text-red-500' :
                            issue.impact === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-theme-text">{issue.type}</h4>
                              <span className={`text-xs px-2 py-0.5 rounded uppercase ${
                                issue.impact === 'high' ? 'bg-red-500 text-white' :
                                issue.impact === 'medium' ? 'bg-yellow-500 text-black' :
                                'bg-blue-500 text-white'
                              }`}>
                                Impacto {issue.impact}
                              </span>
                            </div>
                            <p className="text-sm text-theme-text-secondary mb-2">
                              {issue.description}
                            </p>
                            <div className="text-xs text-theme-text-secondary mb-2">
                              {issue.file.split('/').pop()} • Linha {issue.line}
                            </div>
                            <div className="bg-green-500/10 border border-green-500/30 rounded p-2 mb-2">
                              <p className="text-sm text-green-700 dark:text-green-400">
                                ⚡ {issue.suggestion}
                              </p>
                            </div>
                            {issue.estimatedImprovement && (
                              <div className="text-xs text-theme-text-secondary">
                                Melhoria estimada: <span className="font-semibold text-theme-text">{issue.estimatedImprovement}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'metrics' && (
                  <div className="space-y-6">
                    {currentReview.metrics.map(metric => (
                      <div key={metric.file} className="bg-theme-bg-secondary border border-theme-border rounded-lg p-6">
                        <h3 className="font-semibold text-theme-text mb-4">
                          {metric.file.split('/').pop()}
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-theme-text-secondary mb-1">Linhas de Código</p>
                            <p className="text-2xl font-bold text-theme-text">{metric.linesOfCode}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-theme-text-secondary mb-1">Complexidade</p>
                            <p className={`text-2xl font-bold ${
                              metric.complexity > 15 ? 'text-red-500' :
                              metric.complexity > 10 ? 'text-yellow-500' :
                              'text-green-500'
                            }`}>
                              {metric.complexity}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-theme-text-secondary mb-1">Manutenibilidade</p>
                            <p className={`text-2xl font-bold ${
                              metric.maintainabilityIndex < 50 ? 'text-red-500' :
                              metric.maintainabilityIndex < 75 ? 'text-yellow-500' :
                              'text-green-500'
                            }`}>
                              {metric.maintainabilityIndex}/100
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-theme-text-secondary mb-1">Dívida Técnica</p>
                            <p className="text-2xl font-bold text-theme-text">{metric.technicalDebt}</p>
                          </div>
                        </div>

                        {metric.testCoverage !== undefined && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-theme-text-secondary">Cobertura de Testes</p>
                              <p className="text-sm font-semibold text-theme-text">{metric.testCoverage}%</p>
                            </div>
                            <div className="w-full bg-theme-border rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  metric.testCoverage >= 80 ? 'bg-green-500' :
                                  metric.testCoverage >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${metric.testCoverage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
