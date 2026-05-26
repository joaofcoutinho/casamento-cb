import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta exclusivamente preto e branco.
        noir: "#0a0a0a",
        cream: "#f4f4f4",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        // Fonte dos títulos (Montserrat).
        titulo: ["var(--font-titulo)", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slowZoom: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.12)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.8s ease-out forwards",
        slowZoom: "slowZoom 20s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
