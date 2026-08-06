/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8f0",
          100: "#faefd9",
          200: "#f5ddb0",
          300: "#edc47f",
          400: "#e4a54d",
          500: "#d4892a",
          600: "#b8691f",
          700: "#97501b",
          800: "#7a3f1d",
          900: "#65341c",
          950: "#3b1a0b",
        },
        ink: {
          50: "#f9f7f4",
          100: "#f0ece5",
          200: "#e1d8cc",
          300: "#ccbfad",
          400: "#b4a08a",
          500: "#9e886e",
          600: "#8a7260",
          700: "#735f52",
          800: "#5f4e46",
          900: "#4f4039",
          950: "#1c1611",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 16px 0 rgba(28,22,17,0.08)",
        medium: "0 4px 32px 0 rgba(28,22,17,0.12)",
        strong: "0 8px 48px 0 rgba(28,22,17,0.18)",
        card: "0 1px 4px 0 rgba(28,22,17,0.06), 0 4px 16px 0 rgba(28,22,17,0.06)",
        "card-hover": "0 8px 32px 0 rgba(28,22,17,0.14)",
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
