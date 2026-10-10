/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#E05A47',
          hover: '#C94635',
          light: '#FDF2F0',
        },
        navy: {
          dark: '#0A1428',
          card: '#132238',
          border: '#1E3352',
        },
        cream: '#FAF7F2',
      },
    },
  },
  plugins: [],
};
