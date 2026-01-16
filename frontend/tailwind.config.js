/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Book-inspired color palette
      colors: {
        // Paper tones
        paper: {
          50: '#FFFDF7',
          100: '#FBF8F1',
          200: '#F5F0E6',
          300: '#EDE6D6',
          400: '#E4DBC7',
          500: '#D4C9B5',
        },
        // Ink tones for text
        ink: {
          50: '#F7F6F5',
          100: '#E8E6E3',
          200: '#D1CDC7',
          300: '#A9A29A',
          400: '#7A7168',
          500: '#4A4239',
          600: '#3A342C',
          700: '#2D2822',
          800: '#1F1B17',
          900: '#141210',
        },
        // Government blue - trustworthy
        setu: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // Warm accent for actions
        warm: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        // Success green
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
        },
        // Danger red
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      // Typography scale for book-like reading
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem', { lineHeight: '1.75' }],
        'lg': ['1.125rem', { lineHeight: '1.75' }],
        'xl': ['1.25rem', { lineHeight: '1.75' }],
        '2xl': ['1.5rem', { lineHeight: '1.5' }],
        '3xl': ['1.875rem', { lineHeight: '1.4' }],
        '4xl': ['2.25rem', { lineHeight: '1.3' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
      },
      // Subtle shadows for paper depth
      boxShadow: {
        'paper': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
        'paper-hover': '0 2px 8px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.04)',
        'page': '0 0 0 1px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.04), 4px 8px 24px rgba(0, 0, 0, 0.06)',
        'book': 'inset 0 0 30px rgba(0, 0, 0, 0.02), 0 0 0 1px rgba(0, 0, 0, 0.04)',
      },
      // Smooth transitions
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
      },
      transitionTimingFunction: {
        'page': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Spacing for comfortable reading
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      // Border radius
      borderRadius: {
        'page': '0.375rem',
      },
      // Max widths for readable text
      maxWidth: {
        'prose': '65ch',
        'page': '900px',
        'book': '1200px',
      },
    },
  },
  plugins: [],
}
