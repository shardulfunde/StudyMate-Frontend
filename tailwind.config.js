/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sm: {
          base: '#FFFFFF',
          text: '#1F2937',
          textMuted: '#374151',
          border: '#E5E7EB',
          accent: '#2563EB',
          accentSoft: '#DBEAFE'
        }
      },
      boxShadow: {
        smcard: '0 10px 30px rgba(15, 23, 42, 0.08)'
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
