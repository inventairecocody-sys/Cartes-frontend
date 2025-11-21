/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orangeMain: "#F77F00",
        greenMain: "#2E8B57",
        blueMain: "#0077B6",
      },
    },
  },
  plugins: [],
}