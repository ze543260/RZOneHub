import type { VisualComponent, Framework, ExportOptions, ThemeConfig } from '../types/visualEditor';

// Convert style object to CSS string
function styleToCss(style: Record<string, any>): string {
  return Object.entries(style)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join('; ');
}

// Convert style object to React inline style object
function styleToReactObject(style: Record<string, any>): string {
  const entries = Object.entries(style)
    .map(([key, value]) => `${key}: '${value}'`)
    .join(',\n    ');
  return `{\n    ${entries}\n  }`;
}

// Generate React Component
function generateReactComponent(component: VisualComponent, indent = 0): string {
  const spaces = '  '.repeat(indent);
  const { type, props, style, children } = component;
  
  const styleAttr = Object.keys(style).length > 0
    ? `style={${styleToReactObject(style)}}`
    : '';
  
  const propsStr = Object.entries(props)
    .filter(([key]) => key !== 'children' && key !== 'as')
    .map(([key, value]) => {
      if (typeof value === 'boolean') return value ? key : '';
      if (typeof value === 'string') return `${key}="${value}"`;
      return `${key}={${JSON.stringify(value)}}`;
    })
    .filter(Boolean)
    .join(' ');
  
  let tag: string = type;
  if (type === 'text') tag = (props.as as string) || 'p';
  if (type === 'container' || type === 'flexbox' || type === 'grid') tag = 'div';
  if (type === 'card') tag = 'div';
  if (type === 'navbar' || type === 'footer') tag = 'nav';
  
  const allProps = [styleAttr, propsStr].filter(Boolean).join(' ');
  
  if (children.length === 0 && !props.children) {
    return `${spaces}<${tag}${allProps ? ' ' + allProps : ''} />`;
  }
  
  const content = props.children || children.map(child => 
    generateReactComponent(child, indent + 1)
  ).join('\n');
  
  return `${spaces}<${tag}${allProps ? ' ' + allProps : ''}>
${typeof content === 'string' && !content.includes('<') ? spaces + '  ' + content : content}
${spaces}</${tag}>`;
}

// Generate Vue Component
function generateVueComponent(component: VisualComponent, indent = 0): string {
  const spaces = '  '.repeat(indent);
  const { type, props, style, children } = component;
  
  const styleAttr = Object.keys(style).length > 0
    ? `:style="{ ${Object.entries(style).map(([k, v]) => `${k}: '${v}'`).join(', ')} }"`
    : '';
  
  const propsStr = Object.entries(props)
    .filter(([key]) => key !== 'children' && key !== 'as')
    .map(([key, value]) => {
      if (typeof value === 'boolean') return value ? key : '';
      if (typeof value === 'string' && key.startsWith('on')) return `@${key.slice(2).toLowerCase()}="${value}"`;
      if (typeof value === 'string') return `:${key}="${value}"`;
      return `:${key}="${JSON.stringify(value)}"`;
    })
    .filter(Boolean)
    .join(' ');
  
  let tag: string = type;
  if (type === 'text') tag = (props.as as string) || 'p';
  if (type === 'container' || type === 'flexbox' || type === 'grid') tag = 'div';
  if (type === 'card') tag = 'div';
  if (type === 'navbar' || type === 'footer') tag = 'nav';
  
  const allProps = [styleAttr, propsStr].filter(Boolean).join(' ');
  
  if (children.length === 0 && !props.children) {
    return `${spaces}<${tag}${allProps ? ' ' + allProps : ''} />`;
  }
  
  const content = props.children || children.map(child => 
    generateVueComponent(child, indent + 1)
  ).join('\n');
  
  return `${spaces}<${tag}${allProps ? ' ' + allProps : ''}>
${typeof content === 'string' && !content.includes('<') ? spaces + '  ' + content : content}
${spaces}</${tag}>`;
}

// Generate Svelte Component
function generateSvelteComponent(component: VisualComponent, indent = 0): string {
  const spaces = '  '.repeat(indent);
  const { type, props, style, children } = component;
  
  const styleAttr = Object.keys(style).length > 0
    ? `style="${styleToCss(style)}"`
    : '';
  
  const propsStr = Object.entries(props)
    .filter(([key]) => key !== 'children' && key !== 'as')
    .map(([key, value]) => {
      if (typeof value === 'boolean') return value ? key : '';
      if (typeof value === 'string' && key.startsWith('on')) return `on:${key.slice(2).toLowerCase()}={${value}}`;
      return `${key}="${value}"`;
    })
    .filter(Boolean)
    .join(' ');
  
  let tag = type;
  if (type === 'text') tag = props.as || 'p';
  if (type === 'container' || type === 'flexbox' || type === 'grid') tag = 'div';
  if (type === 'card') tag = 'div';
  
  const allProps = [styleAttr, propsStr].filter(Boolean).join(' ');
  
  if (children.length === 0 && !props.children) {
    return `${spaces}<${tag}${allProps ? ' ' + allProps : ''} />`;
  }
  
  const content = props.children || children.map(child => 
    generateSvelteComponent(child, indent + 1)
  ).join('\n');
  
  return `${spaces}<${tag}${allProps ? ' ' + allProps : ''}>
${typeof content === 'string' && !content.includes('<') ? spaces + '  ' + content : content}
${spaces}</${tag}>`;
}

// Generate HTML
function generateHTML(component: VisualComponent, indent = 0): string {
  const spaces = '  '.repeat(indent);
  const { type, props, style, children } = component;
  
  const styleAttr = Object.keys(style).length > 0
    ? `style="${styleToCss(style)}"`
    : '';
  
  const propsStr = Object.entries(props)
    .filter(([key]) => key !== 'children' && key !== 'as')
    .map(([key, value]) => {
      if (typeof value === 'boolean') return value ? key : '';
      return `${key}="${value}"`;
    })
    .filter(Boolean)
    .join(' ');
  
  let tag = type;
  if (type === 'text') tag = props.as || 'p';
  if (type === 'container' || type === 'flexbox' || type === 'grid') tag = 'div';
  if (type === 'card') tag = 'div';
  
  const allProps = [styleAttr, propsStr].filter(Boolean).join(' ');
  
  if (children.length === 0 && !props.children) {
    return `${spaces}<${tag}${allProps ? ' ' + allProps : ''}></${tag}>`;
  }
  
  const content = props.children || children.map(child => 
    generateHTML(child, indent + 1)
  ).join('\n');
  
  return `${spaces}<${tag}${allProps ? ' ' + allProps : ''}>
${typeof content === 'string' && !content.includes('<') ? spaces + '  ' + content : content}
${spaces}</${tag}>`;
}

// Generate theme CSS variables
function generateThemeCSS(theme: ThemeConfig): string {
  return `:root {
  /* Colors */
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-accent: ${theme.colors.accent};
  --color-background: ${theme.colors.background};
  --color-surface: ${theme.colors.surface};
  --color-text: ${theme.colors.text};
  --color-text-secondary: ${theme.colors.textSecondary};
  --color-border: ${theme.colors.border};
  --color-error: ${theme.colors.error};
  --color-warning: ${theme.colors.warning};
  --color-success: ${theme.colors.success};
  --color-info: ${theme.colors.info};
  
  /* Typography */
  --font-family: ${theme.typography.fontFamily};
  --font-size-xs: ${theme.typography.fontSize.xs};
  --font-size-sm: ${theme.typography.fontSize.sm};
  --font-size-base: ${theme.typography.fontSize.base};
  --font-size-lg: ${theme.typography.fontSize.lg};
  --font-size-xl: ${theme.typography.fontSize.xl};
  --font-size-2xl: ${theme.typography.fontSize['2xl']};
  --font-size-3xl: ${theme.typography.fontSize['3xl']};
  
  /* Spacing */
  --spacing-xs: ${theme.spacing.xs};
  --spacing-sm: ${theme.spacing.sm};
  --spacing-md: ${theme.spacing.md};
  --spacing-lg: ${theme.spacing.lg};
  --spacing-xl: ${theme.spacing.xl};
  --spacing-2xl: ${theme.spacing['2xl']};
  
  /* Border Radius */
  --radius-sm: ${theme.borderRadius.sm};
  --radius-md: ${theme.borderRadius.md};
  --radius-lg: ${theme.borderRadius.lg};
  --radius-xl: ${theme.borderRadius.xl};
  --radius-full: ${theme.borderRadius.full};
  
  /* Shadows */
  --shadow-sm: ${theme.shadows.sm};
  --shadow-md: ${theme.shadows.md};
  --shadow-lg: ${theme.shadows.lg};
  --shadow-xl: ${theme.shadows.xl};
}`;
}

// Main export function
export function exportComponent(
  component: VisualComponent,
  framework: Framework,
  options: ExportOptions,
  theme?: ThemeConfig
): { code: string; filename: string; language: string } {
  let code = '';
  let filename = 'Component';
  let language = '';
  
  switch (framework) {
    case 'react':
      const reactCode = generateReactComponent(component);
      code = options.typescript
        ? `import React from 'react';

interface ComponentProps {
  // Add your props here
}

export default function Component(props: ComponentProps) {
  return (
${reactCode}
  );
}
${options.includeStyles && theme ? `\n/* Theme Variables */\n${generateThemeCSS(theme)}` : ''}`
        : `import React from 'react';

export default function Component(props) {
  return (
${reactCode}
  );
}
${options.includeStyles && theme ? `\n/* Theme Variables */\n${generateThemeCSS(theme)}` : ''}`;
      filename = options.typescript ? 'Component.tsx' : 'Component.jsx';
      language = 'typescript';
      break;
      
    case 'vue':
      const vueCode = generateVueComponent(component);
      code = `<template>
${vueCode}
</template>

<script${options.typescript ? ' lang="ts"' : ''}>
export default {
  name: 'Component',
  props: {
    // Add your props here
  }
}
</script>

${options.includeStyles && theme ? `<style scoped>\n${generateThemeCSS(theme)}\n</style>` : '<style scoped>\n/* Add your styles here */\n</style>'}`;
      filename = 'Component.vue';
      language = 'vue';
      break;
      
    case 'svelte':
      const svelteCode = generateSvelteComponent(component);
      code = `<script${options.typescript ? ' lang="ts"' : ''}>
  // Add your logic here
</script>

${svelteCode}

${options.includeStyles && theme ? `<style>\n${generateThemeCSS(theme)}\n</style>` : '<style>\n/* Add your styles here */\n</style>'}`;
      filename = 'Component.svelte';
      language = 'svelte';
      break;
      
    case 'html':
      const htmlCode = generateHTML(component);
      code = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component</title>
  ${options.includeStyles && theme ? `<style>\n${generateThemeCSS(theme)}\n  </style>` : ''}
</head>
<body>
${htmlCode}
</body>
</html>`;
      filename = 'component.html';
      language = 'html';
      break;
  }
  
  // Prettify if option is enabled (basic formatting)
  if (options.prettify) {
    code = code.split('\n').map(line => line.trimEnd()).join('\n');
  }
  
  return { code, filename, language };
}

// Export entire project
export function exportProject(
  rootComponent: VisualComponent,
  theme: ThemeConfig,
  framework: Framework,
  projectName: string
): { files: Array<{ path: string; content: string }>; instructions: string } {
  const files: Array<{ path: string; content: string }> = [];
  
  const mainComponent = exportComponent(rootComponent, framework, {
    framework,
    exportType: 'component',
    includeStyles: true,
    useModules: true,
    typescript: true,
    prettify: true
  }, theme);
  
  files.push({
    path: `src/${mainComponent.filename}`,
    content: mainComponent.code
  });
  
  // Add package.json
  const dependencies: Record<Framework, Record<string, string>> = {
    react: { 'react': '^18.0.0', 'react-dom': '^18.0.0' },
    vue: { 'vue': '^3.0.0' },
    svelte: { 'svelte': '^4.0.0' },
    html: {}
  };
  
  if (framework !== 'html') {
    files.push({
      path: 'package.json',
      content: JSON.stringify({
        name: projectName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        type: 'module',
        dependencies: dependencies[framework]
      }, null, 2)
    });
  }
  
  const instructions = framework === 'html'
    ? 'Open component.html in your browser'
    : `1. Run: npm install\n2. Start development server\n3. Import the component in your app`;
  
  return { files, instructions };
}
