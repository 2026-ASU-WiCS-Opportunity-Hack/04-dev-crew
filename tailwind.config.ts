import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // WIAL brand colours — Person 2 owns globals.css for CSS variables
      colors: {
        brand: {
          blue: '#1a56db',
          'blue-dark': '#1e40af',
        },
      },
      fontFamily: {
        // Zero custom web fonts — system stack only
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('tailwindcss-animate')],
};

export default config;
