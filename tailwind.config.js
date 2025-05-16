// tailwind.config.js
/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          500: '#ff5a1f',
          600: '#e7481c',
        },
        secondary: {
          DEFAULT: '#f3f4f6',
          foreground: '#111827',
        },
      },
      backgroundImage: {
        'linear-to-t': 'linear-gradient(to top, var(--tw-gradient-stops))',
        'linear-90': 'linear-gradient(90deg, var(--tw-gradient-stops))',
      },
      zIndex: {
        '1': '1',
        '2': '2',
        '99': '99',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [daisyui],
}