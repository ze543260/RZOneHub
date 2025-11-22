import { useState, useEffect } from 'react';
import { usePluginStore } from '../store/pluginStore';
import { Download, Trash2, Power, PowerOff, RefreshCw, Search, Star, Shield, TrendingUp, Package } from 'lucide-react';
import type { MarketplacePlugin } from '../types/plugins';

const categories = [
  { id: null, name: 'Todos', icon: Package },
  { id: 'ai-enhancement', name: 'IA Avançada', icon: TrendingUp },
  { id: 'code-tools', name: 'Ferramentas', icon: Package },
  { id: 'ui-theme', name: 'Temas', icon: Star },
  { id: 'productivity', name: 'Produtividade', icon: TrendingUp },
  { id: 'integration', name: 'Integrações', icon: Package },
];

export default function PluginsPage() {
  const {
    installedPlugins,
    marketplacePlugins,
    searchQuery,
    selectedCategory,
    isLoadingMarketplace,
    isInstalling,
    installPlugin,
    uninstallPlugin,
    enablePlugin,
    disablePlugin,
    updatePlugin,
    fetchMarketplacePlugins,
    searchPlugins,
    filterByCategory
  } = usePluginStore();

  const [activeTab, setActiveTab] = useState<'marketplace' | 'installed'>('marketplace');

  useEffect(() => {
    fetchMarketplacePlugins();
  }, []);

  const filteredMarketplace = marketplacePlugins.filter(plugin => {
    const matchesSearch = plugin.manifest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.manifest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.manifest.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || plugin.manifest.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const isPluginInstalled = (id: string) => installedPlugins.some(p => p.manifest.id === id);
  
  const getInstalledPlugin = (id: string) => installedPlugins.find(p => p.manifest.id === id);

  const handleInstall = async (plugin: MarketplacePlugin) => {
    await installPlugin(plugin.manifest, '// Plugin code would be downloaded');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-theme-border">
        <h1 className="text-3xl font-bold text-theme-text mb-2">🔌 Sistema de Plugins</h1>
        <p className="text-theme-text-secondary">Estenda as funcionalidades do RZOneHub</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-6 pt-4 border-b border-theme-border">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'marketplace'
              ? 'border-theme-accent text-theme-accent'
              : 'border-transparent text-theme-text-secondary hover:text-theme-text'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Marketplace ({marketplacePlugins.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('installed')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'installed'
              ? 'border-theme-accent text-theme-accent'
              : 'border-transparent text-theme-text-secondary hover:text-theme-text'
          }`}
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Instalados ({installedPlugins.length})
          </div>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-secondary" />
          <input
            type="text"
            placeholder="Buscar plugins..."
            value={searchQuery}
            onChange={(e) => searchPlugins(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent text-theme-text"
          />
        </div>
        
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat.id || 'all'}
              onClick={() => filterByCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-theme-accent text-white'
                  : 'bg-theme-bg-secondary text-theme-text-secondary hover:bg-theme-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'marketplace' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingMarketplace ? (
              <div className="col-span-full text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-theme-accent" />
                <p className="text-theme-text-secondary">Carregando marketplace...</p>
              </div>
            ) : filteredMarketplace.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-theme-text-secondary opacity-50" />
                <p className="text-theme-text-secondary">Nenhum plugin encontrado</p>
              </div>
            ) : (
              filteredMarketplace.map(plugin => {
                const installed = isPluginInstalled(plugin.manifest.id);
                const installedPlugin = getInstalledPlugin(plugin.manifest.id);
                
                return (
                  <div
                    key={plugin.manifest.id}
                    className="bg-theme-bg-secondary border border-theme-border rounded-lg p-6 hover:border-theme-accent transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-theme-text">{plugin.manifest.name}</h3>
                          {plugin.verified && (
                            <Shield className="w-4 h-4 text-blue-500" title="Verificado" />
                          )}
                        </div>
                        <p className="text-sm text-theme-text-secondary">{plugin.manifest.author}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-theme-border text-theme-text rounded">
                        v{plugin.manifest.version}
                      </span>
                    </div>

                    <p className="text-sm text-theme-text-secondary mb-4 line-clamp-2">
                      {plugin.manifest.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {plugin.manifest.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-theme-bg text-theme-text-secondary rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-xs text-theme-text-secondary">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {plugin.rating.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {plugin.downloads.toLocaleString()}
                      </div>
                    </div>

                    {installed ? (
                      <div className="flex gap-2">
                        <button
                          disabled
                          className="flex-1 px-4 py-2 bg-green-500/20 text-green-500 rounded-lg font-medium cursor-not-allowed"
                        >
                          ✓ Instalado
                        </button>
                        {installedPlugin && (
                          <button
                            onClick={() => installedPlugin.enabled ? disablePlugin(plugin.manifest.id) : enablePlugin(plugin.manifest.id)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              installedPlugin.enabled
                                ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                                : 'bg-theme-border text-theme-text-secondary hover:bg-theme-accent hover:text-white'
                            }`}
                          >
                            {installedPlugin.enabled ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleInstall(plugin)}
                        disabled={isInstalling}
                        className="w-full px-4 py-2 bg-theme-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isInstalling ? (
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Instalando...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" />
                            Instalar
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {installedPlugins.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-theme-text-secondary opacity-50" />
                <p className="text-theme-text-secondary mb-4">Nenhum plugin instalado</p>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="px-6 py-2 bg-theme-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Explorar Marketplace
                </button>
              </div>
            ) : (
              installedPlugins.map(plugin => (
                <div
                  key={plugin.manifest.id}
                  className="bg-theme-bg-secondary border border-theme-border rounded-lg p-6 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-theme-text">{plugin.manifest.name}</h3>
                      <span className="text-xs px-2 py-1 bg-theme-border text-theme-text rounded">
                        v{plugin.manifest.version}
                      </span>
                      {plugin.enabled ? (
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded">
                          ● Ativo
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-500 rounded">
                          ○ Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-theme-text-secondary mb-2">{plugin.manifest.description}</p>
                    <p className="text-xs text-theme-text-secondary">
                      Por {plugin.manifest.author} • Instalado em {new Date(plugin.installedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => plugin.enabled ? disablePlugin(plugin.manifest.id) : enablePlugin(plugin.manifest.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        plugin.enabled
                          ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                          : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {plugin.enabled ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        {plugin.enabled ? 'Desativar' : 'Ativar'}
                      </div>
                    </button>
                    
                    <button
                      onClick={() => updatePlugin(plugin.manifest.id)}
                      disabled={isInstalling}
                      className="px-4 py-2 bg-blue-500/20 text-blue-500 rounded-lg font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => uninstallPlugin(plugin.manifest.id)}
                      className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
