import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary mint — "Lucky Green"
        lucky: {
          50: "#f0fdf6",
          100: "#dcfce9",
          200: "#bbf7d4",
          300: "#86efb5",
          400: "#4ade90",
          500: "#22c97a",
          600: "#16a563",
          700: "#15834f",
          800: "#166741",
          900: "#145537",
        },
        // Warm peach accent
        peach: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb9b56",
          500: "#f97c3a",
          600: "#ea5f20",
          700: "#c2461a",
          800: "#9a3a1c",
          900: "#7c321b",
        },
        // Soft cream backdrop
        cream: {
          50: "#fffdf7",
          100: "#fefaf0",
          200: "#fcf3dc",
          300: "#fae8c0",
          400: "#f6d99b",
        },
        // Soft sky + lavender for variety
        sky: {
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
        },
        grape: {
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
        },
        // Back-compat alias so legacy `brand-*` classes keep working
        brand: {
          50: "#f0fdf6",
          100: "#dcfce9",
          200: "#bbf7d4",
          300: "#86efb5",
          400: "#4ade90",
          500: "#22c97a",
          600: "#16a563",
          700: "#15834f",
          800: "#166741",
          900: "#145537",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "IBM Plex Sans Thai", "Noto Sans Thai", "Leelawadee UI", "Tahoma", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "Itim", "Noto Sans Thai", "system-ui", "sans-serif"],
      },
      borderRadius: {
        bubble: "1.75rem",
        blob: "2.5rem",
      },
      boxShadow: {
        puff: "0 10px 30px -8px rgba(34, 201, 122, 0.25), 0 4px 10px -4px rgba(15, 23, 42, 0.06)",
        "puff-peach": "0 10px 30px -8px rgba(249, 124, 58, 0.28), 0 4px 10px -4px rgba(15, 23, 42, 0.06)",
        soft: "0 2px 10px rgba(15, 23, 42, 0.05)",
        pop: "0 16px 40px -12px rgba(34, 201, 122, 0.4)",
      },
      keyframes: {
        wiggle: {
          "0%,100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        "bounce-soft": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14%)" },
        },
        breathe: {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
        "tail-swish": {
          "0%,100%": { transform: "rotate(-8deg)" },
          "50%": { transform: "rotate(8deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 0.6s ease-in-out infinite",
        float: "float 3.5s ease-in-out infinite",
        "pop-in": "pop-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
        "bounce-soft": "bounce-soft 1.2s ease-in-out infinite",
        breathe: "breathe 3s ease-in-out infinite",
        "tail-swish": "tail-swish 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
