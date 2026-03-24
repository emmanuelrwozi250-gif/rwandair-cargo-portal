import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // RwandAir brand palette
        wb: {
          blue:        "#00509E",
          sky:         "#1ea2dc",
          yellow:      "#F2DE0E",
          green:       "#94c943",
          "blue-dark": "#003d74",
          "sky-light": "#e8f6fc",
          "yellow-light": "#fff9d6",
          "green-light":  "#f0f8e2",
          white:       "#ffffff",
          "gray-50":   "#f8f9fa",
          "gray-200":  "#e9ecef",
          "gray-500":  "#6c757d",
          "gray-900":  "#1a1a2e",
        },
        // Legacy Altitude colors (kept for backwards compat)
        navy: {
          DEFAULT: "#02284d",
          50: "#e6edf5",
          100: "#ccdaeb",
          200: "#99b5d7",
          300: "#6691c3",
          400: "#336caf",
          500: "#02284d",
          600: "#022342",
          700: "#011d38",
          800: "#01182d",
          900: "#011223",
        },
        yellow: {
          DEFAULT: "#E4DC1F",
          50: "#fdfce0",
          100: "#faf8c1",
          200: "#f5f083",
          300: "#efe845",
          400: "#E4DC1F",
          500: "#d4cc10",
          600: "#b0aa0d",
          700: "#8c880a",
          800: "#686607",
          900: "#444403",
        },
      },
      fontFamily: {
        lato: ["Lato", "sans-serif"],
      },
      animation: {
        "dash-flow":   "dashFlow 2.5s ease forwards",
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ticker":      "ticker 20s linear infinite",
        "float":       "float 6s ease-in-out infinite",
      },
      keyframes: {
        dashFlow: {
          "0%":   { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
