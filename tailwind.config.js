/** @type {import('tailwindcss').Config} */
const { buildTheme, themeVarsPlugin } = require("./theme.palette");

// Màu khai báo bằng biến CSS (sáng/tối) — xem theme.palette.js
const { colors, backgroundColor } = buildTheme();

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors,
      backgroundColor,
      gradientColorStops: {
        "primary": backgroundColor["primary"],
        "primary-container": backgroundColor["primary-container"],
      },
      fontFamily: {
        "headline": ["Plus Jakarta Sans"],
        "body": ["Inter"],
        "label": ["Inter"]
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
    },
  },
  plugins: [themeVarsPlugin],
}
