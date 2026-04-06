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
        sans: ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#6366F1",
          light: "#EEF2FF",
          dark: "#4F46E5",
          muted: "#C7D2FE",
        },
        surface: {
          DEFAULT: "#F8FAFC",
          2: "#F1F5F9",
        },
        "c-border": "#E2E8F0",
        success: {
          DEFAULT: "#10B981",
          light: "#ECFDF5",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FFFBEB",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#FEF2F2",
        },
      },
      borderRadius: {
        btn: "14px",
        card: "20px",
        chip: "99px",
        xl2: "24px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
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
        "slide-up": "slide-up 0.25s ease-out",
        "slide-up-sheet": "slide-up-sheet 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        "count-up": "count-up 0.5s ease-out forwards",
        shimmer: "shimmer 1.5s infinite linear",
        "pulse-overspend": "pulse-overspend 2s ease-in-out infinite",
        "scale-pulse": "scale-pulse 0.3s ease-out",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        card: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px rgba(99,102,241,0.12), 0 1px 4px rgba(0,0,0,0.08)",
        fab: "0 4px 16px rgba(99,102,241,0.35)",
        modal: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        "inner-sm": "inset 0 1px 2px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
