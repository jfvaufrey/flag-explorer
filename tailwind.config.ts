import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#dce8ff',
          200: '#bcd3ff',
          300: '#89b4ff',
          400: '#5087ff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e3a8a',
          800: '#1e2d5e',
          900: '#0f172a',
          950: '#060b18',
        },
        coral: {
          50: '#fff5f5',
          100: '#ffe0e0',
          200: '#ffc5c5',
          300: '#ff9999',
          400: '#ff6666',
          500: '#ff4444',
          600: '#e63c3c',
          700: '#cc2222',
          800: '#aa1a1a',
          900: '#881212',
        },
        yellow: {
          50: '#fffef0',
          100: '#fffcd0',
          200: '#fff8a0',
          300: '#fff066',
          400: '#ffe033',
          500: '#ffd700',
          600: '#e6c200',
          700: '#b39600',
          800: '#806c00',
          900: '#4d4000',
        },
      },
      fontFamily: {
        'fredoka': ['Fredoka One', 'cursive'],
        'nunito': ['Nunito', 'sans-serif'],
      },
      animation: {
        'confetti': 'confetti 1s ease-in-out',
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pop': 'pop 0.3s ease-out',
      },
      keyframes: {
        confetti: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '0.8' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '0' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.9)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
