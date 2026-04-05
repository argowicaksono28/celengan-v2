import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#68B684",
          light: "#F0F7F2",
          dark: "#4E9E6A",
        },
        surface: "#F5F5F5",
        "c-border": "#E0E0E0",
        success: {
          DEFAULT: "#3D8A57",
          light: "#EAF4EE",
        },
        warning: {
          DEFAULT: "#C97C2A",
          light: "#FDF3E3",
        },
        danger: {
          DEFAULT: "#C94040",
          light: "#FAEBEB",
        },
      },
      borderRadius: {
        btn: "12px",
        card: "16px",
        chip: "99px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up-sheet": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-overspend": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "scale-pulse": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.12)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "slide-up": "slide-up 0.2s ease-out",
        "slide-up-sheet": "slide-up-sheet 0.2s ease-out",
        "count-up": "count-up 0.5s ease-out forwards",
        shimmer: "shimmer 1.5s infinite linear",
        "pulse-overspend": "pulse-overspend 2s ease-in-out infinite",
        "scale-pulse": "scale-pulse 0.3s ease-out",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06)",
        fab: "0 4px 12px rgba(104,182,132,0.30)",
        modal: "0 8px 32px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
