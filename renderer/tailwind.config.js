/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-heading': 'rgb(243 244 246);',
        'dark-main':'rgb(156 163 175)',
        'dark-container': 'rgb(30 41 59)',
        'dark-back': 'rgb(15 23 42)',
        'dark-border': 'rgb(55 65 81)',
        'focus-border': '#3b82f666',
        'dark-form-back': 'rgb(51 65 85)',
        'dark-form-border': 'rgb(71 85 105)',
        'dark-button-back': 'rgb(79 70 229)',
        'dark-button-hover':'rgb(67 56 202)',
      },
      keyframes: {
        scaling: {
          "0%": { opacity: 0 },
          "20%": { transform: "scale(0.9, 0.9)" },
          "100%": { transform: "scale(1, 1)" },
        },
      },
    },
  },
  plugins: [],
};
