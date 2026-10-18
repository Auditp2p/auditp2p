/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        binance: {
          yellow: '#F0B90B',
          yellowHover: '#DFA30A',
          yellowLight: '#FDF2D0',
          darkBg: '#12161C',
          darkSurface: '#181A20',
          darkCard: '#1E2329',
          darkBorder: '#2B313A',
          buy: '#0ECB81',
          buyHover: '#0CA96C',
          buyLight: 'rgba(14, 203, 129, 0.12)',
          sell: '#F6465D',
          sellHover: '#D9384E',
          sellLight: 'rgba(246, 70, 93, 0.12)',
          textMuted: '#848E9C',
          textPrimary: '#EAECEF',
        },
      },
    },
  },
  plugins: [],
}
