import type { Config } from "tailwindcss";

/** Tokens mirror /design-tokens.json */
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
          DEFAULT: "#2E2924",
          soft: "#7E7468",
          mute: "#A89E91",
          line: "#3A332C",
        },
        surface: {
          DEFAULT: "#FBF7EF",
          frame: "#FBF5EA",
          page: "#F8F1E6",
          soft: "#F1E9D7",
        },
        line: {
          DEFAULT: "#E5D8C7",
          soft: "#E3D8C8",
          panel: "#E1D6C7",
        },
        primary: {
          DEFAULT: "#E8724A",
          soft: "#F4A883",
          notify: "#F06D3F",
        },
        zone: {
          home: "#D8C295",
          "home-edge": "#B8A275",
          "home-shade": "#9C865A",
          child: "#9FC0D8",
          "child-edge": "#82A4BD",
          "child-shade": "#658BA8",
          docs: "#BFB8A9",
          "docs-edge": "#A39C8B",
          "docs-shade": "#857F70",
          outdoor: "#9AAA73",
          "outdoor-edge": "#7C8E58",
          "outdoor-shade": "#607240",
        },
      },
      fontSize: {
        "ui-heading": ["28px", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "ui-body": ["14px", { lineHeight: "1.5" }],
        "ui-small": ["12px", { lineHeight: "1.45" }],
        "ui-label": ["13px", { lineHeight: "1.3" }],
        "ui-micro": ["10px", { lineHeight: "1.3", letterSpacing: "0.18em" }],
      },
      boxShadow: {
        frame:
          "0 24px 80px rgba(64, 45, 24, 0.10), 0 4px 16px rgba(64, 45, 24, 0.06)",
        panel: "0 16px 50px rgba(72, 53, 31, 0.08)",
        plaque: "0 4px 12px rgba(60, 45, 30, 0.10)",
        soft: "0 1px 2px rgba(50, 35, 20, 0.04), 0 8px 24px rgba(50, 35, 20, 0.06)",
        pop: "0 2px 4px rgba(50, 35, 20, 0.05), 0 22px 48px rgba(50, 35, 20, 0.12)",
        glyph:
          "0 1px 2px rgba(50, 35, 20, 0.04), 0 8px 18px rgba(50, 35, 20, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
        primary:
          "0 1px 2px rgba(60, 40, 20, 0.10), 0 6px 16px rgba(232, 114, 74, 0.22)",
      },
      borderRadius: {
        frame: "32px",
        panel: "28px",
        plaque: "12px",
        tile: "28px",
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
          "0%": { boxShadow: "0 0 0 0 rgba(232, 114, 74, 0.4)" },
          "80%": { boxShadow: "0 0 0 10px rgba(232, 114, 74, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(232, 114, 74, 0)" },
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
