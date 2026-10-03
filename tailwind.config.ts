import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        cream: "#F8F6F1",
        ink: {
          DEFAULT: "#23261F",
          soft: "#6E7568",
        },
        green: {
          50: "#EEF3EA",
          100: "#DCE8D4",
          400: "#5C8A5A",
          500: "#3F6F45",
          600: "#2F5B37",
          700: "#22452A",
          800: "#1B361F",
          900: "#142917",
        },
        line: "#E7E3D8",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      maxWidth: {
        content: "1280px",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(35, 38, 31, 0.10)",
        card: "0 2px 16px -4px rgba(35, 38, 31, 0.08)",
        lift: "0 20px 40px -16px rgba(35, 38, 31, 0.20)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
