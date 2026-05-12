import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        panel: "var(--panel)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        accent2: "var(--accent-2)",
        border: "var(--border)"
      },
      boxShadow: {
        glow: "0 0 0 1px var(--border), 0 12px 40px rgba(0, 0, 0, 0.12)"
      }
    }
  },
  plugins: [typography]
};

export default config;
