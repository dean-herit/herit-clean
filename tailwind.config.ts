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
      backgroundImage: {
        'herit-hero-1': "url('https://images.squarespace-cdn.com/content/v1/678803bbab27007bfc5ccabf/1736967326406-C9IHTG251VD5FSJRK0S5/unsplash-image-5utisuD5Bdk.jpg')",
        'herit-hero-2': "url('https://images.squarespace-cdn.com/content/v1/678803bbab27007bfc5ccabf/1736967589199-T1UNH8O5CEXAG1WY1J50/unsplash-image-_XR5rkprHQU.jpg')",
      },
    },
  },
  plugins: [],
};
export default config;
