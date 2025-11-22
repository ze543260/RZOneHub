import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InstalledPlugin, MarketplacePlugin, PluginManifest, Plugin, PluginAPI } from '../types/plugins';

interface PluginState {
  // Installed plugins
  installedPlugins: InstalledPlugin[];
  activePlugins: Map<string, Plugin>;
  
  // Marketplace
  marketplacePlugins: MarketplacePlugin[];
  searchQuery: string;
  selectedCategory: string | null;
  
  // Loading states
  isLoadingMarketplace: boolean;
  isInstalling: boolean;
  
  // Actions
  installPlugin: (manifest: PluginManifest, pluginCode: string) => Promise<void>;
  uninstallPlugin: (id: string) => Promise<void>;
  enablePlugin: (id: string) => Promise<void>;
  disablePlugin: (id: string) => void;
  updatePlugin: (id: string) => Promise<void>;
  
  // Marketplace actions
  fetchMarketplacePlugins: () => Promise<void>;
  searchPlugins: (query: string) => void;
  filterByCategory: (category: string | null) => void;
  
  // Plugin execution
  activatePlugin: (id: string) => Promise<void>;
  deactivatePlugin: (id: string) => Promise<void>;
  executePluginCommand: (pluginId: string, commandId: string) => void;
}

// Mock marketplace data (would be fetched from real API)
const mockMarketplacePlugins: MarketplacePlugin[] = [
  {
    manifest: {
      id: 'prettier-formatter',
      name: 'Prettier Code Formatter',
      version: '1.0.0',
      author: 'Community',
      description: 'Format your code with Prettier automatically',
      category: 'code-tools',
      permissions: ['filesystem.read', 'filesystem.write'],
      main: 'index.js',
      tags: ['formatter', 'prettier', 'code-quality']
    },
    downloads: 15420,
    rating: 4.8,
    reviews: 234,
    verified: true,
    lastUpdated: Date.now() - 86400000
  },
  {
    manifest: {
      id: 'ai-commit-messages',
      name: 'AI Commit Messages',
      version: '2.1.0',
      author: 'RZOne Team',
      description: 'Generate intelligent commit messages from your changes',
      category: 'ai-enhancement',
      permissions: ['filesystem.read', 'ai.access'],
      main: 'index.js',
      tags: ['git', 'ai', 'commits']
    },
    downloads: 8932,
    rating: 4.9,
    reviews: 156,
    verified: true,
    lastUpdated: Date.now() - 172800000
  },
  {
    manifest: {
      id: 'github-copilot-chat',
      name: 'GitHub Copilot Integration',
      version: '1.5.0',
      author: 'Community',
      description: 'Integrate GitHub Copilot directly into RZOneHub',
      category: 'ai-enhancement',
      permissions: ['network.http', 'ai.access', 'filesystem.read'],
      main: 'index.js',
      tags: ['copilot', 'github', 'ai']
    },
    downloads: 23451,
    rating: 4.7,
    reviews: 421,
    verified: true,
    lastUpdated: Date.now() - 259200000
  },
  {
    manifest: {
      id: 'terminal-themes',
      name: 'Terminal Color Themes',
      version: '3.0.0',
      author: 'DevTools',
      description: 'Customize terminal with beautiful color schemes',
      category: 'ui-theme',
      permissions: ['settings.write'],
      main: 'index.js',
      tags: ['terminal', 'theme', 'colors']
    },
    downloads: 5673,
    rating: 4.6,
    reviews: 89,
    verified: false,
    lastUpdated: Date.now() - 432000000
  },
  {
    manifest: {
      id: 'code-snippets-pro',
      name: 'Smart Code Snippets',
      version: '1.2.0',
      author: 'Community',
      description: 'AI-powered code snippet suggestions',
      category: 'productivity',
      permissions: ['ai.access', 'clipboard'],
      main: 'index.js',
      tags: ['snippets', 'productivity', 'ai']
    },
    downloads: 12089,
    rating: 4.5,
    reviews: 203,
    verified: true,
    lastUpdated: Date.now() - 604800000
  },
  {
    manifest: {
      id: 'rest-client',
      name: 'REST API Client',
      version: '2.0.0',
      author: 'API Tools',
      description: 'Test REST APIs directly from the IDE',
      category: 'integration',
      permissions: ['network.http'],
      main: 'index.js',
      tags: ['api', 'rest', 'testing']
    },
    downloads: 9876,
    rating: 4.4,
    reviews: 167,
    verified: false,
    lastUpdated: Date.now() - 777600000
  }
];

export const usePluginStore = create<PluginState>()(
  persist(
    (set, get) => ({
      installedPlugins: [],
      activePlugins: new Map(),
      marketplacePlugins: mockMarketplacePlugins,
      searchQuery: '',
      selectedCategory: null,
      isLoadingMarketplace: false,
      isInstalling: false,

      installPlugin: async (manifest, _pluginCode) => {
        set({ isInstalling: true });
        
        try {
          // Simulate installation process
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const newPlugin: InstalledPlugin = {
            manifest,
            enabled: true,
            installedAt: Date.now(),
            updatedAt: Date.now(),
            path: `plugins/${manifest.id}`
          };
          
          set(state => ({
            installedPlugins: [...state.installedPlugins, newPlugin],
            isInstalling: false
          }));
          
          // Auto-activate after install
          await get().activatePlugin(manifest.id);
        } catch (error) {
          console.error('Failed to install plugin:', error);
          set({ isInstalling: false });
        }
      },

      uninstallPlugin: async (id) => {
        await get().deactivatePlugin(id);
        
        set(state => ({
          installedPlugins: state.installedPlugins.filter(p => p.manifest.id !== id)
        }));
      },

      enablePlugin: async (id) => {
        set(state => ({
          installedPlugins: state.installedPlugins.map(p =>
            p.manifest.id === id ? { ...p, enabled: true } : p
          )
        }));
        
        await get().activatePlugin(id);
      },

      disablePlugin: (id) => {
        get().deactivatePlugin(id);
        
        set(state => ({
          installedPlugins: state.installedPlugins.map(p =>
            p.manifest.id === id ? { ...p, enabled: false } : p
          )
        }));
      },

      updatePlugin: async (id) => {
        set({ isInstalling: true });
        
        // Simulate update
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        set(state => ({
          installedPlugins: state.installedPlugins.map(p =>
            p.manifest.id === id ? { ...p, updatedAt: Date.now() } : p
          ),
          isInstalling: false
        }));
      },

      fetchMarketplacePlugins: async () => {
        set({ isLoadingMarketplace: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set({
          marketplacePlugins: mockMarketplacePlugins,
          isLoadingMarketplace: false
        });
      },

      searchPlugins: (query) => {
        set({ searchQuery: query });
      },

      filterByCategory: (category) => {
        set({ selectedCategory: category });
      },

      activatePlugin: async (id) => {
        const plugin = get().installedPlugins.find(p => p.manifest.id === id);
        if (!plugin) return;
        
        // Create plugin API
        const api: PluginAPI = {
          app: {
            version: '0.0.1',
            platform: navigator.platform,
            showNotification: (message, type) => {
              console.log(`[${type.toUpperCase()}] ${message}`);
            }
          },
          ui: {
            registerCommand: (cmdId, label, callback) => {
              console.log(`Registered command: ${cmdId} - ${label}`);
            },
            registerMenuAction: (location, label, callback) => {
              console.log(`Registered menu: ${location} - ${label}`);
            },
            createStatusBarItem: (text, position) => ({
              setText: (t) => console.log(`StatusBar text: ${t}`),
              setTooltip: (t) => console.log(`StatusBar tooltip: ${t}`),
              dispose: () => console.log('StatusBar disposed')
            })
          },
          editor: {
            getActiveFile: () => null,
            getFileContent: async (path) => '',
            setFileContent: async (path, content) => {},
            getCursorPosition: () => ({ line: 0, column: 0 }),
            getSelectedText: () => ''
          },
          ai: {
            chat: async (message) => 'AI response',
            analyze: async (code, language) => ({ issues: [], suggestions: [] }),
            generateCode: async (prompt) => '// Generated code'
          },
          storage: {
            get: async (key) => null,
            set: async (key, value) => {},
            delete: async (key) => {}
          },
          settings: {
            get: async (key) => null,
            set: async (key, value) => {}
          }
        };
        
        // Mock plugin activation
        console.log(`Activating plugin: ${plugin.manifest.name}`);
      },

      deactivatePlugin: async (id) => {
        const activePlugins = get().activePlugins;
        const plugin = activePlugins.get(id);
        
        if (plugin?.deactivate) {
          await plugin.deactivate();
        }
        
        activePlugins.delete(id);
        set({ activePlugins: new Map(activePlugins) });
      },

      executePluginCommand: (pluginId, commandId) => {
        console.log(`Executing command ${commandId} from plugin ${pluginId}`);
      }
    }),
    {
      name: 'rzonehub-plugins',
      partialize: (state) => ({
        installedPlugins: state.installedPlugins
      })
    }
  )
);
