/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          dark: '#0D0F12',
          surface: '#16191E',
          card: '#1F242C',
          border: '#2E3540',
          accent: '#C8A97E',
          accentHover: '#B8986D',
          gold: '#D4AF37',
          warmWhite: '#FAF8F5',
          cream: '#F4EFE6',
          muted: '#8A94A6',
        },
        brand: {
          50: '#FBF8F3',
          100: '#F5ECE0',
          200: '#EBD9C1',
          300: '#DEC29D',
          400: '#C8A97E',
          500: '#B08E5F',
          600: '#947348',
          700: '#755835',
          800: '#5A4328',
          900: '#3D2D1B',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Cabinet Grotesk', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'luxury-hover': '0 20px 40px -15px rgba(200, 169, 126, 0.18)',
        'glow': '0 0 25px rgba(200, 169, 126, 0.35)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
      },
    },
  },
  plugins: [],
}
