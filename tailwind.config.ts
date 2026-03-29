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
        // Exact values extracted from official RwandAir Cargo logo SVG
        wb: {
          blue:        "#00529C",
          sky:         "#16A1DC",
          yellow:      "#FBE115",
          green:       "#94C944",
          "blue-dark": "#003b75",
          "sky-light": "#e4f5fc",
          "yellow-light": "#fffce6",
          "green-light":  "#f0fae0",
          white:       "#ffffff",
          "gray-50":   "#f8f9fa",
          "gray-200":  "#e9ecef",
          "gray-500":  "#6c757d",
          "gray-900":  "#071830",
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
          DEFAULT: "#FBE115",
          50: "#fdfce0",
          100: "#faf8c1",
          200: "#f5f083",
          300: "#efe845",
          400: "#FBE115",
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
