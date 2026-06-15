import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#D4AF37',
          500: '#B8960C',
          600: '#9A7D0A',
          700: '#7D6608',
          800: '#5C4A07',
          900: '#3A2E05',
        },
        luxury: {
          black:  '#0A0A0A',
          dark:   '#111111',
          card:   '#1A1A1A',
          border: '#2A2A2A',
          muted:  '#888888',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'shimmer':    'shimmer 2s infinite',
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan':       'scan 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-gold': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        scan: {
          '0%, 100%': { transform: 'translateY(-100%)' },
          '50%':      { transform: 'translateY(100%)' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F5E07A 50%, #B8960C 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
