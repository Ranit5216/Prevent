/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors : {
          "primary-200" : "#ffbf00",
          "primary-100" : "#ffc929",
          "secondary-200" : "#00b050",
          "secondary-100" : "#0b1a78"
        },
        animation: {
          'slideDown': 'slideDown 0.3s ease-out',
        },
        keyframes: {
          slideDown: {
            '0%': { transform: 'translateY(-10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
        },
      },
    },
    plugins: [],
  }
  