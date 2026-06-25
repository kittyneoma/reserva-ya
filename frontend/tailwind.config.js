/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Lato', 'sans-serif'],
      },
      colors: {
        terracota: { 50:'#fdf4f0', 100:'#fbe5da', 200:'#f6c8b0', 300:'#f0a07d', 400:'#e8704a', 500:'#d9522a', 600:'#c03d1e', 700:'#9e301a', 800:'#7e2918', 900:'#672318' },
        crema:     { 50:'#fdfaf5', 100:'#f9f2e6', 200:'#f2e4cc', 300:'#e8d0a8', 400:'#dab87e', 500:'#cca05a' },
        carbon:    { 800:'#2c1810', 900:'#1a0f0a' },
      }
    },
  },
  plugins: [],
}