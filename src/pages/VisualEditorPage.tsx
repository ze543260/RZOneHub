import { useState } from 'react';
import { useVisualEditorStore } from '../store/visualEditorStore';
import { ThemeBuilder } from '../components/ThemeBuilder';
import {
  Code2,
  Palette,
  Eye,
  EyeOff,
  Save,
  Settings,
  Layers,
  Trash2,
  Copy,
  ChevronDown,
  Box,
  Menu,
  FileText
} from 'lucide-react';
import type { VisualComponent, ComponentLibraryItem, Framework } from '../types/visualEditor';

// Component Renderer
function ComponentRenderer({ component, isSelected, isHovered, onSelect, onHover }: {
  component: VisualComponent;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hover: boolean) => void;
}) {
  const { setDropTarget, endDrag } = useVisualEditorStore();
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(component.id);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    endDrag();
  };
  
  const renderContent = () => {
    switch (component.type) {
      case 'button':
        return <button style={component.style}>{component.props.children || 'Button'}</button>;
      
      case 'input':
        return <input style={component.style} placeholder={component.props.placeholder} type={component.props.type} />;
      
      case 'text':
        const Tag = (component.props.as || 'p') as keyof JSX.IntrinsicElements;
        return <Tag style={component.style}>{component.props.children || 'Text'}</Tag>;
      
      case 'image':
        return <img style={component.style} src={component.props.src} alt={component.props.alt} />;
      
      default:
        return (
          <div
            style={component.style}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {component.children.length === 0 && (
              <div className="text-center text-gray-400 text-sm p-4">
                Drop components here
              </div>
            )}
            {component.children.map(child => (
              <ComponentRenderer
                key={child.id}
                component={child}
                isSelected={false}
                isHovered={false}
                onSelect={() => {}}
                onHover={() => {}}
              />
            ))}
          </div>
        );
    }
  };
  
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`relative transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${isHovered ? 'ring-1 ring-blue-300' : ''}`}
    >
      {renderContent()}
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          {component.label}
        </div>
      )}
    </div>
  );
}

// Component Library Panel
function ComponentLibraryPanel() {
  const { componentLibrary, startDrag } = useVisualEditorStore();
  
  const categories = {
    layout: componentLibrary.filter(c => c.category === 'layout'),
    form: componentLibrary.filter(c => c.category === 'form'),
    display: componentLibrary.filter(c => c.category === 'display'),
    navigation: componentLibrary.filter(c => c.category === 'navigation')
  };
  
  const handleDragStart = (item: ComponentLibraryItem) => {
    startDrag(item);
  };
  
  return (
    <div className="w-64 bg-theme-bg-secondary border-r border-theme-border p-4 overflow-auto">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-theme-text mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Components
        </h3>
      </div>
      
      {Object.entries(categories).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h4 className="text-xs font-medium text-theme-text-secondary uppercase mb-2">
            {category}
          </h4>
          <div className="space-y-1">
            {items.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item)}
                className="flex items-center gap-2 p-2 rounded-lg bg-theme-bg hover:bg-theme-border cursor-move transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-theme-text truncate">{item.label}</p>
                  <p className="text-xs text-theme-text-secondary truncate">{item.preview}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Properties Panel
function PropertiesPanel() {
  const { selectedComponent, currentProject, updateComponent } = useVisualEditorStore();
  
  if (!selectedComponent || !currentProject) {
    return (
      <div className="w-80 bg-theme-bg-secondary border-l border-theme-border p-4">
        <div className="text-center text-theme-text-secondary py-12">
          <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a component to edit properties</p>
        </div>
      </div>
    );
  }
  
  const findComponent = (comp: VisualComponent): VisualComponent | null => {
    if (comp.id === selectedComponent) return comp;
    for (const child of comp.children) {
      const found = findComponent(child);
      if (found) return found;
    }
    return null;
  };
  
  const component = findComponent(currentProject.rootComponent);
  if (!component) return null;
  
  const updateStyle = (key: string, value: string) => {
    updateComponent(component.id, {
      style: { ...component.style, [key]: value }
    });
  };
  
  const updateProp = (key: string, value: any) => {
    updateComponent(component.id, {
      props: { ...component.props, [key]: value }
    });
  };
  
  return (
    <div className="w-80 bg-theme-bg-secondary border-l border-theme-border p-4 overflow-auto">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-theme-text mb-2">Properties</h3>
        <p className="text-xs text-theme-text-secondary">{component.label}</p>
      </div>
      
      {/* Layout Properties */}
      <div className="mb-6">
        <h4 className="text-xs font-medium text-theme-text-secondary uppercase mb-3">Layout</h4>
        <div className="space-y-3">
          {['padding', 'margin', 'width', 'height'].map(prop => (
            <div key={prop}>
              <label className="block text-xs font-medium text-theme-text mb-1 capitalize">
                {prop}
              </label>
              <input
                type="text"
                value={component.style[prop as keyof typeof component.style] || ''}
                onChange={(e) => updateStyle(prop, e.target.value)}
                className="w-full px-2 py-1 text-sm bg-theme-bg border border-theme-border rounded focus:outline-none focus:ring-1 focus:ring-theme-accent text-theme-text"
                placeholder="auto"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Colors */}
      <div className="mb-6">
        <h4 className="text-xs font-medium text-theme-text-secondary uppercase mb-3">Colors</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-theme-text mb-1">Background</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={component.style.backgroundColor || '#ffffff'}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={component.style.backgroundColor || ''}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                className="flex-1 px-2 py-1 text-sm bg-theme-bg border border-theme-border rounded focus:outline-none focus:ring-1 focus:ring-theme-accent text-theme-text"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-theme-text mb-1">Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={component.style.color || '#000000'}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="w-10 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={component.style.color || ''}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="flex-1 px-2 py-1 text-sm bg-theme-bg border border-theme-border rounded focus:outline-none focus:ring-1 focus:ring-theme-accent text-theme-text"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Typography */}
      {component.type === 'text' || component.type === 'button' ? (
        <div className="mb-6">
          <h4 className="text-xs font-medium text-theme-text-secondary uppercase mb-3">Typography</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Font Size</label>
              <input
                type="text"
                value={component.style.fontSize || ''}
                onChange={(e) => updateStyle('fontSize', e.target.value)}
                className="w-full px-2 py-1 text-sm bg-theme-bg border border-theme-border rounded focus:outline-none focus:ring-1 focus:ring-theme-accent text-theme-text"
                placeholder="1rem"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Font Weight</label>
              <select
                value={component.style.fontWeight || '400'}
                onChange={(e) => updateStyle('fontWeight', e.target.value)}
                className="w-full px-2 py-1 text-sm bg-theme-bg border border-theme-border rounded focus:outline-none focus:ring-1 focus:ring-theme-accent text-theme-text"
              >
                <option value="300">Light</option>
                <option value="400">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
              </select>
            </div>
          </div>
        </div>
      ) : null}
      
      {/* Component Props */}
      {component.props.children !== undefined && (
        <div className="mb-6">
          <h4 className="text-xs font-medium text-theme-text-secondary uppercase mb-3">Content</h4>
          <textarea
            value={component.props.children || ''}
            onChange={(e) => updateProp('children', e.target.value)}
            className="w-full px-2 py-1 text-sm bg-theme-bg border border-theme-border rounded focus:outline-none focus:ring-1 focus:ring-theme-accent text-theme-text"
            rows={3}
            placeholder="Component content..."
          />
        </div>
      )}
      
      {/* Border */}
      <div className="mb-6">
        <h4 className="text-xs font-medium text-theme-text-secondary uppercase mb-3">Border</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-theme-text mb-1">Border Radius</label>
            <input
              type="text"
              value={component.style.borderRadius || ''}
              onChange={(e) => updateStyle('borderRadius', e.target.value)}
              className="w-full px-2 py-1 text-sm bg-theme-bg border border-theme-border rounded focus:outline-none focus:ring-1 focus:ring-theme-accent text-theme-text"
              placeholder="0.375rem"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Editor Page
export default function VisualEditorPage() {
  const {
    currentProject,
    selectedComponent,
    hoveredComponent,
    previewMode,
    createProject,
    selectComponent,
    setHoveredComponent,
    togglePreview,
    deleteComponent,
    duplicateComponent,
    saveProject
  } = useVisualEditorStore();
  
  const [showNewProject, setShowNewProject] = useState(!currentProject);
  const [projectName, setProjectName] = useState('');
  const [framework, setFramework] = useState<Framework>('react');
  const [showExport, setShowExport] = useState(false);
  const [showThemeBuilder, setShowThemeBuilder] = useState(false);
  
  const handleCreateProject = () => {
    if (projectName.trim()) {
      createProject(projectName, framework);
      setShowNewProject(false);
    }
  };
  
  if (showNewProject) {
    return (
      <div className="h-screen flex items-center justify-center bg-theme-bg">
        <div className="bg-theme-bg-secondary border border-theme-border rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-theme-text mb-6">🎨 New Visual Project</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-theme-text mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2 bg-theme-bg border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent text-theme-text"
                placeholder="My Awesome UI"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-theme-text mb-2">
                Target Framework
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['react', 'vue', 'svelte', 'html'] as Framework[]).map(fw => (
                  <button
                    key={fw}
                    onClick={() => setFramework(fw)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      framework === fw
                        ? 'bg-theme-accent text-white'
                        : 'bg-theme-bg text-theme-text-secondary hover:bg-theme-border'
                    }`}
                  >
                    {fw.charAt(0).toUpperCase() + fw.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleCreateProject}
              disabled={!projectName.trim()}
              className="w-full px-6 py-3 bg-theme-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Project
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentProject) return null;
  
  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-theme-border bg-theme-bg-secondary">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-theme-text">{currentProject.name}</h1>
          <span className="text-xs px-2 py-1 bg-theme-border text-theme-text-secondary rounded">
            {currentProject.framework}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={togglePreview}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              previewMode
                ? 'bg-theme-accent text-white'
                : 'bg-theme-bg text-theme-text-secondary hover:bg-theme-border'
            }`}
          >
            <div className="flex items-center gap-2">
              {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewMode ? 'Edit Mode' : 'Preview'}
            </div>
          </button>
          
          <button
            onClick={() => setShowThemeBuilder(true)}
            className="px-3 py-1.5 bg-theme-bg text-theme-text-secondary hover:bg-theme-border rounded-lg font-medium transition-colors"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Theme
            </div>
          </button>
          
          <button
            onClick={() => setShowExport(true)}
            className="px-3 py-1.5 bg-theme-bg text-theme-text-secondary hover:bg-theme-border rounded-lg font-medium transition-colors"
          >
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Export
            </div>
          </button>
          
          <button
            onClick={saveProject}
            className="px-3 py-1.5 bg-green-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save
            </div>
          </button>
        </div>
      </div>
      
      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {!previewMode && <ComponentLibraryPanel />}
        
        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-8">
          <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl min-h-[600px]">
            <ComponentRenderer
              component={currentProject.rootComponent}
              isSelected={selectedComponent === currentProject.rootComponent.id}
              isHovered={hoveredComponent === currentProject.rootComponent.id}
              onSelect={() => selectComponent(currentProject.rootComponent.id)}
              onHover={(hover) => setHoveredComponent(hover ? currentProject.rootComponent.id : null)}
            />
          </div>
        </div>
        
        {!previewMode && <PropertiesPanel />}
      </div>
      
      {/* Selected Component Actions */}
      {selectedComponent && selectedComponent !== 'root' && !previewMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-theme-bg-secondary border border-theme-border rounded-lg shadow-lg p-2 flex items-center gap-2">
          <button
            onClick={() => duplicateComponent(selectedComponent)}
            className="px-3 py-2 bg-theme-bg hover:bg-theme-border rounded text-theme-text transition-colors"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteComponent(selectedComponent)}
            className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Theme Builder Modal */}
      <ThemeBuilder 
        isOpen={showThemeBuilder} 
        onClose={() => setShowThemeBuilder(false)} 
      />
    </div>
  );
}
