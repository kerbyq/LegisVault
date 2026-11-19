/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F4C75',
          50: '#F0F6FA',
          100: '#D9E8F2',
          200: '#B0CEE2',
          300: '#7CB0CE',
          400: '#3282B8',
          500: '#0F4C75',
          600: '#0C3D5E',
          700: '#0A314B',
          800: '#072437',
          900: '#041622',
        },
        secondary: {
          DEFAULT: '#1B262C',
          50: '#F4F5F6',
          100: '#E4E6E8',
          200: '#C4C8CD',
          300: '#9BA3AA',
          400: '#69747E',
          500: '#1B262C',
          600: '#172025',
          700: '#12191D',
          800: '#0D1215',
          900: '#070A0B',
        },
        accent: {
          DEFAULT: '#3282B8',
          light: '#BBE1FA',
          dark: '#0F4C75',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          muted: '#F1F5F9',
          card: '#FFFFFF',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#92400E',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#991B1B',
        },
        // Dedicated accessible focus teal tokens
        focusRing: '#14B8A6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      minHeight: {
        touch: '44px',
        touchMin: '24px',
      },
      minWidth: {
        touch: '44px',
        touchMin: '24px',
      },
      boxShadow: {
        'focus-ring': '0 0 0 3px #14B8A6, 0 0 0 5px #FFFFFF',
        'focus-ring-hc': '0 0 0 3px #FACC15, 0 0 0 5px #000000',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
