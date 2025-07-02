/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: 'rgb(44, 79, 155)', // Main blue
          hover: 'rgb(31, 63, 131)', // Darker blue for hovers
        },
        'primary-light': 'rgb(44, 79, 155)', // Light blue (same as primary for now)
        'primary-dark': 'rgb(31, 63, 131)', // Dark blue
      }
    },
  },
  plugins: [],
};