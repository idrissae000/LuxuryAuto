import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2f7de1",
          charcoal: "#0f1115",
          slate: "#1b1f27"
        }
      },
      boxShadow: {
        glow: "0 0 24px rgba(47,125,225,0.35)"
      }
    }
  },
  plugins: []
} satisfies Config;
