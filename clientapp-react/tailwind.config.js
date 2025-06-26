/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tangoWhite: '#f9fafb',
        tangoGreen: {
          DEFAULT: '#3fa36c', // verde principal
          dark: '#2e7d4f',   // verde oscuro
          light: '#a7e9c2',  // verde claro
        },
        tangoGold: {
          DEFAULT: '#d4af37', // dorado principal
          dark: '#bfa133',   // dorado oscuro
          light: '#ffe066',  // dorado claro
        },
        tangoBlue: {
          DEFAULT: '#2a4d8f', // azul principal no estándar
          dark: '#1d3557',   // azul oscuro
          light: '#a3b8e6',  // azul claro
        },
      },
    },
  },
  plugins: [],
}

