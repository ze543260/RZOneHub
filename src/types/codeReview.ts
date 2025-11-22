export type CodeIssueSeverity = 'error' | 'warning' | 'info' | 'suggestion';

export type CodeIssueCategory =
  | 'performance'
  | 'security'
  | 'code-smell'
  | 'bug'
  | 'complexity'
  | 'maintainability'
  | 'best-practice'
  | 'style';

export interface CodeIssue {
  id: string;
  file: string;
  line: number;
  column: number;
  severity: CodeIssueSeverity;
  category: CodeIssueCategory;
  message: string;
  description: string;
  suggestion?: string;
  codeSnippet: string;
  fix?: CodeFix;
}

export interface CodeFix {
  description: string;
  changes: Array<{
    startLine: number;
    endLine: number;
    newCode: string;
  }>;
}

export interface Refactoringsuggestion {
  id: string;
  file: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: 'extract-method' | 'rename' | 'move' | 'simplify' | 'optimize';
  before: string;
  after: string;
}

export interface SecurityIssue {
  id: string;
  file: string;
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  description: string;
  cwe?: string; // Common Weakness Enumeration
  recommendation: string;
}

export interface PerformanceIssue {
  id: string;
  file: string;
  line: number;
  type: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
  estimatedImprovement?: string;
}

export interface CodeMetrics {
  file: string;
  linesOfCode: number;
  complexity: number;
  maintainabilityIndex: number;
  technicalDebt: string;
  duplicateBlocks: number;
  testCoverage?: number;
}

export interface CodeReviewResult {
  timestamp: number;
  files: string[];
  summary: {
    totalIssues: number;
    byCategory: Record<CodeIssueCategory, number>;
    bySeverity: Record<CodeIssueSeverity, number>;
  };
  issues: CodeIssue[];
  refactorings: Refactoringsuggestion[];
  security: SecurityIssue[];
  performance: PerformanceIssue[];
  metrics: CodeMetrics[];
  aiInsights: string;
}
