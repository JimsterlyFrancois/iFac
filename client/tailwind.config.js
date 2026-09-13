/** @type {import('tailwindcss').Config} */  
export default {  
  content: ['./index.html', './src/**/*.{js,jsx}'],  
  theme: {  
    extend: {
      colors: {
        'ifac-primary': '#155e75',
        'ifac-primary-dark': '#164e63',
        'ifac-secondary': '#0f766e',
        'ifac-accent': '#f59e0b',
        'ifac-mist': '#ecfeff',
        'ifac-ink': '#123047',
        'ifac-border': '#cbd5e1',
      },
    },
  },  
  plugins: [],  
};