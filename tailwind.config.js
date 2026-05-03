/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sm: {
          base: '#FFFFFF',
          text: '#0f172a',
          textMuted: '#475569',
          border: '#e2e8f0',
          accent: '#2563eb',
          accentSoft: '#dbeafe'
        }
      },
      boxShadow: {
        smcard: '0 1px 2px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        softPop: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' }
        },
        slideDown: {
          '0%': { opacity: '0', maxHeight: '0' },
          '100%': { opacity: '1', maxHeight: '560px' }
        },
        thinkWave: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.5' },
          '50%': { transform: 'translateY(-4px)', opacity: '1' }
        }
      },
      animation: {
        fadeInUp: 'fadeInUp 220ms ease-out forwards',
        softPop: 'softPop 240ms ease-out forwards',
        shimmer: 'shimmer 1.5s linear infinite',
        pulseDot: 'pulseDot 1.2s ease-in-out infinite',
        slideDown: 'slideDown 260ms ease-out forwards',
        thinkWave: 'thinkWave 1.05s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
