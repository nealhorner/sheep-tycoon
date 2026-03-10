import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ochre: {
          50: '#fef8e7',
          100: '#fdeec3',
          200: '#fbdb8c',
          300: '#f8c350',
          400: '#f5a824',
          500: '#e08c0d',
          600: '#ba6b08',
          700: '#944d0b',
          800: '#7a3e10',
          900: '#663412',
        },
        outback: {
          50: '#f6f5f0',
          100: '#e8e6dc',
          200: '#d4cfbd',
          300: '#bcb399',
          400: '#a69b7d',
          500: '#9a8e6d',
          600: '#8a7b5e',
          700: '#72644e',
          800: '#5f5343',
          900: '#514639',
        },
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
        display: ['var(--font-quicksand)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
