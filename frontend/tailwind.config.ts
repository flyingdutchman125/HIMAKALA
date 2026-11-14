import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "system-ui", "-apple-system", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        canvas: "#F5F8FC",
        surface: "#FFFFFF",
        ink: "#0B1938",
        muted: "#3B4E73",
        shell: "#0B1938",
        shellText: "#FFFFFF",
        shellMuted: "#B8CBE8",
        brand: {
          navy: "#0B1938",
          navySurface: "#152852",
          navyBorder: "#233A6E",
          cyan: "#026E9C",
          cyanHover: "#01587E",
          cyanBright: "#20B0E0",
          gold: "#FAD956",
          goldHover: "#F2C922",
        },
        coral: {
          DEFAULT: "#026E9C",
          hover: "#01587E",
          soft: "#FEE2E2",
        },
        pastel: {
          amber: "#FAD956",
          lavender: "#D8E4FC",
          sky: "#C8ECFA",
          mint: "#CCF2EA",
        },
      },
      borderRadius: {
        shell: "28px",
        card: "20px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
} satisfies Config;

