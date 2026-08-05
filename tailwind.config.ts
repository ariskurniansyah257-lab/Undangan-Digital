import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf3f4",
          100: "#fbe7e9",
          200: "#f6c7cd",
          300: "#efa0ab",
          400: "#e46f80",
          500: "#d64b60",
          600: "#c02f4b",
          700: "#a1233d",
          800: "#872038",
          900: "#741f34",
        },
        gold: {
          400: "#d4af6a",
          500: "#c19a4f",
          600: "#a67f3a",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
