/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#06080e',
          900: '#0a0e19',
          850: '#0f1525',
          800: '#141c30',
          750: '#19233c',
          700: '#202c4b',
          600: '#2e3d66',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        emerald: {
          450: '#10b981',
          500: '#059669',
        },
        rose: {
          450: '#f43f5e',
          500: '#e11d48',
        },
        cyan: {
          450: '#06b6d4',
          500: '#0891b2',
        },
        amber: {
          450: '#f59e0b',
          500: '#d97706',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Calistoga', 'serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'card-elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.07)',
        'card-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.3)',
        'inset-specular': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 4s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
