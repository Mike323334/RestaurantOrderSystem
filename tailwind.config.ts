import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffcf5',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Rich Amber/Gold
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f', 
          gold: '#d4af37',
        },
        accent: {
          50: '#fdf2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Deep Red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d', 
        },
        surface: {
          50: '#fafafa',
          900: '#121212', // Deep Black
        }
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'lg': '0.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'elegant': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'gold': '0 10px 15px -3px rgba(197, 163, 88, 0.1), 0 4px 6px -2px rgba(197, 163, 88, 0.05)',
      }
    },
  },
  plugins: [],
};

export default config;
