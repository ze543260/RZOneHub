import { create } from 'zustand';
import type { CodeReviewResult, CodeIssue, SecurityIssue, PerformanceIssue } from '../types/codeReview';

interface CodeReviewState {
  // Current review
  currentReview: CodeReviewResult | null;
  isAnalyzing: boolean;
  selectedFile: string | null;
  
  // Filters
  filterSeverity: string[];
  filterCategory: string[];
  showOnlyWithFixes: boolean;
  
  // Actions
  analyzeCode: (files: string[]) => Promise<void>;
  analyzeProject: (projectPath: string) => Promise<void>;
  setSelectedFile: (file: string | null) => void;
  setFilterSeverity: (severities: string[]) => void;
  setFilterCategory: (categories: string[]) => void;
  toggleShowOnlyWithFixes: () => void;
  applyFix: (issueId: string) => Promise<void>;
  applyAllFixes: (file: string) => Promise<void>;
}

// Mock analysis function
const mockAnalyzeCode = async (files: string[]): Promise<CodeReviewResult> => {
  // Simulate AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const mockIssues: CodeIssue[] = [
    {
      id: '1',
      file: files[0] || 'src/App.tsx',
      line: 45,
      column: 10,
      severity: 'error',
      category: 'bug',
      message: 'Potential null reference',
      description: 'Variable `user` might be null when accessed',
      codeSnippet: 'const name = user.name; // user can be null',
      suggestion: 'Add null check before accessing properties',
      fix: {
        description: 'Add optional chaining',
        changes: [{
          startLine: 45,
          endLine: 45,
          newCode: 'const name = user?.name;'
        }]
      }
    },
    {
      id: '2',
      file: files[0] || 'src/App.tsx',
      line: 78,
      column: 5,
      severity: 'warning',
      category: 'performance',
      message: 'Inefficient array operation',
      description: 'Using map() followed by filter() can be optimized',
      codeSnippet: 'const result = items.map(x => x * 2).filter(x => x > 10);',
      suggestion: 'Use reduce() or a single loop for better performance',
      fix: {
        description: 'Combine operations',
        changes: [{
          startLine: 78,
          endLine: 78,
          newCode: 'const result = items.reduce((acc, x) => { const val = x * 2; if (val > 10) acc.push(val); return acc; }, []);'
        }]
      }
    },
    {
      id: '3',
      file: files[1] || 'src/utils/helpers.ts',
      line: 23,
      column: 8,
      severity: 'warning',
      category: 'code-smell',
      message: 'Complex conditional logic',
      description: 'This if statement has too many conditions (cognitive complexity: 8)',
      codeSnippet: 'if (a && b || c && (d || e) && !f) { ... }',
      suggestion: 'Extract conditions into well-named variables or functions'
    },
    {
      id: '4',
      file: files[0] || 'src/App.tsx',
      line: 102,
      column: 12,
      severity: 'info',
      category: 'best-practice',
      message: 'Missing error handling',
      description: 'Async function without try-catch block',
      codeSnippet: 'const fetchData = async () => {\n  const res = await fetch(url);\n  return res.json();\n}',
      suggestion: 'Add try-catch block to handle potential errors',
      fix: {
        description: 'Add error handling',
        changes: [{
          startLine: 102,
          endLine: 105,
          newCode: 'const fetchData = async () => {\n  try {\n    const res = await fetch(url);\n    return res.json();\n  } catch (error) {\n    console.error(\"Failed to fetch:\", error);\n    throw error;\n  }\n}'
        }]
      }
    },
    {
      id: '5',
      file: files[1] || 'src/utils/helpers.ts',
      line: 56,
      column: 3,
      severity: 'suggestion',
      category: 'style',
      message: 'Prefer const over let',
      description: 'Variable is never reassigned',
      codeSnippet: 'let total = 0;',
      suggestion: 'Use const for variables that are never reassigned',
      fix: {
        description: 'Change let to const',
        changes: [{
          startLine: 56,
          endLine: 56,
          newCode: 'const total = 0;'
        }]
      }
    }
  ];

  const mockSecurity: SecurityIssue[] = [
    {
      id: 's1',
      file: files[0] || 'src/App.tsx',
      line: 134,
      severity: 'high',
      type: 'SQL Injection',
      description: 'User input directly concatenated into SQL query',
      cwe: 'CWE-89',
      recommendation: 'Use parameterized queries or ORM to prevent SQL injection'
    },
    {
      id: 's2',
      file: files[1] || 'src/utils/auth.ts',
      line: 23,
      severity: 'critical',
      type: 'Hardcoded Credentials',
      description: 'API key hardcoded in source code',
      cwe: 'CWE-798',
      recommendation: 'Move sensitive data to environment variables'
    }
  ];

  const mockPerformance: PerformanceIssue[] = [
    {
      id: 'p1',
      file: files[0] || 'src/App.tsx',
      line: 89,
      type: 'Memory Leak',
      impact: 'high',
      description: 'Event listener not cleaned up in useEffect',
      suggestion: 'Return cleanup function from useEffect',
      estimatedImprovement: '~15MB memory saved'
    },
    {
      id: 'p2',
      file: files[1] || 'src/components/List.tsx',
      line: 45,
      type: 'Expensive Render',
      impact: 'medium',
      description: 'Component re-renders unnecessarily',
      suggestion: 'Use React.memo or useMemo to prevent unnecessary re-renders',
      estimatedImprovement: '~40% faster renders'
    }
  ];

  return {
    timestamp: Date.now(),
    files,
    summary: {
      totalIssues: mockIssues.length,
      byCategory: {
        'performance': 1,
        'security': 0,
        'code-smell': 1,
        'bug': 1,
        'complexity': 0,
        'maintainability': 0,
        'best-practice': 1,
        'style': 1
      },
      bySeverity: {
        'error': 1,
        'warning': 2,
        'info': 1,
        'suggestion': 1
      }
    },
    issues: mockIssues,
    refactorings: [
      {
        id: 'r1',
        file: files[0] || 'src/App.tsx',
        title: 'Extract method: calculateTotal',
        description: 'Complex calculation logic can be extracted into a separate function',
        impact: 'medium',
        category: 'extract-method',
        before: 'const total = items.reduce((sum, item) => {\n  return sum + item.price * item.quantity * (1 - item.discount);\n}, 0);',
        after: 'const calculateItemTotal = (item) => item.price * item.quantity * (1 - item.discount);\nconst total = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);'
      }
    ],
    security: mockSecurity,
    performance: mockPerformance,
    metrics: [
      {
        file: files[0] || 'src/App.tsx',
        linesOfCode: 245,
        complexity: 12,
        maintainabilityIndex: 68,
        technicalDebt: '2h 15min',
        duplicateBlocks: 3,
        testCoverage: 45
      }
    ],
    aiInsights: `Análise completa de ${files.length} arquivo(s):\n\n• Encontrados ${mockIssues.length} problemas no código\n• ${mockSecurity.length} vulnerabilidades de segurança identificadas\n• ${mockPerformance.length} oportunidades de otimização de performance\n\nPrioridades:\n1. Corrigir vulnerabilidades críticas de segurança\n2. Resolver bugs e potential null references\n3. Otimizar performance em componentes frequentemente renderizados\n4. Refatorar código complexo para melhorar manutenibilidade\n\nO código possui qualidade geral boa (68/100), mas há espaço para melhorias significativas em segurança e performance.`
  };
};

export const useCodeReviewStore = create<CodeReviewState>((set, get) => ({
  currentReview: null,
  isAnalyzing: false,
  selectedFile: null,
  filterSeverity: [],
  filterCategory: [],
  showOnlyWithFixes: false,

  analyzeCode: async (files) => {
    set({ isAnalyzing: true });
    try {
      const result = await mockAnalyzeCode(files);
      set({ currentReview: result, isAnalyzing: false });
    } catch (error) {
      console.error('Code analysis failed:', error);
      set({ isAnalyzing: false });
    }
  },

  analyzeProject: async (projectPath) => {
    // Simulate scanning all files in project
    const files = [
      `${projectPath}/src/App.tsx`,
      `${projectPath}/src/utils/helpers.ts`,
      `${projectPath}/src/components/List.tsx`
    ];
    await get().analyzeCode(files);
  },

  setSelectedFile: (file) => {
    set({ selectedFile: file });
  },

  setFilterSeverity: (severities) => {
    set({ filterSeverity: severities });
  },

  setFilterCategory: (categories) => {
    set({ filterCategory: categories });
  },

  toggleShowOnlyWithFixes: () => {
    set(state => ({ showOnlyWithFixes: !state.showOnlyWithFixes }));
  },

  applyFix: async (issueId) => {
    // Simulate applying a fix
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      currentReview: state.currentReview ? {
        ...state.currentReview,
        issues: state.currentReview.issues.filter(i => i.id !== issueId)
      } : null
    }));
  },

  applyAllFixes: async (file) => {
    const { currentReview } = get();
    if (!currentReview) return;

    const fixableIssues = currentReview.issues.filter(
      i => i.file === file && i.fix
    );

    for (const issue of fixableIssues) {
      await get().applyFix(issue.id);
    }
  }
}));
