import { heroui } from '@heroui/theme';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,mdx}', './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dashboard-bg': '#141517',
      },
    },
  },
  darkMode: 'class',
  plugins: [heroui()],
};
