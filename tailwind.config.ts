import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#0f1b3d", sun: "#ffd23f", paper: "#f4f6f8", mist: "#e3e8ef", ok: "#12805c", bad: "#c0392b" },
      fontFamily: { sans: ["var(--font-body)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
