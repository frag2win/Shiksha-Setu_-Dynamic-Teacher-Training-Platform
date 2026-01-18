/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Book-inspired color palette - using CSS variables for dark mode support
      colors: {
        // Paper tones - dark slate backgrounds
        paper: {
          50: 'var(--paper-50)',
          100: 'var(--paper-100)',
          200: 'var(--paper-200)',
          300: 'var(--paper-300)',
          400: 'var(--paper-400)',
          500: 'var(--paper-500)',
        },
        // Ink tones for text - light for dark mode
        ink: {
          50: 'var(--ink-50)',
          100: 'var(--ink-100)',
          200: 'var(--ink-200)',
          300: 'var(--ink-300)',
          400: 'var(--ink-400)',
          500: 'var(--ink-500)',
          600: 'var(--ink-600)',
          700: 'var(--ink-700)',
          800: 'var(--ink-800)',
          900: 'var(--ink-900)',
        },
        // Government blue - trustworthy
        setu: {
          50: 'var(--setu-50)',
          100: 'var(--setu-100)',
          200: 'var(--setu-200)',
          300: 'var(--setu-300)',
          400: 'var(--setu-400)',
          500: 'var(--setu-500)',
          600: 'var(--setu-600)',
          700: 'var(--setu-700)',
          800: 'var(--setu-800)',
          900: 'var(--setu-900)',
        },
        // Warm accent for actions
        warm: {
          50: 'var(--warm-50)',
          100: 'var(--warm-100)',
          200: 'var(--warm-200)',
          300: 'var(--warm-300)',
          400: 'var(--warm-400)',
          500: 'var(--warm-500)',
          600: 'var(--warm-600)',
          700: 'var(--warm-700)',
        },
        // Success green
        success: {
          50: 'var(--success-50)',
          100: 'var(--success-100)',
          200: 'var(--success-200)',
          300: 'var(--success-300)',
          400: 'var(--success-400)',
          500: 'var(--success-500)',
          600: 'var(--success-600)',
        },
        // Danger red
        danger: {
          50: 'var(--danger-50)',
          100: 'var(--danger-100)',
          200: 'var(--danger-200)',
          300: 'var(--danger-300)',
          400: 'var(--danger-400)',
          500: 'var(--danger-500)',
          600: 'var(--danger-600)',
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
      // Subtle shadows for paper depth - optimized for dark mode
      boxShadow: {
        'paper': '0 1px 3px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15)',
        'paper-hover': '0 2px 8px rgba(0, 0, 0, 0.25), 0 8px 24px rgba(0, 0, 0, 0.2)',
        'page': '0 0 0 1px rgba(148, 163, 184, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2), 4px 8px 24px rgba(0, 0, 0, 0.25)',
        'book': 'inset 0 0 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(148, 163, 184, 0.1)',
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
