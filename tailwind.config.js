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
      },
      boxShadow: {
        glow: '0 0 30px rgba(139, 92, 246, 0.25)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
