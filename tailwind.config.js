/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#0066FF', // Azul Elétrico Principal
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0F172A', // Navy Escuro Premium
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#090d16',
        },
        emerald: {
          500: '#10b981',
          600: '#059669',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'card': '0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 2px 4px -2px rgba(15, 23, 42, 0.03)',
        'float': '0 10px 25px -5px rgba(0, 102, 255, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
}
