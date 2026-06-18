/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
      colors: {
        brand: {
          50: "#EEEDFE",
          100: "#CECBF6",
          200: "#AFA9EC",
          400: "#7F77DD",
          DEFAULT: "#534AB7",
          600: "#3C3489",
          900: "#26215C",
        },
        surface: {
          DEFAULT: "#0b0b14",
          nav: "#0a0a12",
          sidebar: "#0d0d16",
          card: "rgba(255,255,255,0.04)",
        },
        border: {
          dark: "rgba(255,255,255,0.04)",
          subtle: "rgba(255,255,255,0.06)",
          muted: "rgba(255,255,255,0.08)",
        },
        // Colores que usa tu login
        primary: "#534AB7",
        "primary-light": "#7F77DD",
        "primary-dark": "#3C3489",
        "bg-dark": "#0b0b14",
        "bg-dark-secondary": "#0d0d16",
        "bg-dark-tertiary": "rgba(255,255,255,0.04)",
        "text-on-dark": "#ffffff",
        "text-on-dark-muted": "rgba(255,255,255,0.6)",
        "text-muted": "rgba(255,255,255,0.5)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      animation: {
        bounce: "bounce 900ms infinite",
        spin: "spin 0.8s linear infinite",
        fadeIn: "fadeIn 0.22s ease",
      },
      keyframes: {
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};