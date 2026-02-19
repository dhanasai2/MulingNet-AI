/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#0a0c10',
          900: '#0d1117',
          800: '#161b22',
          700: '#1c2333',
          600: '#21262d',
          500: '#30363d',
          400: '#484f58',
        },
        accent: {
          blue: '#58a6ff',
          purple: '#bc8cff',
          violet: '#a78bfa',
          indigo: '#818cf8',
          green: '#3fb950',
          red: '#f85149',
          orange: '#d29922',
          cyan: '#39d2c0',
          pink: '#f472b6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(99,102,241,0.12)',
        'glow-md': '0 0 20px rgba(99,102,241,0.18)',
        'glow-lg': '0 0 40px rgba(99,102,241,0.22)',
        'glow-blue': '0 0 16px rgba(56,189,248,0.15)',
        'glow-red': '0 0 16px rgba(248,81,73,0.15)',
        'card': '0 4px 20px -4px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.04)',
      },
    },
  },
  plugins: [],
}
