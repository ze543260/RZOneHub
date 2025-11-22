import { create } from 'zustand';
import type {
  VisualComponent,
  ComponentLibraryItem,
  ThemeConfig,
  VisualEditorProject,
  ExportOptions,
  DragState,
  Framework,
} from '../types/visualEditor';
import { exportComponent, exportProject } from '../utils/codeExport';

// Component Library Templates
const componentLibrary: ComponentLibraryItem[] = [
  {
    id: 'container',
    type: 'container',
    label: 'Container',
    icon: '📦',
    category: 'layout',
    defaultStyle: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '0.5rem',
      minHeight: '200px'
    },
    defaultProps: {},
    preview: 'Generic container for grouping elements'
  },
  {
    id: 'button',
    type: 'button',
    label: 'Button',
    icon: '🔘',
    category: 'form',
    defaultStyle: {
      padding: '0.5rem 1rem',
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      borderRadius: '0.375rem',
      border: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer'
    },
    defaultProps: {
      children: 'Click me',
      variant: 'primary'
    },
    preview: 'Interactive button component'
  },
  {
    id: 'input',
    type: 'input',
    label: 'Input',
    icon: '📝',
    category: 'form',
    defaultStyle: {
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      width: '100%'
    },
    defaultProps: {
      placeholder: 'Enter text...',
      type: 'text'
    },
    preview: 'Text input field'
  },
  {
    id: 'text',
    type: 'text',
    label: 'Text',
    icon: '📄',
    category: 'display',
    defaultStyle: {
      fontSize: '1rem',
      color: '#1f2937',
      lineHeight: '1.5'
    },
    defaultProps: {
      children: 'Sample text',
      as: 'p'
    },
    preview: 'Text paragraph or heading'
  },
  {
    id: 'card',
    type: 'card',
    label: 'Card',
    icon: '🃏',
    category: 'display',
    defaultStyle: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1.5rem',
      backgroundColor: '#ffffff',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: '1px solid #e5e7eb'
    },
    defaultProps: {},
    preview: 'Card container with shadow'
  },
  {
    id: 'navbar',
    type: 'navbar',
    label: 'Navbar',
    icon: '📊',
    category: 'navigation',
    defaultStyle: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#1f2937',
      color: '#ffffff'
    },
    defaultProps: {},
    preview: 'Navigation bar'
  },
  {
    id: 'grid',
    type: 'grid',
    label: 'Grid',
    icon: '⚏',
    category: 'layout',
    defaultStyle: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem',
      padding: '1rem'
    },
    defaultProps: {},
    preview: 'CSS Grid container'
  },
  {
    id: 'flexbox',
    type: 'flexbox',
    label: 'Flexbox',
    icon: '↔️',
    category: 'layout',
    defaultStyle: {
      display: 'flex',
      gap: '1rem',
      padding: '1rem',
      alignItems: 'center'
    },
    defaultProps: {},
    preview: 'Flexbox container'
  },
  {
    id: 'image',
    type: 'image',
    label: 'Image',
    icon: '🖼️',
    category: 'display',
    defaultStyle: {
      width: '100%',
      height: 'auto',
      borderRadius: '0.375rem'
    },
    defaultProps: {
      src: 'https://via.placeholder.com/400x300',
      alt: 'Placeholder image'
    },
    preview: 'Image element'
  },
  {
    id: 'form',
    type: 'form',
    label: 'Form',
    icon: '📋',
    category: 'form',
    defaultStyle: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1.5rem',
      backgroundColor: '#ffffff',
      borderRadius: '0.5rem'
    },
    defaultProps: {},
    preview: 'Form container'
  }
];

const defaultTheme: ThemeConfig = {
  name: 'Default',
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6'
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  }
};

interface VisualEditorState {
  // Projects
  projects: VisualEditorProject[];
  currentProject: VisualEditorProject | null;
  components: VisualComponent[];
  
  // Editor state
  selectedComponent: string | null;
  hoveredComponent: string | null;
  componentLibrary: ComponentLibraryItem[];
  
  // Drag & Drop
  dragState: DragState;
  
  // Preview
  previewMode: boolean;
  previewFramework: Framework;
  
  // Theme
  currentTheme: ThemeConfig;
  customThemes: ThemeConfig[];
  
  // Actions
  createProject: (name: string, framework: Framework) => void;
  loadProject: (id: string) => void;
  saveProject: () => void;
  
  // Component management
  addComponent: (libraryItem: ComponentLibraryItem, parentId?: string) => void;
  updateComponent: (id: string, updates: Partial<VisualComponent>) => void;
  deleteComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  moveComponent: (componentId: string, newParentId: string, index?: number) => void;
  selectComponent: (id: string | null) => void;
  setHoveredComponent: (id: string | null) => void;
  
  // Drag & Drop
  startDrag: (component: ComponentLibraryItem | VisualComponent) => void;
  setDropTarget: (targetId: string | null) => void;
  endDrag: () => void;
  
  // Theme
  updateTheme: (theme: Partial<ThemeConfig>) => void;
  saveCustomTheme: (theme: ThemeConfig) => void;
  applyTheme: (themeName: string) => void;
  
  // Export
  exportCode: (options: ExportOptions) => string;
  
  // Preview
  togglePreview: () => void;
  setPreviewFramework: (framework: Framework) => void;
}

const createDefaultComponent = (): VisualComponent => ({
  id: 'root',
  type: 'container',
  label: 'Root Container',
  style: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '2rem'
  },
  props: {},
  children: []
});

export const useVisualEditorStore = create<VisualEditorState>((set, get) => ({
  projects: [],
  currentProject: null,
  components: [],
  selectedComponent: null,
  hoveredComponent: null,
  componentLibrary,
  dragState: {
    isDragging: false,
    draggedComponent: null,
    dropTarget: null
  },
  previewMode: false,
  previewFramework: 'react',
  currentTheme: defaultTheme,
  customThemes: [],

  createProject: (name, framework) => {
    const newProject: VisualEditorProject = {
      id: `project-${Date.now()}`,
      name,
      framework,
      theme: defaultTheme,
      rootComponent: createDefaultComponent(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    set(state => ({
      projects: [...state.projects, newProject],
      currentProject: newProject,
      components: [newProject.rootComponent]
    }));
  },

  loadProject: (id) => {
    const project = get().projects.find(p => p.id === id);
    if (project) {
      set({ 
        currentProject: project, 
        currentTheme: project.theme,
        components: [project.rootComponent]
      });
    }
  },

  saveProject: () => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    set(state => ({
      projects: state.projects.map(p =>
        p.id === currentProject.id
          ? { ...currentProject, updatedAt: Date.now() }
          : p
      )
    }));
  },

  addComponent: (libraryItem, parentId) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    const newComponent: VisualComponent = {
      id: `component-${Date.now()}`,
      type: libraryItem.type,
      label: libraryItem.label,
      style: { ...libraryItem.defaultStyle },
      props: { ...libraryItem.defaultProps },
      children: [],
      parent: parentId
    };
    
    const addToTree = (component: VisualComponent): VisualComponent => {
      if (!parentId || component.id === parentId) {
        return {
          ...component,
          children: [...component.children, newComponent]
        };
      }
      return {
        ...component,
        children: component.children.map(addToTree)
      };
    };
    
    set({
      currentProject: {
        ...currentProject,
        rootComponent: addToTree(currentProject.rootComponent)
      },
      selectedComponent: newComponent.id
    });
  },

  updateComponent: (id, updates) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    const updateInTree = (component: VisualComponent): VisualComponent => {
      if (component.id === id) {
        return { ...component, ...updates };
      }
      return {
        ...component,
        children: component.children.map(updateInTree)
      };
    };
    
    set({
      currentProject: {
        ...currentProject,
        rootComponent: updateInTree(currentProject.rootComponent)
      }
    });
  },

  deleteComponent: (id) => {
    const { currentProject, selectedComponent } = get();
    if (!currentProject || id === 'root') return;
    
    const deleteFromTree = (component: VisualComponent): VisualComponent => {
      return {
        ...component,
        children: component.children
          .filter(c => c.id !== id)
          .map(deleteFromTree)
      };
    };
    
    set({
      currentProject: {
        ...currentProject,
        rootComponent: deleteFromTree(currentProject.rootComponent)
      },
      selectedComponent: selectedComponent === id ? null : selectedComponent
    });
  },

  duplicateComponent: (id) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    let componentToDuplicate: VisualComponent | null = null;
    
    const findComponent = (component: VisualComponent): void => {
      if (component.id === id) {
        componentToDuplicate = component;
      } else {
        component.children.forEach(findComponent);
      }
    };
    
    findComponent(currentProject.rootComponent);
    
    if (!componentToDuplicate) return;
    
    const duplicate = (comp: VisualComponent): VisualComponent => ({
      ...comp,
      id: `component-${Date.now()}-${Math.random()}`,
      children: comp.children.map(duplicate)
    });
    
    const duplicated = duplicate(componentToDuplicate);
    
    const addSibling = (component: VisualComponent): VisualComponent => {
      if (component.children.some(c => c.id === id)) {
        const index = component.children.findIndex(c => c.id === id);
        const newChildren = [...component.children];
        newChildren.splice(index + 1, 0, duplicated);
        return { ...component, children: newChildren };
      }
      return {
        ...component,
        children: component.children.map(addSibling)
      };
    };
    
    set({
      currentProject: {
        ...currentProject,
        rootComponent: addSibling(currentProject.rootComponent)
      }
    });
  },

  moveComponent: (componentId, newParentId, index) => {
    // Implementation for reordering components
    console.log('Move component:', componentId, 'to', newParentId, 'at', index);
  },

  selectComponent: (id) => {
    set({ selectedComponent: id });
  },

  setHoveredComponent: (id) => {
    set({ hoveredComponent: id });
  },

  startDrag: (component) => {
    set({
      dragState: {
        isDragging: true,
        draggedComponent: component,
        dropTarget: null
      }
    });
  },

  setDropTarget: (targetId) => {
    set(state => ({
      dragState: {
        ...state.dragState,
        dropTarget: targetId
      }
    }));
  },

  endDrag: () => {
    const { dragState, addComponent } = get();
    
    if (dragState.draggedComponent && dragState.dropTarget && 'category' in dragState.draggedComponent) {
      addComponent(dragState.draggedComponent as ComponentLibraryItem, dragState.dropTarget);
    }
    
    set({
      dragState: {
        isDragging: false,
        draggedComponent: null,
        dropTarget: null
      }
    });
  },

  updateTheme: (themeUpdates) => {
    set(state => ({
      currentTheme: { ...state.currentTheme, ...themeUpdates }
    }));
  },

  saveCustomTheme: (theme) => {
    set(state => ({
      customThemes: [...state.customThemes, theme]
    }));
  },

  applyTheme: (themeName) => {
    const { customThemes } = get();
    const theme = customThemes.find(t => t.name === themeName) || defaultTheme;
    set({ currentTheme: theme });
  },

  exportCode: (options) => {
    const { currentProject, components, currentTheme } = get();
    if (!currentProject || components.length === 0) {
      console.error('No project or components to export');
      return '';
    }

    const rootComponent = components[0];
    
    if (options.exportType === 'component') {
      const result = exportComponent(
        rootComponent,
        options.framework,
        options,
        currentTheme
      );
      
      // Create download
      const blob = new Blob([result.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      
      return result.code;
    } else {
      const result = exportProject(
        rootComponent,
        currentTheme,
        options.framework,
        currentProject.name
      );
      
      // Create download as JSON (zip would require additional library)
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name}-project.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      return result.instructions;
    }
  },

  togglePreview: () => {
    set(state => ({ previewMode: !state.previewMode }));
  },

  setPreviewFramework: (framework) => {
    set({ previewFramework: framework });
  }
}));
