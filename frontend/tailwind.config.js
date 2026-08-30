/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sui: {
          blue: '#4DA2FF',
          dark: '#0B132B',
          card: '#111D4A',
          border: '#1E2E6B',
        },
        rarity: {
          common: '#94A3B8',
          rare: '#38BDF8',
          epic: '#A855F7',
          legendary: '#F59E0B',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0) rotate(-1deg)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0) rotate(2deg)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0) rotate(-3deg)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0) rotate(3deg)' }
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 15px rgba(77, 162, 255, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 35px rgba(168, 85, 247, 0.8))' }
        }
      }
    },
  },
  plugins: [],
}
