const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        dropdown: {
          "0%": { height: "56px" },
          "100%": { height: "200px" },
        },
        dropup: {
          "0%": { height: "200px" },
          "100%": { height: "56px" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
