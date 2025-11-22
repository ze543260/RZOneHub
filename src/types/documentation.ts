export interface DocumentationConfig {
  projectName: string;
  projectPath: string;
  includeJSDoc: boolean;
  includeReadme: boolean;
  includeDiagrams: boolean;
  includeAPI: boolean;
  includeChangelog: boolean;
  language: 'pt' | 'en';
}

export interface JSDocComment {
  file: string;
  line: number;
  type: 'function' | 'class' | 'interface' | 'type' | 'const';
  name: string;
  signature: string;
  generatedDoc: string;
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  responses: Array<{
    status: number;
    description: string;
    schema?: string;
  }>;
}

export interface DiagramData {
  type: 'architecture' | 'class' | 'sequence' | 'flowchart';
  title: string;
  mermaidCode: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: Array<{
    type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
    description: string;
  }>;
}

export interface DocumentationResult {
  timestamp: number;
  config: DocumentationConfig;
  jsDocs?: JSDocComment[];
  readme?: string;
  diagrams?: DiagramData[];
  api?: APIEndpoint[];
  changelog?: ChangelogEntry[];
  generatedFiles: Array<{
    path: string;
    content: string;
  }>;
}
