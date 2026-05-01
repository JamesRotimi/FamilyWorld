import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#2a2724",
          soft: "#6c665d",
          mute: "#9a9388",
          line: "#3a342c",  // charcoal stroke for illustrated linework
        },
        surface: {
          DEFAULT: "#fbf7ef",
          soft: "#f1ebde",
        },
        line: {
          DEFAULT: "#ece4d2",
          soft: "#f3ecdb",
        },
        primary: {
          DEFAULT: "#e07a4f",
          soft: "#f3a884",
        },
        zone: {
          home: "#ece2cb",
          "home-edge": "#d3c8af",
          child: "#d8e3ec",
          "child-edge": "#b6c5d2",
          docs: "#e1ddd2",
          "docs-edge": "#c0baa9",
          outdoor: "#d9e1cf",
          "outdoor-edge": "#b6c0a4",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(50, 35, 20, 0.04), 0 8px 24px rgba(50, 35, 20, 0.06)",
        pop: "0 2px 4px rgba(50, 35, 20, 0.05), 0 22px 48px rgba(50, 35, 20, 0.12)",
        platform:
          "0 2px 4px rgba(50, 35, 20, 0.04), 0 24px 48px rgba(50, 35, 20, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
        glyph:
          "0 1px 2px rgba(50, 35, 20, 0.04), 0 8px 18px rgba(50, 35, 20, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
        primary:
          "0 1px 2px rgba(60, 40, 20, 0.08), 0 6px 16px rgba(216, 90, 30, 0.18)",
      },
      keyframes: {
        spawn: {
          "0%": { transform: "translateY(-40px) scale(0.85)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        pop: {
          "0%": { transform: "translateY(8px) scale(0.97)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        ping: {
          "0%": { boxShadow: "0 0 0 0 rgba(224, 122, 79, 0.4)" },
          "80%": { boxShadow: "0 0 0 10px rgba(224, 122, 79, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(224, 122, 79, 0)" },
        },
      },
      animation: {
        spawn: "spawn 0.5s cubic-bezier(.2,.7,.2,1.05)",
        pop: "pop 0.22s cubic-bezier(.2,.7,.2,1.05)",
        ping: "ping 2.2s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
