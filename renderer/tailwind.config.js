const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        scaling: {
          "0%": { opacity: 0 },
          "20%": { transform: "scale(0.9, 0.9)" },
          "100%": { transform: "scale(1, 1)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
