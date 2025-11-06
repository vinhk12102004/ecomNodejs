/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem", screens: { lg: "1024px", xl: "1200px" } },
      colors: {
        // MongoDB Atlas inspired color palette
        'atlas': {
          'dark': '#0A191E',      // Dark Teal/Black Background
          'lime': '#90EE90',      // Bright Lime Green
          'gray-light': '#D3D3D3', // Light Gray
          'green': '#00FF00',     // Bright Green
          'blue': '#00BFFF',      // Bright Blue (Deep Sky Blue)
          'gray-dark': '#212121', // Dark Gray/Black
          'gray-medium': '#696969', // Medium Gray
          'purple': '#DDA0DD',    // Light Purple/Pink (Plum)
        }
      }
    },
  },
  plugins: [],
};

