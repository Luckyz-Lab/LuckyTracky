import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--ui-canvas) / <alpha-value>)",
        surface: "rgb(var(--ui-surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--ui-surface-muted) / <alpha-value>)",
        "surface-elevated": "rgb(var(--ui-surface-elevated) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--ui-text) / <alpha-value>)",
          strong: "rgb(var(--ui-text-strong) / <alpha-value>)",
          muted: "rgb(var(--ui-text-muted) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--ui-border) / <alpha-value>)",
          strong: "rgb(var(--ui-border-strong) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--ui-primary) / <alpha-value>)",
          hover: "rgb(var(--ui-primary-hover) / <alpha-value>)",
          soft: "rgb(var(--ui-primary-soft) / <alpha-value>)",
          contrast: "rgb(var(--ui-on-primary) / <alpha-value>)",
        },
        positive: { DEFAULT: "rgb(var(--ui-success) / <alpha-value>)", soft: "rgb(var(--ui-success-soft) / <alpha-value>)" },
        negative: { DEFAULT: "rgb(var(--ui-danger) / <alpha-value>)", soft: "rgb(var(--ui-danger-soft) / <alpha-value>)" },
        caution: { DEFAULT: "rgb(var(--ui-warning) / <alpha-value>)", soft: "rgb(var(--ui-warning-soft) / <alpha-value>)" },
        informative: { DEFAULT: "rgb(var(--ui-info) / <alpha-value>)", soft: "rgb(var(--ui-info-soft) / <alpha-value>)" },
        // High-fidelity mockup primary: vivid orange.
        lucky: {
          50: "rgb(var(--ui-primary-soft) / <alpha-value>)",
          100: "rgb(var(--ui-primary-soft) / <alpha-value>)",
          200: "rgb(var(--ui-primary) / 0.24)",
          300: "rgb(var(--ui-primary) / 0.45)",
          400: "rgb(var(--ui-primary) / 0.72)",
          500: "rgb(var(--ui-primary) / <alpha-value>)",
          600: "rgb(var(--ui-primary-hover) / <alpha-value>)",
          700: "rgb(var(--ui-primary) / <alpha-value>)",
          800: "rgb(var(--ui-primary-hover) / <alpha-value>)",
          900: "rgb(var(--ui-primary-hover) / <alpha-value>)",
        },
        // Terracotta accent (alias of brand tones for emphasis)
        peach: {
          50: "rgb(var(--ui-danger-soft) / <alpha-value>)",
          100: "rgb(var(--ui-danger-soft) / <alpha-value>)",
          200: "rgb(var(--ui-danger) / 0.24)",
          300: "rgb(var(--ui-danger) / 0.4)",
          400: "rgb(var(--ui-danger) / 0.7)",
          500: "rgb(var(--ui-danger) / <alpha-value>)",
          600: "rgb(var(--ui-danger) / <alpha-value>)",
          700: "rgb(var(--ui-danger) / <alpha-value>)",
          800: "rgb(var(--ui-danger) / <alpha-value>)",
          900: "rgb(var(--ui-danger) / <alpha-value>)",
        },
        // Warm blush cream background tones
        cream: {
          50: "rgb(var(--ui-surface) / <alpha-value>)",
          100: "rgb(var(--ui-canvas) / <alpha-value>)",
          200: "rgb(var(--ui-border) / <alpha-value>)",
          300: "rgb(var(--ui-border-strong) / <alpha-value>)",
          400: "rgb(var(--ui-text-muted) / 0.55)",
          500: "rgb(var(--ui-text-muted) / <alpha-value>)",
        },
        slate: {
          50: "rgb(var(--ui-surface-muted) / <alpha-value>)",
          100: "rgb(var(--ui-surface-muted) / <alpha-value>)",
          200: "rgb(var(--ui-border) / <alpha-value>)",
          300: "rgb(var(--ui-border-strong) / <alpha-value>)",
          400: "rgb(var(--ui-text-muted) / <alpha-value>)",
          500: "rgb(var(--ui-text-muted) / <alpha-value>)",
          600: "rgb(var(--ui-text) / <alpha-value>)",
          700: "rgb(var(--ui-text) / <alpha-value>)",
          800: "rgb(var(--ui-text-strong) / <alpha-value>)",
          900: "rgb(var(--ui-text-strong) / <alpha-value>)",
          950: "rgb(var(--ui-canvas) / <alpha-value>)",
        },
        orange: {
          50: "rgb(var(--ui-primary-soft) / <alpha-value>)",
          100: "rgb(var(--ui-primary-soft) / <alpha-value>)",
          200: "rgb(var(--ui-primary) / 0.24)",
          300: "rgb(var(--ui-primary) / 0.45)",
          400: "rgb(var(--ui-primary) / 0.72)",
          500: "rgb(var(--ui-primary) / <alpha-value>)",
          600: "rgb(var(--ui-primary-hover) / <alpha-value>)",
          700: "rgb(var(--ui-primary) / <alpha-value>)",
          800: "rgb(var(--ui-primary-hover) / <alpha-value>)",
          900: "rgb(var(--ui-primary-hover) / <alpha-value>)",
          950: "rgb(var(--ui-primary-hover) / <alpha-value>)",
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
          50: "rgb(var(--ui-info-soft) / <alpha-value>)",
          100: "rgb(var(--ui-info-soft) / <alpha-value>)",
          200: "rgb(var(--ui-info) / 0.24)",
          300: "rgb(var(--ui-info) / 0.42)",
          400: "rgb(var(--ui-info) / 0.72)",
          500: "rgb(var(--ui-info) / <alpha-value>)",
        },
        // Warm amber for coins/highlights
        grape: {
          50: "rgb(var(--ui-warning-soft) / <alpha-value>)",
          100: "rgb(var(--ui-warning-soft) / <alpha-value>)",
          200: "rgb(var(--ui-warning) / 0.24)",
          300: "rgb(var(--ui-warning) / 0.42)",
          400: "rgb(var(--ui-warning) / 0.72)",
          500: "rgb(var(--ui-warning) / <alpha-value>)",
        },
        // Back-compat alias
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "var(--font-thai)", "Inter", "Noto Sans Thai", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Outfit", "var(--font-thai)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "var(--ui-card-radius)",
        control: "var(--ui-control-radius)",
        bubble: "1.75rem",
        blob: "2.5rem",
      },
      boxShadow: {
        card: "var(--ui-card-shadow)",
        soft: "0 5px 18px -10px rgba(15, 23, 42, 0.18)",
        puff: "0 10px 24px -12px rgba(249, 115, 22, 0.35)",
        "puff-peach": "0 10px 24px -12px rgba(244, 63, 94, 0.30)",
        "puff-pink": "0 14px 34px -12px rgba(201, 156, 160, 0.34), 0 6px 14px -8px rgba(117, 99, 89, 0.10)",
        "puff-sky": "0 14px 34px -12px rgba(143, 163, 176, 0.30), 0 6px 14px -8px rgba(117, 99, 89, 0.10)",
        pop: "0 18px 40px -16px rgba(15, 23, 42, 0.32)",
        glow: "0 0 0 4px rgba(253, 186, 116, 0.35)",
        clay: "0 6px 18px -10px rgba(15, 23, 42, 0.16)",
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
      zIndex: {
        nav: "40",
        dropdown: "60",
        modal: "100",
        toast: "120",
        help: "200",
      },
    },
  },
  plugins: [],
};

export default config;
