/** @type {import('tailwindcss').Config} */

/**
 * Sundry — Editorial Mercantile
 *
 * The palette is printing ink on paper stock with a single vermilion accent.
 * Radii are near-square and shadows are almost entirely removed: elevation is
 * expressed with hairline rules and a step in background tone, the way a
 * printed catalogue separates one cell from the next.
 */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paper stock. The page ground and every raised surface on it.
        paper: {
          DEFAULT: "#F7F6F2",
          50: "#FCFBF9",
          100: "#F7F6F2",
          200: "#EFEDE6",
          300: "#E4E1D8",
        },

        // Printing ink — cool and slightly green, never brown. The warmth in
        // this design comes from the paper, not the type.
        ink: {
          50: "#F1F2F4",
          100: "#E2E5E8",
          200: "#C9CDD3",
          300: "#AAB0B8",
          400: "#8B929C",
          500: "#6F7681",
          600: "#565C67",
          700: "#3D424B",
          800: "#2C3037",
          900: "#1E2126",
          950: "#14161A",
        },

        // The one accent. Price, sale, primary action, and nothing else.
        vermilion: {
          100: "#F7DED5",
          300: "#E89477",
          500: "#DC5430",
          600: "#C8401B",
          700: "#9E2F12",
        },

        // Rules, dividers, and the tone behind an empty image well.
        clay: {
          DEFAULT: "#C9C2B4",
          light: "#DED9CE",
          dark: "#A79E8C",
        },
      },

      fontFamily: {
        sans: ["Inter Tight", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },

      fontSize: {
        // Metadata sizes — always paired with font-mono and wide tracking.
        //
        // These were 10/11/12px, which is too small to read comfortably even
        // with good eyesight; uppercase mono is harder to read than lowercase
        // at any given size, and tracking makes it harder still. Raised to
        // 12/13/14px, with tracking easing off as size grows. None of it
        // stops reading as metadata for being legible.
        "meta-xs": [
          "0.75rem",
          { lineHeight: "1.125rem", letterSpacing: "0.1em" },
        ],
        meta: [
          "0.8125rem",
          { lineHeight: "1.25rem", letterSpacing: "0.085em" },
        ],
        "meta-lg": [
          "0.875rem",
          { lineHeight: "1.375rem", letterSpacing: "0.07em" },
        ],

        // Display sizes. Tracking tightens as size grows, which is how
        // optically-sized type is supposed to behave.
        "display-sm": ["2rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        display: ["2.75rem", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "display-lg": [
          "4rem",
          { lineHeight: "0.98", letterSpacing: "-0.03em" },
        ],
        "display-xl": [
          "5.5rem",
          { lineHeight: "0.94", letterSpacing: "-0.035em" },
        ],
      },

      // Near-square. `full` is kept for things that are genuinely round —
      // avatars, status dots, carousel indicators.
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "3px",
        md: "3px",
        lg: "4px",
        xl: "4px",
        "2xl": "6px",
        "3xl": "8px",
        "4xl": "8px",
        full: "9999px",
      },

      // Only overlays get a shadow. Everything on the page plane uses rules.
      boxShadow: {
        none: "none",
        soft: "0 1px 2px 0 rgba(20,22,26,0.04)",
        medium: "0 2px 8px 0 rgba(20,22,26,0.06)",
        strong: "0 12px 32px -8px rgba(20,22,26,0.18)",
        card: "none",
        "card-hover": "none",
      },

      borderColor: {
        rule: "rgba(20,22,26,0.12)",
        "rule-strong": "rgba(20,22,26,0.24)",
      },

      // Tailwind's default opacity scale steps in fives, but hairline rules
      // need finer control than 10% → 15%. A slash modifier only resolves if
      // its value exists here, so the in-between steps are declared.
      opacity: {
        4: "0.04",
        6: "0.06",
        8: "0.08",
        12: "0.12",
        16: "0.16",
        24: "0.24",
        88: "0.88",
        92: "0.92",
      },

      maxWidth: {
        prose: "62ch",
        shell: "84rem",
      },

      transitionTimingFunction: {
        // Decelerating curve — motion arrives rather than stops.
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
      },

      animation: {
        rise: "rise 0.45s cubic-bezier(0.22,1,0.36,1) both",
        fade: "fade 0.3s cubic-bezier(0.22,1,0.36,1) both",
        "sheet-in": "sheetIn 0.35s cubic-bezier(0.22,1,0.36,1) both",
        marquee: "marquee 42s linear infinite",
      },

      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        sheetIn: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
