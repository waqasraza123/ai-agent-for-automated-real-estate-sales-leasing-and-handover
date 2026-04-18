import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import flowbite from "flowbite/plugin";
import animate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}", "./node_modules/flowbite/**/*.js"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.125rem",
        md: "1.25rem",
        lg: "1.75rem",
        xl: "2rem",
        "2xl": "2.5rem"
      }
    },
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#f7f3ec",
          raised: "#fdfaf4",
          muted: "#efe7db",
          line: "#d9d0c2"
        },
        ink: {
          DEFAULT: "#172033",
          soft: "#435064",
          muted: "#687588",
          inverse: "#f8fafc"
        },
        brand: {
          50: "#eff8f5",
          100: "#d8efe8",
          200: "#b3dfd1",
          300: "#84c7b2",
          400: "#58ad95",
          500: "#388b76",
          600: "#286d5d",
          700: "#1f574c",
          800: "#19433b",
          900: "#153530"
        },
        ai: {
          50: "#eef4ff",
          100: "#dde8ff",
          200: "#c2d5ff",
          300: "#9ab8ff",
          400: "#738fff",
          500: "#5a6df3",
          600: "#4d57d8",
          700: "#4448b0",
          800: "#383b8c",
          900: "#30356f"
        },
        sand: {
          50: "#fbf7f0",
          100: "#f5ecdc",
          200: "#ead6b2",
          300: "#ddb880",
          400: "#ce9d58",
          500: "#b88343",
          600: "#95683a",
          700: "#774f31",
          800: "#61412b",
          900: "#533827"
        },
        success: {
          50: "#effaf4",
          100: "#d9f2e2",
          200: "#b7e4c7",
          300: "#83ce9f",
          400: "#51b37a",
          500: "#2f945f",
          600: "#24774d",
          700: "#1f5f40",
          800: "#1c4b35",
          900: "#193d2d"
        },
        warning: {
          50: "#fff8eb",
          100: "#feefc9",
          200: "#fddc8b",
          300: "#fbbc4c",
          400: "#f59e0b",
          500: "#d98409",
          600: "#b8670b",
          700: "#94500f",
          800: "#7a4211",
          900: "#663711"
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d"
        }
      },
      fontFamily: {
        arabic: ['"IBM Plex Sans Arabic"', '"Noto Sans Arabic"', '"Geeza Pro"', "Tahoma", "sans-serif"],
        display: ['"Avenir Next"', '"IBM Plex Sans Arabic"', '"Noto Sans Arabic"', '"Segoe UI"', "sans-serif"],
        sans: ['"Avenir Next"', '"Segoe UI"', '"Helvetica Neue"', '"IBM Plex Sans Arabic"', '"Noto Sans Arabic"', "sans-serif"]
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2rem",
        "5xl": "2.5rem"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15, 23, 42, 0.04), 0 18px 44px rgba(23, 32, 51, 0.09)",
        "panel-lg": "0 2px 4px rgba(15, 23, 42, 0.05), 0 26px 68px rgba(23, 32, 51, 0.12)",
        "panel-soft": "0 12px 28px rgba(23, 32, 51, 0.06)",
        "brand-glow": "0 18px 44px rgba(56, 139, 118, 0.2)",
        "ai-glow": "0 18px 44px rgba(90, 109, 243, 0.18)",
        "focus-soft": "0 0 0 4px rgba(191, 219, 254, 0.45)"
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top right, rgba(90, 109, 243, 0.16), transparent 26%), radial-gradient(circle at top left, rgba(56, 139, 118, 0.18), transparent 32%), radial-gradient(circle at bottom center, rgba(184, 131, 67, 0.09), transparent 36%), linear-gradient(180deg, rgba(253, 250, 244, 0.98), rgba(247, 243, 236, 0.94))",
        "shell-radial":
          "radial-gradient(circle at top, rgba(90, 109, 243, 0.08), transparent 32%), radial-gradient(circle at 15% 20%, rgba(56, 139, 118, 0.1), transparent 28%), linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0))",
        "panel-gradient":
          "linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(251, 247, 241, 0.82))",
        "panel-sheen":
          "radial-gradient(circle at top right, rgba(255, 255, 255, 0.72), transparent 36%), linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0))",
        "spotlight-grid":
          "linear-gradient(to right, rgba(104, 117, 136, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(104, 117, 136, 0.08) 1px, transparent 1px)"
      },
      keyframes: {
        "float-soft": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.04)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "fade-slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "soft-reveal": {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        "float-soft": "float-soft 8s ease-in-out infinite",
        "pulse-soft": "pulse-soft 5s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        "fade-slide-up": "fade-slide-up 320ms cubic-bezier(0.16, 1, 0.3, 1)",
        "soft-reveal": "soft-reveal 420ms cubic-bezier(0.16, 1, 0.3, 1)"
      },
      transitionTimingFunction: {
        "soft-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "soft-in-out": "cubic-bezier(0.65, 0, 0.35, 1)"
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: [forms, animate, flowbite]
} satisfies Config;

export default config;
