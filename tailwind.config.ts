import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        brand: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      colors: {
        // Theme system colors using CSS variables
        'theme-bg': 'var(--bg)',
        'theme-surface': 'var(--surface)',
        'theme-card': 'var(--card)',
        'theme-brand': 'var(--brand)',
        'theme-accent': 'var(--accent)',
        'theme-text': 'var(--text)',
        'theme-text-muted': 'var(--text-muted)',
        'theme-success': 'var(--success)',
        'theme-danger': 'var(--danger)',
        'theme-input-bg': 'var(--input-bg)',
        'theme-input-border': 'var(--input-border)',
        
        // Legacy colors for backward compatibility
        background: "var(--background)",
        foreground: "var(--foreground)",
        herit: {
          50: '#f8f9fa',
          100: '#f1f3f4',
          200: '#e8eaed',
          300: '#dadce0',
          400: '#bdc1c6',
          500: '#9aa0a6',
          600: '#80868b',
          700: '#5f6368',
          800: '#3c4043',
          900: '#202124',
          950: '#171717',
        },
        brand: {
          50: '#fefdf8',
          100: '#fefcf0',
          200: '#fdf6d8',
          300: '#fbeeb0',
          400: '#f7dd7f',
          500: '#f2c94c',
          600: '#e6b532',
          700: '#c19726',
          800: '#9c7724',
          900: '#806122',
          950: '#4a3611',
        }
      },
      borderRadius: {
        'theme-lg': 'var(--r-lg)',
        'theme-xl': 'var(--r-xl)',
        'theme-2xl': 'var(--r-2xl)',
      },
      boxShadow: {
        'theme-card': 'var(--shadow-card)',
      },
      backgroundImage: {
        'herit-hero-1': "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')",
        'herit-hero-2': "url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')",
      },
    },
  },
  plugins: [],
  safelist: [
    // Safelist theme-based utilities that might be dynamically generated
    'bg-theme-bg',
    'bg-theme-surface',
    'bg-theme-card',
    'bg-theme-brand',
    'bg-theme-accent',
    'text-theme-text',
    'text-theme-text-muted',
    'text-theme-brand',
    'border-theme-input-border',
    'rounded-theme-2xl',
    'shadow-theme-card',
  ],
};
export default config;
