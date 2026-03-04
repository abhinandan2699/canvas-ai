/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#2d3b45',
        'sidebar-hover': '#3d4f5c',
        accent: '#522D80',
      },
    },
  },
  plugins: [],
}
