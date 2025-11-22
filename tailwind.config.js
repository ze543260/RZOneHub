/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#8b5cf6',
          light: '#a855f7',
          dark: '#6d28d9',
        },
        theme: {
          bg: 'rgb(var(--theme-bg) / <alpha-value>)',
          'bg-secondary': 'rgb(var(--theme-bg-secondary) / <alpha-value>)',
          text: 'rgb(var(--theme-text) / <alpha-value>)',
          'text-secondary': 'rgb(var(--theme-text-secondary) / <alpha-value>)',
          border: 'rgb(var(--theme-border) / <alpha-value>)',
          accent: 'rgb(var(--theme-accent) / <alpha-value>)',
        },
      },
      backgroundColor: {
        'themed-bg': 'rgb(var(--theme-bg) / <alpha-value>)',
        'themed-bg-secondary': 'rgb(var(--theme-bg-secondary) / <alpha-value>)',
      },
      textColor: {
        'themed': 'rgb(var(--theme-text) / <alpha-value>)',
        'themed-secondary': 'rgb(var(--theme-text-secondary) / <alpha-value>)',
      },
      borderColor: {
        'themed': 'rgb(var(--theme-border) / <alpha-value>)',
      },
      boxShadow: {
        glow: '0 0 30px rgba(139, 92, 246, 0.25)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
