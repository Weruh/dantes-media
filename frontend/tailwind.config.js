import { fileURLToPath } from "node:url";

const frontendRoot = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [`${frontendRoot}index.html`, `${frontendRoot}src/**/*.{ts,tsx}`],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#8DCBFF",
          dark: "#5DA8E5",
          soft: "#DDEFFF",
        },
        ink: {
          900: "#0B1F3A",
          700: "#1E334D",
          500: "#4B617A",
        },
      },
      boxShadow: {
        card: "0 18px 40px -28px rgba(11, 31, 58, 0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
