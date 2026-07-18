/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        netshield: {
          bg: '#0F1720',
          panel: '#233D4C',
          card: '#1B2838',
          accent: '#FD802E',
          accentHover: '#FF9C4A',
          healthy: '#22C55E',
          virus: '#EF4444',
          recovery: '#3B82F6',
          wire: '#4B5563',
          textPrimary: '#F8FAFC',
          textSecondary: '#CBD5E1',
          textMuted: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
