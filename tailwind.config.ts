import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Public site: a cool grey studio backdrop that pools lighter behind
        // the wordmark. haze -> fog -> shade runs centre to edge.
        haze: "#F5F4F2",
        fog: "#E7E6E3",
        shade: "#D8D7D3",

        // Admin keeps the warmer paper it was built on.
        paper: "#F1F0EA",

        ink: "#121212",
        card: "#FFFFFF",
        red: "#E6391F",
        muted: "#6E6B62",
        line: "#D9D7CE",
      },
      fontFamily: {
        display: ["var(--font-archivo)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      animation: {
        // The ring of text behind the card spread. Slow enough to read as
        // drift rather than spin; the reduced-motion rule in globals.css
        // stops it outright.
        ring: "ring 48s linear infinite",
      },
      keyframes: {
        ring: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
