/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        electric: "#342FD4",
        "electric-deep": "#211C9A",
        pink: "#FF2B91",
        sunflower: "#FFC400",
        ivory: "#FFF8E8",
        ink: "#17131F",
        lavender: "#B9A8FF",
        night: "#0A0A2E",
      },
      fontFamily: {
        display: ['"DM Serif Display"', "Georgia", "serif"],
        condensed: ['"Bebas Neue"', "Oswald", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        hand: ['"Caveat"', "cursive"],
      },
      boxShadow: {
        paper: "0 18px 40px -18px rgba(23,19,31,0.55)",
        "paper-sm": "0 8px 20px -10px rgba(23,19,31,0.45)",
        glow: "0 0 60px -8px rgba(255,196,0,0.6)",
      },
      keyframes: {
        flicker: {
          "0%,100%": { transform: "scale(1) rotate(-1deg)", opacity: "1" },
          "50%": { transform: "scale(1.08) rotate(2deg)", opacity: "0.85" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        flicker: "flicker 0.9s ease-in-out infinite",
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
