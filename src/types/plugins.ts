// Plugin System Types
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  icon?: string;
  category: PluginCategory;
  permissions: PluginPermission[];
  main: string;
  homepage?: string;
  repository?: string;
  license?: string;
  tags?: string[];
  minAppVersion?: string;
  maxAppVersion?: string;
}

export type PluginCategory = 
  | 'ai-enhancement'
  | 'code-tools'
  | 'ui-theme'
  | 'productivity'
  | 'integration'
  | 'language-support'
  | 'utility';

export type PluginPermission = 
  | 'filesystem.read'
  | 'filesystem.write'
  | 'network.http'
  | 'network.websocket'
  | 'clipboard'
  | 'terminal'
  | 'ai.access'
  | 'settings.read'
  | 'settings.write';

export interface PluginAPI {
  // Core API
  app: {
    version: string;
    platform: string;
    showNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  };
  
  // UI Extensions
  ui: {
    registerCommand: (id: string, label: string, callback: () => void) => void;
    registerMenuAction: (location: string, label: string, callback: () => void) => void;
    createStatusBarItem: (text: string, position: 'left' | 'right') => StatusBarItem;
  };
  
  // Editor Integration
  editor: {
    getActiveFile: () => string | null;
    getFileContent: (path: string) => Promise<string>;
    setFileContent: (path: string, content: string) => Promise<void>;
    getCursorPosition: () => { line: number; column: number };
    getSelectedText: () => string;
  };
  
  // AI Integration
  ai: {
    chat: (message: string) => Promise<string>;
    analyze: (code: string, language: string) => Promise<AnalysisResult>;
    generateCode: (prompt: string) => Promise<string>;
  };
  
  // Storage
  storage: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
  
  // Settings
  settings: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<void>;
  };
}

export interface StatusBarItem {
  setText: (text: string) => void;
  setTooltip: (tooltip: string) => void;
  dispose: () => void;
}

export interface AnalysisResult {
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    message: string;
    line: number;
    column: number;
  }>;
  suggestions: string[];
}

export interface Plugin {
  manifest: PluginManifest;
  activate: (api: PluginAPI) => void | Promise<void>;
  deactivate?: () => void | Promise<void>;
}

export interface InstalledPlugin {
  manifest: PluginManifest;
  enabled: boolean;
  installedAt: number;
  updatedAt: number;
  path: string;
}

export interface MarketplacePlugin {
  manifest: PluginManifest;
  downloads: number;
  rating: number;
  reviews: number;
  verified: boolean;
  lastUpdated: number;
}
