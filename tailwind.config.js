/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f7f4f0',
          100: '#ede7de',
          200: '#d9cfc2',
          300: '#c3b29f',
          400: '#ab9278',
          500: '#96795a',
          600: '#7d6249',
          700: '#664f3c',
          800: '#534033',
          900: '#46372d',
          950: '#261d17',
        },
        paper: {
          50: '#fdfcfa',
          100: '#faf7f2',
          200: '#f4ede2',
          300: '#ecdfd0',
          400: '#e0ccb5',
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.ink.800'),
            a: { color: theme('colors.ink.600'), '&:hover': { color: theme('colors.ink.900') } },
            'h1,h2,h3,h4': { fontFamily: 'var(--font-lora)', color: theme('colors.ink.950') },
            code: { backgroundColor: theme('colors.paper.200'), borderRadius: '0.25rem', padding: '0.1em 0.3em' },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: { backgroundColor: theme('colors.ink.950') },
          },
        },
      }),
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-in': 'slideIn 0.5s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
