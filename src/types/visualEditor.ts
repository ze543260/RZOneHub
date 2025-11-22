export type ComponentType = 
  | 'container'
  | 'button'
  | 'input'
  | 'text'
  | 'image'
  | 'card'
  | 'list'
  | 'grid'
  | 'flexbox'
  | 'navbar'
  | 'sidebar'
  | 'footer'
  | 'modal'
  | 'dropdown'
  | 'tabs'
  | 'accordion'
  | 'form'
  | 'table';

export type Framework = 'react' | 'vue' | 'svelte' | 'html';

export interface ComponentStyle {
  // Layout
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  padding?: string;
  margin?: string;
  
  // Size
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  
  // Colors
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  
  // Border
  border?: string;
  borderRadius?: string;
  borderWidth?: string;
  
  // Typography
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: string;
  lineHeight?: string;
  
  // Effects
  boxShadow?: string;
  opacity?: string;
  transform?: string;
  transition?: string;
  cursor?: string;
  
  // Grid/Flex
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridGap?: string;
  
  // Position
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: string;
}

export interface ComponentProps {
  // Common
  id?: string;
  className?: string;
  children?: string;
  
  // Interactive
  onClick?: string;
  onChange?: string;
  onSubmit?: string;
  
  // Input specific
  placeholder?: string;
  value?: string;
  type?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  
  // Image specific
  src?: string;
  alt?: string;
  
  // Link specific
  href?: string;
  target?: string;
  
  // Button specific
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  
  // Text specific
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  
  // Custom
  [key: string]: any;
}

export interface VisualComponent {
  id: string;
  type: ComponentType;
  label: string;
  style: ComponentStyle;
  props: ComponentProps;
  children: VisualComponent[];
  parent?: string;
}

export interface ComponentLibraryItem {
  id: string;
  type: ComponentType;
  label: string;
  icon: string;
  category: 'layout' | 'form' | 'display' | 'navigation' | 'feedback';
  defaultStyle: ComponentStyle;
  defaultProps: ComponentProps;
  preview: string;
}

export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    headingFont?: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface VisualEditorProject {
  id: string;
  name: string;
  framework: Framework;
  theme: ThemeConfig;
  rootComponent: VisualComponent;
  createdAt: number;
  updatedAt: number;
}

export interface ExportOptions {
  framework: Framework;
  exportType: 'component' | 'project';
  includeStyles: boolean;
  useModules: boolean;
  typescript: boolean;
  prettify: boolean;
}

export interface DragState {
  isDragging: boolean;
  draggedComponent: ComponentLibraryItem | VisualComponent | null;
  dropTarget: string | null;
}
