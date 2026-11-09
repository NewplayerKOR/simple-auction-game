/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF7',
          100: '#FAF4E6',
          200: '#F4E4BD',
          300: '#ECD28F',
          400: '#E2BF62',
          500: '#D4AF37', // Sotheby Royal Gold
          600: '#B89228',
          700: '#94721D',
          800: '#735718',
          900: '#5A4315',
          950: '#3B2A0B',
        },
        navy: {
          800: '#141E33',
          900: '#0F172A', // Deep Navy
          950: '#080C17',
        },
        velvet: {
          800: '#3D0C13',
          900: '#2A080D',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['system-ui', '-apple-system', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gavel-strike': 'strike 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
      },
      keyframes: {
        strike: {
          '0%': { transform: 'rotate(-45deg)' },
          '60%': { transform: 'rotate(15deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        sparkle: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(1.1)' },
        }
      }
    },
  },
  plugins: [],
}
