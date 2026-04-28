/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#FFF4EC',
          100: '#FFE4D1',
          200: '#FFCBA8',
          300: '#FFA875',
          400: '#FF8A4C',
          500: '#F26B1F',
          600: '#D9531A',
          700: '#B14215',
          800: '#8A2E0F',
          900: '#5C1F0A',
        },
        cream: '#FFFAF5',
        success: { 50: '#E8F7EE', 500: '#2BB673' },
        warning: { 50: '#FFF4E0', 500: '#F2A93B' },
        danger:  { 500: '#E84C3D' },
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 30px rgba(242,107,31,0.12)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
};
