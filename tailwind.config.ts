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
        navy: {
          DEFAULT: '#02284d',
          50: '#e6edf5',
          100: '#ccdaeb',
          200: '#99b5d7',
          300: '#6691c3',
          400: '#336caf',
          500: '#02284d',
          600: '#022342',
          700: '#011d38',
          800: '#01182d',
          900: '#011223',
        },
        yellow: {
          DEFAULT: '#E4DC1F',
          50: '#fdfce0',
          100: '#faf8c1',
          200: '#f5f083',
          300: '#efe845',
          400: '#E4DC1F',
          500: '#d4cc10',
          600: '#b0aa0d',
          700: '#8c880a',
          800: '#686607',
          900: '#444403',
        },
      },
    },
  },
  plugins: [],
};
export default config;
