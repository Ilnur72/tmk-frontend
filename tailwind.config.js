/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#33b5d6",
        secondary: "#6c757d",
      },
      ringColor: {
        DEFAULT: "#33b5d6",
      },
      borderColor: {
        DEFAULT: "#d1d5db",
      },
    },
  },
  plugins: [],
};
