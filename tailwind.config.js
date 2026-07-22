/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", '"Noto Sans JP"', "sans-serif"],
        display: ["Inter", '"Noto Sans JP"', "sans-serif"],
        body: ["Inter", '"Noto Sans JP"', "sans-serif"],
        handwriting: ['"Caveat"', "cursive"],
        "handwriting-jp": ['"Zen Kurenaido"', "Inter", '"Noto Sans JP"', "sans-serif"],
        "polaroid-caption": ['"Zen Kurenaido"', "Inter", '"Noto Sans JP"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
