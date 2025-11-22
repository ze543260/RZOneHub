import { useState } from 'react';
import { X, Palette, Save, RefreshCw, Eye } from 'lucide-react';
import { useVisualEditorStore } from '../store/visualEditorStore';
import type { ThemeConfig } from '../types/visualEditor';

interface ThemeBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeBuilder({ isOpen, onClose }: ThemeBuilderProps) {
  const { currentTheme, updateTheme, saveCustomTheme } = useVisualEditorStore();
  const [localTheme, setLocalTheme] = useState<ThemeConfig>(currentTheme);
  const [themeName, setThemeName] = useState('Custom Theme');

  const updateColor = (key: keyof typeof localTheme.colors, value: string) => {
    setLocalTheme({
      ...localTheme,
      colors: { ...localTheme.colors, [key]: value }
    });
  };

  const updateTypography = (category: keyof typeof localTheme.typography, key: string, value: string) => {
    setLocalTheme({
      ...localTheme,
      typography: {
        ...localTheme.typography,
        [category]: typeof localTheme.typography[category] === 'string'
          ? value
          : { ...(localTheme.typography[category] as any), [key]: value }
      }
    });
  };

  const updateSpacing = (key: keyof typeof localTheme.spacing, value: string) => {
    setLocalTheme({
      ...localTheme,
      spacing: { ...localTheme.spacing, [key]: value }
    });
  };

  const updateBorderRadius = (key: keyof typeof localTheme.borderRadius, value: string) => {
    setLocalTheme({
      ...localTheme,
      borderRadius: { ...localTheme.borderRadius, [key]: value }
    });
  };

  const handleApply = () => {
    updateTheme(localTheme);
  };

  const handleSave = () => {
    const namedTheme = { ...localTheme, name: themeName };
    saveCustomTheme(namedTheme);
    updateTheme(namedTheme);
    onClose();
  };

  const handleReset = () => {
    setLocalTheme(currentTheme);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-theme-bg-secondary border border-theme-border rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-theme-accent" />
            <h2 className="text-xl font-bold text-theme-text">Theme Builder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-theme-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-theme-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Colors */}
            <div>
              <h3 className="text-lg font-semibold text-theme-text mb-4">🎨 Colors</h3>
              <div className="space-y-3">
                {Object.entries(localTheme.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => updateColor(key as any, e.target.value)}
                      className="w-12 h-10 rounded border border-theme-border cursor-pointer"
                    />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-theme-text capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateColor(key as any, e.target.value)}
                        className="w-full px-2 py-1 bg-theme-bg border border-theme-border rounded text-xs text-theme-text mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <h3 className="text-lg font-semibold text-theme-text mb-4">✍️ Typography</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-theme-text">Font Family</label>
                  <input
                    type="text"
                    value={localTheme.typography.fontFamily}
                    onChange={(e) => updateTypography('fontFamily', '', e.target.value)}
                    className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded text-theme-text mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-theme-text mb-2 block">Font Sizes</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(localTheme.typography.fontSize).map(([size, value]) => (
                      <div key={size}>
                        <label className="text-xs text-theme-text-secondary">{size}</label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateTypography('fontSize', size, e.target.value)}
                          className="w-full px-2 py-1 bg-theme-bg border border-theme-border rounded text-xs text-theme-text"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-theme-text mb-2 block">Font Weights</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(localTheme.typography.fontWeight).map(([weight, value]) => (
                      <div key={weight}>
                        <label className="text-xs text-theme-text-secondary">{weight}</label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateTypography('fontWeight', weight, e.target.value)}
                          className="w-full px-2 py-1 bg-theme-bg border border-theme-border rounded text-xs text-theme-text"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Spacing */}
            <div>
              <h3 className="text-lg font-semibold text-theme-text mb-4">📏 Spacing</h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(localTheme.spacing).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-xs text-theme-text-secondary uppercase">{key}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateSpacing(key as any, e.target.value)}
                      className="w-full px-2 py-1 bg-theme-bg border border-theme-border rounded text-xs text-theme-text"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <h3 className="text-lg font-semibold text-theme-text mb-4">🔘 Border Radius</h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(localTheme.borderRadius).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-xs text-theme-text-secondary uppercase">{key}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateBorderRadius(key as any, e.target.value)}
                      className="w-full px-2 py-1 bg-theme-bg border border-theme-border rounded text-xs text-theme-text"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Shadows */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-theme-text mb-4">✨ Shadows</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(localTheme.shadows).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-sm text-theme-text-secondary capitalize">{key}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setLocalTheme({
                        ...localTheme,
                        shadows: { ...localTheme.shadows, [key]: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded text-xs text-theme-text font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-theme-text mb-4">👁️ Preview</h3>
              <div 
                className="p-6 rounded-lg border"
                style={{
                  backgroundColor: localTheme.colors.background,
                  borderColor: localTheme.colors.border,
                  color: localTheme.colors.text,
                  fontFamily: localTheme.typography.fontFamily
                }}
              >
                <h4 
                  className="font-bold mb-2"
                  style={{ 
                    fontSize: localTheme.typography.fontSize['2xl'],
                    color: localTheme.colors.primary
                  }}
                >
                  Theme Preview
                </h4>
                <p 
                  className="mb-4"
                  style={{ fontSize: localTheme.typography.fontSize.base }}
                >
                  This is how your theme will look with different text colors.
                </p>
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 rounded"
                    style={{
                      backgroundColor: localTheme.colors.primary,
                      color: '#fff',
                      borderRadius: localTheme.borderRadius.md,
                      boxShadow: localTheme.shadows.md
                    }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded"
                    style={{
                      backgroundColor: localTheme.colors.secondary,
                      color: '#fff',
                      borderRadius: localTheme.borderRadius.md
                    }}
                  >
                    Secondary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded"
                    style={{
                      backgroundColor: localTheme.colors.accent,
                      color: '#fff',
                      borderRadius: localTheme.borderRadius.md
                    }}
                  >
                    Accent Button
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-theme-border bg-theme-bg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="Theme Name"
                className="px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-theme-bg-secondary border border-theme-border hover:bg-theme-bg rounded-lg text-theme-text transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-theme-bg-secondary border border-theme-border hover:bg-theme-bg rounded-lg text-theme-text transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Apply
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-theme-accent hover:bg-theme-accent/80 rounded-lg text-white transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Theme
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
