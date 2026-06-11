import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdf5",
          100: "#d6f9e6",
          200: "#aff1d0",
          300: "#79e4b4",
          400: "#3fcf93",
          500: "#18b478",
          600: "#0c9162",
          700: "#0b7451",
          800: "#0c5c42",
          900: "#0b4b38",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Noto Sans Thai", "Leelawadee UI", "Tahoma", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
