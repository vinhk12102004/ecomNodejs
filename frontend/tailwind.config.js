/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem", screens: { lg: "1024px", xl: "1200px" } }
    },
  },
  plugins: [],
};

