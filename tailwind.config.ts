import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary — "Cozy Clay" terracotta / dusty-rose (Color Set 018)
        lucky: {
          50: "#fbf4f1",
          100: "#f7e6e1",
          200: "#f0d0cc",
          300: "#e6a9a3",
          400: "#d98e86",
          500: "#c57168",
          600: "#9c7f7b",
          700: "#756359",
          800: "#5a4d45",
          900: "#3d342e",
        },
        // Terracotta accent (alias of brand tones for emphasis)
        peach: {
          50: "#fdf1ec",
          100: "#fadfd5",
          200: "#f3c3b4",
          300: "#e6a99f",
          400: "#d98e86",
          500: "#c57168",
          600: "#a85647",
          700: "#8a4436",
          800: "#6e372d",
          900: "#5a2e26",
        },
        // Warm blush cream background tones
        cream: {
          50: "#fdf8f6",
          100: "#fbf4f1",
          200: "#f7e6e1",
          300: "#f0d0cc",
          400: "#e6c5bf",
          500: "#d9ada5",
        },
        // Warm neutral taupe/gray ramp
        sand: {
          50: "#faf7f5",
          100: "#f2edea",
          200: "#e7e6e6",
          300: "#d8d4d0",
          400: "#aba8a2",
          500: "#8a8681",
          600: "#6b6862",
        },
        // Rose-taupe accent
        bubble: {
          50: "#f7edee",
          100: "#eed9dc",
          200: "#e3cace",
          300: "#c99ca0",
          400: "#b67e84",
          500: "#9c6168",
        },
        // Dusty slate for info accents
        sky: {
          100: "#edf1f3",
          200: "#cad6dc",
          300: "#a9bcc6",
          400: "#8fa3b0",
          500: "#6e8593",
        },
        // Warm amber for coins/highlights
        grape: {
          100: "#fbf1e2",
          200: "#f0dbb8",
          300: "#e6c389",
          400: "#d9a45b",
          500: "#bd8638",
        },
        // Back-compat alias
        brand: {
          50: "#fbf4f1",
          100: "#f7e6e1",
          200: "#f0d0cc",
          300: "#e6a9a3",
          400: "#d98e86",
          500: "#c57168",
          600: "#9c7f7b",
          700: "#756359",
          800: "#5a4d45",
          900: "#3d342e",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "Sarabun", "Noto Sans Thai", "Leelawadee UI", "Tahoma", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Fredoka", "var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        bubble: "1.75rem",
        blob: "2.5rem",
      },
      boxShadow: {
        soft: "0 4px 18px -6px rgba(117, 99, 89, 0.14)",
        puff: "0 14px 34px -12px rgba(197, 113, 104, 0.30), 0 6px 14px -8px rgba(117, 99, 89, 0.10)",
        "puff-peach": "0 14px 34px -12px rgba(217, 142, 134, 0.34), 0 6px 14px -8px rgba(117, 99, 89, 0.10)",
        "puff-pink": "0 14px 34px -12px rgba(201, 156, 160, 0.34), 0 6px 14px -8px rgba(117, 99, 89, 0.10)",
        "puff-sky": "0 14px 34px -12px rgba(143, 163, 176, 0.30), 0 6px 14px -8px rgba(117, 99, 89, 0.10)",
        pop: "0 20px 46px -14px rgba(197, 113, 104, 0.45)",
        glow: "0 0 0 4px rgba(240, 208, 204, 0.60)",
        clay: "0 10px 24px -10px rgba(117, 99, 89, 0.28), inset 0 2px 4px rgba(255, 255, 255, 0.55), inset 0 -3px 6px rgba(117, 99, 89, 0.10)",
        "clay-pressed": "inset 0 3px 8px rgba(117, 99, 89, 0.25), inset 0 -1px 2px rgba(255, 255, 255, 0.40)",
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
