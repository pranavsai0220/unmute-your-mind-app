/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This tells Tailwind to scan all JS/JSX/TS/TSX files in src/ for Tailwind classes
    "./public/index.html",       // Also scan your main HTML file
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Define 'Inter' font
      },
      // You can extend other Tailwind properties here if needed
    },
  },
  plugins: [],
}
