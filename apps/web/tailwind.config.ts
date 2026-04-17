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
        DEFAULT: "1rem",
        lg: "1.5rem",
        "2xl": "2rem"
      }
    },
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#f6f1e8",
          raised: "#fdfbf6",
          muted: "#ede4d7",
          line: "#d9cdbc"
        },
        ink: {
          DEFAULT: "#1f2937",
          soft: "#475569",
          muted: "#6b7280",
          inverse: "#f8fafc"
        },
        brand: {
          50: "#eef8f5",
          100: "#d6eee7",
          200: "#aedcce",
          300: "#7fc3b1",
          400: "#4fa491",
          500: "#2f8373",
          600: "#20675b",
          700: "#1a534a",
          800: "#163f39",
          900: "#132f2c"
        },
        ai: {
          50: "#eef5ff",
          100: "#dfeaff",
          200: "#c4d7ff",
          300: "#9cb8ff",
          400: "#7294ff",
          500: "#5773f5",
          600: "#4858d9",
          700: "#3f47b0",
          800: "#353d8d",
          900: "#2f376f"
        },
        sand: {
          50: "#fbf7ef",
          100: "#f5eddc",
          200: "#ead8b6",
          300: "#ddbc84",
          400: "#cf9f56",
          500: "#bc8341",
          600: "#996739",
          700: "#7a4f31",
          800: "#65412d",
          900: "#563729"
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
        sans: ['"Avenir Next"', '"Segoe UI"', '"Helvetica Neue"', "sans-serif"]
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem"
      },
      boxShadow: {
        panel: "0 16px 40px rgba(17, 24, 39, 0.08)",
        "panel-lg": "0 24px 60px rgba(17, 24, 39, 0.12)",
        "brand-glow": "0 18px 44px rgba(47, 131, 115, 0.18)",
        "ai-glow": "0 18px 44px rgba(87, 115, 245, 0.18)"
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top right, rgba(87, 115, 245, 0.14), transparent 28%), radial-gradient(circle at top left, rgba(47, 131, 115, 0.16), transparent 32%), linear-gradient(180deg, rgba(253, 251, 246, 0.96), rgba(246, 241, 232, 0.92))",
        "panel-gradient":
          "linear-gradient(180deg, rgba(253, 251, 246, 0.98), rgba(248, 244, 237, 0.94))",
        "spotlight-grid":
          "linear-gradient(to right, rgba(71, 85, 105, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(71, 85, 105, 0.08) 1px, transparent 1px)"
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
        }
      },
      animation: {
        "float-soft": "float-soft 8s ease-in-out infinite",
        "pulse-soft": "pulse-soft 5s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        "fade-slide-up": "fade-slide-up 320ms ease-out"
      }
    }
  },
  plugins: [forms, animate, flowbite]
} satisfies Config;

export default config;
