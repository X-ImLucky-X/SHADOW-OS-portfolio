import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
        },
        accent: {
          green: 'var(--accent-green)',
          violet: 'var(--accent-violet)',
          pink: 'var(--accent-pink)',
          cyan: 'var(--accent-cyan)',
          amber: 'var(--accent-amber)',
        },
      },
      fontSize: {
        'xs': ['0.9rem', { lineHeight: '1.25rem' }],
        'sm': ['1.05rem', { lineHeight: '1.5rem' }],
        'base': ['1.25rem', { lineHeight: '1.75rem' }],
        'lg': ['1.45rem', { lineHeight: '2rem' }],
        'xl': ['1.7rem', { lineHeight: '2.25rem' }],
        '2xl': ['2rem', { lineHeight: '2.5rem' }],
        '3xl': ['2.5rem', { lineHeight: '3rem' }],
        '4xl': ['3.5rem', { lineHeight: '1' }],
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 15px rgba(0, 245, 160, 0.35)',
        'glow-violet': '0 0 15px rgba(124, 58, 237, 0.35)',
        'glow-pink': '0 0 15px rgba(240, 0, 184, 0.35)',
        'glow-cyan': '0 0 15px rgba(0, 212, 255, 0.35)',
        'window-focus': '0 0 30px rgba(124, 58, 237, 0.2)',
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        blink: {
          '50%': { opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
