/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#1e3a8a',
          dark: '#0f172a',
          teal: '#0d9488',
          slate: '#334155',
          light: '#f8fafc',
          accent: '#2563eb',
          gold: '#b45309'
        }
      }
    },
  },
  plugins: [],
}
